import { useEffect, useMemo } from "react";
import { useToast } from "../context/useToast";
import { startAlarmLoop, stopAlarm } from "@/lib/alarmAudio";

export default function GlobalToast() {
    const { toast, clearToast } = useToast();

    const isWarning = toast?.type === "warning";
    const reason = toast?.meta?.reason;
    const isNoFace = isWarning && reason === "no_face";
    const isDistracted = isWarning && reason === "distracted";

    const alarm = Boolean(toast?.meta?.alarm) && isNoFace;
    const count = toast?.meta?.count ?? 0;

    const durationMs = toast?.durationMs ?? 6000;

    // ✅ ALARM sesini burada TEK yerden yönetiyoruz (başla / dur)
    useEffect(() => {
        if (!toast) {
            stopAlarm();
            return;
        }

        if (alarm) {
            startAlarmLoop();
            if (navigator.vibrate) navigator.vibrate([150, 80, 150, 80, 250]);
        } else {
            stopAlarm();
        }

        return () => {
            stopAlarm();
        };
    }, [toast, alarm]);

    const palette = useMemo(() => {
        // 🔴 NO_FACE
        if (isNoFace) {
            return {
                bg: "rgba(220, 38, 38, 0.96)",
                fg: "white",
                badgeBg: "rgba(0,0,0,0.45)",
                badgeFg: "white",
                progress: "rgba(255,255,255,0.65)",
                btnBg: "rgba(0,0,0,0.55)",
                btnFg: "white",
                overlay: alarm ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0.38)",
            };
        }

        // 🟡 distracted warning
        if (isDistracted) {
            return {
                bg: "rgba(255, 186, 0, 0.94)",
                fg: "#151515",
                badgeBg: "rgba(0,0,0,0.18)",
                badgeFg: "#111",
                progress: "rgba(0,0,0,0.30)",
                btnBg: "rgba(0,0,0,0.25)",
                btnFg: "white",
                overlay: "rgba(0,0,0,0.14)",
            };
        }

        // default warning
        if (isWarning) {
            return {
                bg: "rgba(255, 186, 0, 0.94)",
                fg: "#151515",
                badgeBg: "rgba(0,0,0,0.18)",
                badgeFg: "#111",
                progress: "rgba(0,0,0,0.30)",
                btnBg: "rgba(0,0,0,0.25)",
                btnFg: "white",
                overlay: "rgba(0,0,0,0.16)",
            };
        }

        // info
        return {
            bg: "rgba(36, 122, 255, 0.94)",
            fg: "white",
            badgeBg: "rgba(255,255,255,0.20)",
            badgeFg: "white",
            progress: "rgba(255,255,255,0.45)",
            btnBg: "rgba(0,0,0,0.25)",
            btnFg: "white",
            overlay: "rgba(0,0,0,0.12)",
        };
    }, [isWarning, isNoFace, isDistracted, alarm]);

    if (!toast) return null;

    const title = isNoFace
        ? alarm
            ? `KAMERA KAYBI (ALARM) #${count}`
            : `KAMERA KAYBI #${count}`
        : isDistracted
            ? "Dikkat"
            : isWarning
                ? "Uyarı"
                : "Bilgi";

    const icon = isNoFace ? "🚨" : isWarning ? "⚠️" : "ℹ️";

    const closeAll = () => {
        stopAlarm();   // ✅ önce sesi kes
        clearToast();  // ✅ sonra toast kapat
    };

    return (
        <>
            <style>{`
        @keyframes toastShake {
          0%, 100% { transform: translate(-50%, 0px); }
          15% { transform: translate(-50%, 0px) translateX(-3px); }
          30% { transform: translate(-50%, 0px) translateX(3px); }
          45% { transform: translate(-50%, 0px) translateX(-2px); }
          60% { transform: translate(-50%, 0px) translateX(2px); }
          75% { transform: translate(-50%, 0px) translateX(-1px); }
        }
        @keyframes toastEnter {
          0%   { transform: translate(-50%, -16px) scale(0.98); opacity: 0; }
          100% { transform: translate(-50%, 0px) scale(1); opacity: 1; }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes alarmPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(220,38,38,0.0); }
          50% { box-shadow: 0 0 0 12px rgba(220,38,38,0.22); }
        }
      `}</style>

            {/* overlay */}
            <div
                onClick={closeAll}
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 99998,
                    background: palette.overlay,
                    backdropFilter: alarm ? "blur(2px)" : "blur(1px)",
                    WebkitBackdropFilter: alarm ? "blur(2px)" : "blur(1px)",
                    cursor: "pointer",
                }}
                aria-hidden="true"
            />

            <div
                role="alert"
                aria-live="assertive"
                style={{
                    position: "fixed",
                    top: alarm ? "20%" : 18,
                    left: "50%",
                    zIndex: 99999,
                    width: "min(780px, calc(100vw - 24px))",
                    transform: "translate(-50%, 0px)",
                    animation: isWarning ? "toastShake 420ms ease-in-out 1" : undefined,
                }}
            >
                <div
                    style={{
                        borderRadius: 18,
                        background: palette.bg,
                        color: palette.fg,
                        boxShadow: alarm
                            ? "0 22px 90px rgba(0,0,0,0.62)"
                            : "0 18px 60px rgba(0,0,0,0.45)",
                        padding: alarm ? "18px" : "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        animation: alarm
                            ? "toastEnter 200ms ease-out 1, alarmPulse 900ms ease-in-out infinite"
                            : "toastEnter 200ms ease-out 1",
                    }}
                >
                    <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                        <div
                            style={{
                                width: alarm ? 44 : 38,
                                height: alarm ? 44 : 38,
                                borderRadius: 14,
                                display: "grid",
                                placeItems: "center",
                                fontSize: alarm ? 22 : 18,
                                background: palette.badgeBg,
                                color: palette.badgeFg,
                                flexShrink: 0,
                            }}
                        >
                            {icon}
                        </div>

                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 950, fontSize: alarm ? 16 : 14 }}>
                                {title}
                            </div>
                            <div style={{ fontSize: alarm ? 16 : 14, fontWeight: 850 }}>
                                {toast.message}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            closeAll();
                        }}
                        style={{
                            background: palette.btnBg,
                            color: palette.btnFg,
                            border: "none",
                            borderRadius: 12,
                            padding: alarm ? "12px 14px" : "10px 12px",
                            fontWeight: 950,
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        Kapat
                    </button>
                </div>

                {/* progress */}
                <div
                    style={{
                        height: 4,
                        marginTop: 10,
                        borderRadius: 999,
                        overflow: "hidden",
                        background: "rgba(0,0,0,0.15)",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            background: palette.progress,
                            animation: `toastProgress ${durationMs}ms linear 1`,
                        }}
                    />
                </div>
            </div>
        </>
    );
}
