import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { insertOdakKaydi } from "./odak";
import { getGenelAlanId } from "./alan";
import { useToast } from "@/context/useToast.ts";
import { useFocusTracking } from "@/context/useFocusTracking.ts";
import type { CameraState } from "@/types/focus.ts";





type FocusState =
    | "focused"
    | "distracted"
    | "no_face"
    | "no_permission"
    | "loading"
    | "error";

type Props = {
    trackingEnabled?: boolean;
};


const TICK_MS = 800;
const WRITE_MIN_MS = 15000;
const FOCUS_GRACE_MS = 2000;

// mola uyarısı
const LOW_FOCUS_THRESHOLD = 40; // %
const LOW_FOCUS_CONSECUTIVE_TICKS = 5; // ~4sn (800ms tick)
const BREAK_HINT_COOLDOWN_MS = 10000; // 10sn

// yüz yok uyarısı
const NO_FACE_TOAST_DELAY_MS = 1500; // 1.5sn yüz yoksa uyar
const NO_FACE_TOAST_COOLDOWN_MS = 20000; // 20sn’de bir tekrar uyar

// iris indexleri
const LEFT_IRIS = [468, 469, 470, 471, 472];
const RIGHT_IRIS = [473, 474, 475, 476, 477];

// göz köşeleri
const L_OUTER = 33,
    L_INNER = 133;
const R_OUTER = 362,
    R_INNER = 263;

function avgPoint(pts: { x: number; y: number }[], idx: number[]) {
    let x = 0,
        y = 0;
    for (const i of idx) {
        x += pts[i].x;
        y += pts[i].y;
    }
    return { x: x / idx.length, y: y / idx.length };
}

function clamp01(v: number) {
    return Math.max(0, Math.min(1, v));
}

function toCameraState(s: FocusState): CameraState {
    if (s === "focused") return "focused";
    if (s === "distracted") return "distracted";
    if (s === "no_face") return "no_face";
    if (s === "error") return "error";
    return "loading";
}

export default function FocusCamera({ trackingEnabled = true }: Props) {
    const alanIdRef = useRef<string | null>(null);
    const { pushToast } = useToast();
    const { setCameraTelemetry } = useFocusTracking();

    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // yüz yok uyarıları
    const noFaceSinceRef = useRef<number | null>(null);
    const lastNoFaceToastAtRef = useRef<number>(0);

    const [hasPermission, setHasPermission] = useState(false);
    const [status, setStatus] = useState<FocusState>("loading");
    const [confidence, setConfidence] = useState(0);
    const [errText, setErrText] = useState("");

    const lastFocusedAtRef = useRef<number>(0);

    // DB spam kontrol
    const lastStateRef = useRef<FocusState | null>(null);
    const lastWriteAtRef = useRef<number>(0);

    // mola uyarısı state
    const [showBreakHint, setShowBreakHint] = useState(false);
    const lowCountRef = useRef(0);
    const lastBreakHintAtRef = useRef(0);

    const stopCamera = () => {
        const v = videoRef.current;

        if (v?.srcObject) {
            const s = v.srcObject as MediaStream;
            s.getTracks().forEach((t) => t.stop());
            v.srcObject = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    };

    // ✅ MediaPipe yükle (1 kere)
    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );
                if (cancelled) return;

                const lm = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
                    },
                    runningMode: "VIDEO",
                    numFaces: 1,
                    outputFaceBlendshapes: false,
                    outputFacialTransformationMatrixes: false,
                });

                if (cancelled) return;
                landmarkerRef.current = lm;
            } catch (e: unknown) {
                console.error(e);
                setErrText("MediaPipe yüklenemedi (CDN engeli olabilir).");
                setStatus("error");
            }
        }

        void init();
        return () => {
            cancelled = true;
            landmarkerRef.current = null;
        };
    }, []);

    // ✅ trackingEnabled değişince: kapalıysa kamerayı kapat + reset
    useEffect(() => {
        if (!trackingEnabled) {
            stopCamera();

            setTimeout(() => {
                setHasPermission(false);
                setShowBreakHint(false);
                setConfidence(0);
                setStatus("loading");
                setErrText("");
            }, 0);

            // reset sayaçlar
            lowCountRef.current = 0;
            lastStateRef.current = null;
            lastWriteAtRef.current = 0;

            // ✅ no-face reset
            noFaceSinceRef.current = null;
            lastNoFaceToastAtRef.current = 0;

            setCameraTelemetry("off", 0);
            return;
        }

        setCameraTelemetry("loading", 0);
    }, [trackingEnabled, setCameraTelemetry]);

    // ✅ kamera aç
    useEffect(() => {
        let alive = true;

        async function startCam() {
            if (!trackingEnabled) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                    audio: false,
                });

                if (!alive) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                streamRef.current = stream;

                const v = videoRef.current;
                if (v) {
                    await new Promise(requestAnimationFrame);
                    v.srcObject = stream;
                    await v.play().catch(() => {});
                }

                setHasPermission(true);
                setStatus("distracted");
                setErrText("");
            } catch (e: unknown) {
                console.error(e);
                setErrText("Kamera izni verilemedi / kamera açılamadı.");
                setStatus("error");
                setHasPermission(false);
                setCameraTelemetry("error", 0);
            }
        }

        void startCam();

        return () => {
            alive = false;
            stopCamera();
        };
    }, [trackingEnabled, setCameraTelemetry]);

    // ✅ odak kararı
    useEffect(() => {
        if (!hasPermission) return;
        if (!trackingEnabled) return;

        let stopped = false;

        async function tick() {
            if (stopped) return;

            try {
                const v = videoRef.current;
                const lm = landmarkerRef.current;
                if (!v || !lm) return;

                if (!v.videoWidth || !v.videoHeight) return;
                if (document.visibilityState !== "visible") return;

                const res = lm.detectForVideo(v, performance.now());
                const faces = res.faceLandmarks;

                let nextState: FocusState;
                let conf: number;

                if (!faces || faces.length === 0) {
                    nextState = "no_face";
                    conf = 0.2;
                } else {
                    const pts = faces[0];

                    const li = avgPoint(pts, LEFT_IRIS);
                    const ri = avgPoint(pts, RIGHT_IRIS);

                    const lOuter = pts[L_OUTER],
                        lInner = pts[L_INNER];
                    const rOuter = pts[R_OUTER],
                        rInner = pts[R_INNER];

                    const lDenX = lInner.x - lOuter.x || 1e-6;
                    const rDenX = rOuter.x - rInner.x || 1e-6;

                    const lRatioX = clamp01((li.x - lOuter.x) / lDenX);
                    const rRatioX = clamp01((ri.x - rInner.x) / rDenX);

                    const lDist = Math.abs(lRatioX - 0.5);
                    const rDist = Math.abs(rRatioX - 0.5);

                    const lookingX = lDist < 0.11 && rDist < 0.11;
                    const gazeScore = clamp01(1 - (lDist + rDist) / 0.22);

                    if (lookingX && gazeScore > 0.35) {
                        nextState = "focused";
                        lastFocusedAtRef.current = Date.now();
                        conf = clamp01(0.55 + 0.45 * gazeScore);
                    } else {
                        const recentlyFocused =
                            Date.now() - lastFocusedAtRef.current < FOCUS_GRACE_MS;

                        if (recentlyFocused) {
                            nextState = "focused";
                            conf = 0.45;
                        } else {
                            nextState = "distracted";
                            conf = clamp01(0.25 + 0.20 * gazeScore);
                        }
                    }
                }

                setStatus(nextState);
                setConfidence(conf);

                // ✅ Dashboard telemetry
                setCameraTelemetry(toCameraState(nextState), conf);

                // ✅ Yüz yok uyarısı (delay + cooldown)
                if (nextState === "no_face") {
                    if (!noFaceSinceRef.current) noFaceSinceRef.current = Date.now();

                    const noFaceForMs = Date.now() - noFaceSinceRef.current;
                    const canToast =
                        Date.now() - lastNoFaceToastAtRef.current > NO_FACE_TOAST_COOLDOWN_MS;

                    if (noFaceForMs >= NO_FACE_TOAST_DELAY_MS && canToast) {
                        lastNoFaceToastAtRef.current = Date.now();

                        // ✅ Sayaç sadece toast atınca artsın
                        const prevCount = Number(localStorage.getItem("no_face_toast_count") ?? "0");
                        const nextCount = prevCount + 1;
                        localStorage.setItem("no_face_toast_count", String(nextCount));

                        pushToast(
                            "Yüzünüz kayboldu. İlerlemeniz kaydedilmeyecek. Kameraya geri bakın 👀",
                            {
                                type: "warning",
                                durationMs: 6500,
                                meta: {
                                    reason: "no_face",
                                    count: nextCount,
                                    alarm: nextCount >= 3, // ✅ 3. kez alarm
                                },
                            }
                        );
                    }
                } else {
                    // ✅ yüz geri geldi -> episode reset + sayaç sıfırla
                    noFaceSinceRef.current = null;
                    localStorage.setItem("no_face_toast_count", "0");
                }


                // ✅ mola uyarısı
                const percent = Math.round(conf * 100);
                if (nextState === "distracted" && percent <= LOW_FOCUS_THRESHOLD) {
                    lowCountRef.current += 1;
                } else {
                    lowCountRef.current = 0;
                    setShowBreakHint(false);
                }

                if (lowCountRef.current >= LOW_FOCUS_CONSECUTIVE_TICKS) {
                    const now = Date.now();
                    if (now - lastBreakHintAtRef.current > BREAK_HINT_COOLDOWN_MS) {
                        lastBreakHintAtRef.current = now;
                        setShowBreakHint(true);
                        pushToast(
                            "Odağın çok düştü. Verimin azalıyor olabilir — 2-3 dk mola ver, su iç, kahve al ☕",
                            {
                                type: "warning",
                                durationMs: 8000,
                                meta: { reason: "distracted" }, // ✅ sarı + az karartma
                            }
                        );

                    }
                }

                // ✅ DB yaz (yüz yokken yazma)
                const now = Date.now();
                const stateChanged = lastStateRef.current !== nextState;
                const periodic = now - lastWriteAtRef.current >= WRITE_MIN_MS;

                const shouldPersist = nextState === "focused" || nextState === "distracted";


                if (shouldPersist && (stateChanged || periodic)) {
                    if (!alanIdRef.current) {
                        try {
                            alanIdRef.current = await getGenelAlanId();
                        } catch {
                            alanIdRef.current = null;
                        }
                    }


                    await insertOdakKaydi({
                        alan_id: alanIdRef.current, // null da olabilir
                        odaklanmis_mi: nextState === "focused",
                        guven_skoru: conf,
                    });


                    lastStateRef.current = nextState;
                    lastWriteAtRef.current = now;
                }

            } catch (e: unknown) {
                console.error("MediaPipe tick error:", e);
                const msg =
                    e instanceof Error ? e.message : "MediaPipe odak algılama hatası.";
                setErrText(msg);
                setStatus("error");
                setCameraTelemetry("error", 0);
            }
        }

        void tick();
        const id = window.setInterval(() => void tick(), TICK_MS);

        return () => {
            stopped = true;
            window.clearInterval(id);
        };
    }, [hasPermission, trackingEnabled, pushToast, setCameraTelemetry]);

    const label =
        status === "focused"
            ? "ODAKLI ✅"
            : status === "distracted"
                ? "DAĞINIK ⚠️"
                : status === "no_face"
                    ? "YÜZ YOK ❌"
                    : status === "no_permission"
                        ? "İZİN YOK"
                        : status === "loading"
                            ? "YÜKLENİYOR…"
                            : "HATA";

    return (
        <div style={{ padding: 16 }}>
            <div
                style={{
                    maxWidth: 900,
                    margin: "0 auto",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(0,0,0,0.35)",
                }}
            >
                <div
                    style={{
                        padding: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        color: "white",
                    }}
                >
                    <div style={{ fontWeight: 700 }}>Odak Takip </div>
                    <div>
                        Durum: <b>{label}</b> &nbsp; | &nbsp; Güven:{" "}
                        <b>{confidence.toFixed(2)}</b>
                    </div>
                </div>

                <div
                    style={{
                        position: "relative",
                        background: "black",
                        aspectRatio: "16 / 9" as unknown as number,
                    }}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transform: "scaleX(-1)",
                            opacity: 0.95,
                        }}
                    />

                    {showBreakHint && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: 12,
                                left: 12,
                                right: 12,
                                padding: "10px 12px",
                                borderRadius: 12,
                                background: "rgba(255, 180, 0, 0.88)",
                                color: "#111",
                                fontWeight: 800,
                                fontSize: 13,
                                textAlign: "center",
                            }}
                        >
                            Odağın çok düştü. Verimin azalıyor olabilir — istersen 2-3 dk mola
                            ver ☕
                        </div>
                    )}

                    {!trackingEnabled && (
                        <div
                            style={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                padding: "8px 10px",
                                borderRadius: 12,
                                background: "rgba(0,0,0,0.60)",
                                color: "white",
                                fontWeight: 800,
                                fontSize: 12,
                            }}
                        >
                            TAKİP KAPALI
                        </div>
                    )}
                </div>

                {errText && (
                    <div
                        style={{
                            padding: 12,
                            color: "#ffb4b4",
                            borderTop: "1px solid rgba(255,0,0,0.25)",
                        }}
                    >
                        {errText}
                    </div>
                )}
            </div>
        </div>
    );
}
