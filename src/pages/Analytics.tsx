import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Clock,
    TrendingUp,
    Calendar,
    Zap,
    Target,
    Percent,
    BarChart3,
    Activity,
    Flame,
    BadgeCheck,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type WeeklyPoint = {
    name: string; // short label
    iso: string; // YYYY-MM-DD (or bin key)
    saat: number;
    heightPct: number; // 0-100
    score: number; // 0-100
    samples: number;
    focusedSamples: number;
    // for binned points
    rangeLabel?: string; // e.g., "01-05"
    rangeSubLabel?: string; // e.g., "24 Ara - 28 Ara"
};

type OdakKaydiRow = {
    odaklanmis_mi: boolean;
    guven_skoru: number | null; // 0..1
    olusturulma_tarihi: string;
};

type CSSVars = React.CSSProperties & {
    ["--h"]?: string;
    ["--donut-dash"]?: number;
    ["--donut-c"]?: number;
};

const WRITE_SAMPLE_SECONDS = 15;

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}
function fmt1(n: number) {
    return Number(n.toFixed(1));
}

/**
 * ✅ FIX: Bugün/Dün boş görünme sorununu kalıcı çözer
 * - dayKey daima Europe/Istanbul gününe göre
 * - Query aralığı: start (rangeDays-1 gün önce 00:00 TR) .. end (yarın 00:00 TR)
 * - Grouping & streak Istanbul iso ile
 */

const IST_TZ = "Europe/Istanbul";

function dayKey(d: Date) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: IST_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(d); // YYYY-MM-DD
}

function dateFromIsoLocal(iso: string) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function formatTRDate(iso: string) {
    const d = dateFromIsoLocal(iso);
    return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(d);
}

function weekdayShortTR(iso: string) {
    const d = dateFromIsoLocal(iso);
    return new Intl.DateTimeFormat("tr-TR", {
        weekday: "short",
        timeZone: IST_TZ,
    }).format(d);
}

function relDayTR(iso: string) {
    const todayIso = dayKey(new Date());

    if (iso === todayIso) return "Bugün";

    // Dün kontrolü: iso gününün +1'i bugüne eşitse
    const d = dateFromIsoLocal(iso);
    d.setDate(d.getDate() + 1);
    if (dayKey(d) === todayIso) return "Dün";

    // 2 gün önce (isteğe bağlı)
    const d2 = dateFromIsoLocal(iso);
    d2.setDate(d2.getDate() + 2);
    if (dayKey(d2) === todayIso) return "2 gün önce";

    return formatTRDate(iso);
}

function computeBarHeights(points: WeeklyPoint[]) {
    const maxHours = Math.max(0.001, ...points.map((p) => p.saat));
    return points.map((p) => ({
        ...p,
        heightPct: Math.round((p.saat / maxHours) * 100),
    }));
}

/**
 * 30 gün için barları tek tek göstermek yerine "bin" yapıyoruz.
 * binSize=5 => 30 gün = 6 bar (sayfayı şişirmez)
 */
function binPoints(points: WeeklyPoint[], binSize: number): WeeklyPoint[] {
    if (points.length <= binSize) return points;

    const out: WeeklyPoint[] = [];
    for (let i = 0; i < points.length; i += binSize) {
        const chunk = points.slice(i, i + binSize);
        const sumSaat = chunk.reduce((a, b) => a + b.saat, 0);
        const sumSamples = chunk.reduce((a, b) => a + b.samples, 0);
        const sumFocused = chunk.reduce((a, b) => a + b.focusedSamples, 0);

        // score: weighted by samples (daha gerçekçi)
        const weightedScore =
            sumSamples > 0 ? Math.round(chunk.reduce((acc, p) => acc + p.score * p.samples, 0) / sumSamples) : 0;

        const startIso = chunk[0]?.iso ?? "";
        const endIso = chunk[chunk.length - 1]?.iso ?? "";

        const rangeLabel = `${String(i + 1).padStart(2, "0")}-${String(Math.min(i + binSize, points.length)).padStart(
            2,
            "0"
        )}`;

        const rangeSubLabel = startIso && endIso ? `${formatTRDate(startIso)} - ${formatTRDate(endIso)}` : "";

        out.push({
            name: rangeLabel,
            iso: startIso || `${i}`,
            saat: fmt1(sumSaat),
            heightPct: 0,
            score: weightedScore,
            samples: sumSamples,
            focusedSamples: sumFocused,
            rangeLabel,
            rangeSubLabel,
        });
    }

    return computeBarHeights(out);
}

/** Sparkline with hover tooltip */
function Sparkline({
                       values,
                       labels,
                       animateKey,
                   }: {
    values: number[];
    labels: string[];
    animateKey: number;
}) {
    const w = 300;
    const h = 78;
    const pad = 10;

    const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

    const max = Math.max(1, ...values);
    const min = Math.min(0, ...values);

    const xStep = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
    const yScale = (v: number) => {
        const t = (v - min) / (max - min || 1);
        return h - pad - t * (h - pad * 2);
    };

    const pts = values.map((v, i) => {
        const x = pad + i * xStep;
        const y = yScale(v);
        return { x, y, v };
    });

    const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    const hovered = hoverIdx !== null ? pts[hoverIdx] : null;
    const hoveredLabel = hoverIdx !== null ? labels[hoverIdx] : "";

    return (
        <div className="relative">
            {hovered ? (
                <div
                    className="pointer-events-none absolute z-20"
                    style={{
                        left: hovered.x,
                        top: hovered.y,
                        transform: "translate(-50%, -120%)",
                    }}
                >
                    <div className="bg-slate-900 text-white text-xs font-black px-3 py-2 rounded-xl shadow-xl whitespace-nowrap">
                        {hoveredLabel} • Skor: {hovered.v}
                        <div className="mx-auto mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                </div>
            ) : null}

            <svg
                key={animateKey}
                width={w}
                height={h}
                viewBox={`0 0 ${w} ${h}`}
                className="block"
                onMouseLeave={() => setHoverIdx(null)}
                aria-label="Skor trend grafiği"
            >
                <defs>
                    <linearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(99,102,241,0.95)" />
                        <stop offset="100%" stopColor="rgba(59,130,246,0.95)" />
                    </linearGradient>
                    <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(99,102,241,0.22)" />
                        <stop offset="100%" stopColor="rgba(59,130,246,0.05)" />
                    </linearGradient>
                </defs>

                <path
                    d={`${pathD} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`}
                    fill="url(#sparkFill)"
                    stroke="none"
                    className="sparkFillIn"
                />
                <path
                    d={pathD}
                    fill="none"
                    stroke="url(#sparkLine)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    className="sparkLineScale"
                />

                {pts.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={4}
                        fill="white"
                        stroke="rgba(99,102,241,0.95)"
                        strokeWidth={2}
                        className="sparkDotPop"
                        style={{ animationDelay: `${120 + i * 60}ms` }}
                        onMouseEnter={() => setHoverIdx(i)}
                    />
                ))}
            </svg>
        </div>
    );
}

// Donut chart for focus ratio
function Donut({
                   percent,
                   animateKey,
                   tooltip,
               }: {
    percent: number;
    animateKey: number;
    tooltip: string;
}) {
    const p = clamp(percent, 0, 100);
    const size = 132;
    const stroke = 14;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = (p / 100) * c;

    return (
        <div className="relative w-[132px] h-[132px] group">
            <svg key={animateKey} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
                <defs>
                    <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgba(99,102,241,0.95)" />
                        <stop offset="100%" stopColor="rgba(34,197,94,0.95)" />
                    </linearGradient>
                </defs>

                <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(15,23,42,0.08)" strokeWidth={stroke} fill="none" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke="url(#donutGrad)"
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${c - dash}`}
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    className="donutReveal"
                    style={{ ["--donut-dash"]: dash, ["--donut-c"]: c } as CSSVars}
                />
            </svg>

            <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                    <div className="text-3xl font-black text-slate-900">{Math.round(p)}%</div>
                    <div className="text-xs font-bold text-slate-500 -mt-0.5">Odak Oranı</div>
                </div>
            </div>

            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 -translate-y-full opacity-0 group-hover:opacity-100 transition">
                <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl whitespace-nowrap">
                    {tooltip}
                    <div className="mx-auto mt-1 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
            </div>
        </div>
    );
}

function Toggle({ value, onChange }: { value: 7 | 30; onChange: (v: 7 | 30) => void }) {
    return (
        <div className="inline-flex rounded-2xl bg-slate-900/5 border border-slate-200 p-1">
            {[7, 30].map((n) => {
                const active = value === (n as 7 | 30);
                return (
                    <button
                        key={n}
                        onClick={() => onChange(n as 7 | 30)}
                        className={[
                            "px-3 py-1.5 rounded-xl text-sm font-black transition",
                            active ? "bg-white shadow-sm text-slate-900 border border-white" : "text-slate-500 hover:text-slate-800",
                        ].join(" ")}
                    >
                        {n} gün
                    </button>
                );
            })}
        </div>
    );
}

const Analytics = () => {
    const navigate = useNavigate();

    const [rangeDays, setRangeDays] = React.useState<7 | 30>(7);

    const [dailyPoints, setDailyPoints] = React.useState<WeeklyPoint[]>([]);
    const [loading, setLoading] = React.useState(true);

    const [totalHours, setTotalHours] = React.useState(0);
    const [dailyAvgHours, setDailyAvgHours] = React.useState(0);
    const [bestDayLabel, setBestDayLabel] = React.useState<string>("-");
    const [bestDayHours, setBestDayHours] = React.useState(0);
    const [avgScore, setAvgScore] = React.useState<number | null>(null);
    const [focusRate, setFocusRate] = React.useState<number>(0);

    const [todayHours, setTodayHours] = React.useState(0);
    const [todayScore, setTodayScore] = React.useState<number | null>(null);
    const [streakDays, setStreakDays] = React.useState(0);

    // animation trigger
    const [animateBars, setAnimateBars] = React.useState(false);
    const [animateKey, setAnimateKey] = React.useState(0);

    const fetchAuthUserId = async (): Promise<string | null> => {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user?.id) return null;
        return data.user.id;
    };

    const getAppUserId = React.useCallback(async (): Promise<string | null> => {
        const authUserId = await fetchAuthUserId();
        if (!authUserId) return null;

        const { data, error } = await supabase
            .from("kullanicilar")
            .select("id")
            .eq("auth_user_id", authUserId)
            .maybeSingle();

        if (error) return null;
        return data?.id ?? null;
    }, []);

    React.useEffect(() => {
        let alive = true;

        const run = async () => {
            if (!alive) return;

            try {
                setLoading(true);
                setAnimateBars(false);

                const appUserId = await getAppUserId();
                if (!appUserId) {
                    setDailyPoints([]);
                    setAvgScore(null);
                    setTotalHours(0);
                    setDailyAvgHours(0);
                    setBestDayLabel("-");
                    setBestDayHours(0);
                    setFocusRate(0);
                    setTodayHours(0);
                    setTodayScore(null);
                    setStreakDays(0);
                    return;
                }

                // ✅ start: (rangeDays-1 gün önce) 00:00
                const start = new Date();
                start.setDate(start.getDate() - (rangeDays - 1));
                start.setHours(0, 0, 0, 0);

                // ✅ end: yarın 00:00 (today dahil olsun)
                const end = new Date();
                end.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() + 1);

                // ✅ FIX: Supabase 1000 limit -> pagination
                const PAGE = 1000;
                let from = 0;
                let all: OdakKaydiRow[] = [];

                while (true) {
                    const { data, error } = await supabase
                        .from("odak_kayitlari")
                        .select("odaklanmis_mi, guven_skoru, olusturulma_tarihi")
                        .eq("kullanici_id", appUserId)
                        .gte("olusturulma_tarihi", start.toISOString())
                        .lt("olusturulma_tarihi", end.toISOString())
                        .order("olusturulma_tarihi", { ascending: true })
                        .range(from, from + PAGE - 1);

                    if (error) {
                        console.error("[Analytics] odak_kayitlari page error:", error);
                        setDailyPoints([]);
                        return;
                    }

                    const chunk = (data ?? []) as OdakKaydiRow[];
                    all = all.concat(chunk);

                    if (chunk.length < PAGE) break;
                    from += PAGE;
                }

                const rows = all;

                if (!alive) return;

                // Day grouping (Istanbul dayKey)
                const byDay = new Map<string, { focused: number; total: number; scoreSum: number; scoreCount: number }>();

                let totalSamples = 0;
                let focusedSamples = 0;

                for (const r of rows) {
                    const dt = new Date(r.olusturulma_tarihi);
                    const key = dayKey(dt); // ✅ Istanbul key

                    const v = byDay.get(key) ?? { focused: 0, total: 0, scoreSum: 0, scoreCount: 0 };
                    v.total += 1;
                    totalSamples += 1;

                    if (r.odaklanmis_mi) {
                        v.focused += 1;
                        focusedSamples += 1;
                    }

                    const sc = r.guven_skoru;
                    if (typeof sc === "number" && Number.isFinite(sc)) {
                        v.scoreSum += sc;
                        v.scoreCount += 1;
                    }

                    byDay.set(key, v);
                }

                // Build points (rangeDays)
                const points: WeeklyPoint[] = [];
                for (let i = 0; i < rangeDays; i++) {
                    const d = new Date(start);
                    d.setDate(start.getDate() + i);

                    const iso = dayKey(d); // ✅ Istanbul day key
                    const v = byDay.get(iso) ?? { focused: 0, total: 0, scoreSum: 0, scoreCount: 0 };

                    const hours = (v.focused * WRITE_SAMPLE_SECONDS) / 3600;
                    const score = v.scoreCount > 0 ? Math.round((v.scoreSum / v.scoreCount) * 100) : 0;

                    points.push({
                        name: weekdayShortTR(iso),
                        iso,
                        saat: fmt1(hours),
                        heightPct: 0,
                        score,
                        samples: v.total,
                        focusedSamples: v.focused,
                    });
                }

                const withHeights = computeBarHeights(points);
                setDailyPoints(withHeights);

                // KPIs
                const sumHours = points.reduce((a, b) => a + b.saat, 0);
                setTotalHours(fmt1(sumHours));
                setDailyAvgHours(fmt1(sumHours / rangeDays));

                const best = points.reduce((acc, p) => (p.saat > acc.saat ? p : acc), points[0]);
                setBestDayLabel(best?.name ?? "-");
                setBestDayHours(best?.saat ?? 0);

                const allScores = rows
                    .map((r) => (typeof r.guven_skoru === "number" ? r.guven_skoru : NaN))
                    .filter((n) => Number.isFinite(n));

                setAvgScore(
                    allScores.length ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100) : null
                );

                setFocusRate(totalSamples > 0 ? (focusedSamples / totalSamples) * 100 : 0);

                // Today (Istanbul)
                const todayIso = dayKey(new Date());
                const t = byDay.get(todayIso) ?? { focused: 0, total: 0, scoreSum: 0, scoreCount: 0 };
                setTodayHours(fmt1((t.focused * WRITE_SAMPLE_SECONDS) / 3600));
                setTodayScore(t.scoreCount ? Math.round((t.scoreSum / t.scoreCount) * 100) : null);

                // Streak: bugünden geriye (Istanbul iso)
                let streak = 0;
                for (let back = 0; back < rangeDays; back++) {
                    const dd = new Date();
                    dd.setHours(0, 0, 0, 0);
                    dd.setDate(dd.getDate() - back);
                    const iso = dayKey(dd);

                    const v = byDay.get(iso);
                    if (v && v.focused > 0) streak += 1;
                    else break;
                }
                setStreakDays(streak);

                requestAnimationFrame(() => {
                    setAnimateKey((k) => k + 1);
                    setAnimateBars(true);
                });
            } finally {
                setLoading(false);
            }
        };

        void run();

        const t = window.setInterval(() => {
            void run();
        }, 30_000);

        return () => {
            alive = false;
            window.clearInterval(t);
        };
    }, [rangeDays, getAppUserId]);

    const scoreTrend = React.useMemo(() => dailyPoints.map((p) => p.score), [dailyPoints]);
    const scoreLabels = React.useMemo(
        () => dailyPoints.map((p) => `${relDayTR(p.iso)} • ${weekdayShortTR(p.iso)}`),
        [dailyPoints]
    );

    // Bars: if 30 days => bin to 6 bars (5-day bins)
    const barPoints = React.useMemo(() => {
        if (rangeDays === 30) return binPoints(dailyPoints, 5);
        return dailyPoints;
    }, [dailyPoints, rangeDays]);

    const barMaxHours = Math.max(0.001, ...barPoints.map((p) => p.saat));

    const donutTooltip = `${Math.round(focusRate)}% (odaklı kayıt / toplam kayıt)`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 p-4 sm:p-6">
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0px); }
        }
        @keyframes barGrow {
          from { height: 0%; filter: brightness(0.95); }
          to { height: var(--h); filter: brightness(1); }
        }
        @keyframes donutDash {
          from { stroke-dasharray: 0 var(--donut-c); }
          to { stroke-dasharray: var(--donut-dash) calc(var(--donut-c) - var(--donut-dash)); }
        }
        @keyframes sparkFill {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0px); }
        }
        @keyframes dotPop {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes lineScaleX {
          from { transform: scaleX(0); opacity: 0.15; }
          to { transform: scaleX(1); opacity: 1; }
        }
        .enterAnim { animation: fadeUp 420ms ease-out both; }
        .donutReveal { animation: donutDash 700ms ease-out both; }
        .sparkFillIn { animation: sparkFill 650ms ease-out both; }

        /* ✅ FIX: shorthand animation kaldırıldı (animationDelay warning biter) */
        .sparkDotPop {
          transform-origin: center;
          animation-name: dotPop;
          animation-duration: 360ms;
          animation-timing-function: ease-out;
          animation-fill-mode: both;
        }

        .sparkLineScale { transform-origin: left center; animation: lineScaleX 700ms ease-out both; }
      `}</style>

            {/* TOP BAR */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-6 enterAnim">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-700 font-extrabold hover:text-indigo-600 transition"
                >
                    <ArrowLeft size={20} />
                    Geri
                </button>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Zap className="text-indigo-600 fill-indigo-600" />
                    Odak Analizi
                </h1>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex text-xs sm:text-sm font-bold text-slate-500 items-center gap-2">
                        <Calendar size={18} />
                        {rangeDays} Gün
                    </div>
                    <Toggle value={rangeDays} onChange={setRangeDays} />
                </div>
            </div>

            {/* MAIN CARD */}
            <div
                className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 sm:p-8 enterAnim"
                style={{ animationDelay: "60ms" }}
            >
                {/* HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-800 font-black text-xs border border-indigo-200">
                            <BarChart3 size={14} />
                            Kamera kayıtlarından otomatik
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
                            Odak Performansı ({rangeDays} gün)
                        </h2>

                        <p className="text-slate-600 font-medium mt-2">
                            Odak süresi, FocusCamera kayıtları (15sn sample) üzerinden hesaplanır.
                            {avgScore !== null ? <span className="ml-2 text-indigo-700 font-black">Ort. Odak Skoru: {avgScore}</span> : null}
                        </p>
                    </div>

                    {/* DONUT + TREND */}
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                        <div className="bg-white/70 rounded-2xl border border-white/70 shadow-sm p-4 flex items-center gap-4 enterAnim">
                            <Donut percent={focusRate} animateKey={animateKey} tooltip={donutTooltip} />
                            <div className="min-w-[190px]">
                                <div className="text-sm font-black text-slate-800 flex items-center gap-2">
                                    <Percent size={16} className="text-emerald-600" />
                                    Odak Oranı
                                </div>
                                <div className="text-xs font-bold text-slate-500 mt-1">(odaklı sample / toplam sample)</div>

                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-xs">
                                    <Activity size={14} />
                                    {loading ? "Yükleniyor..." : `${dailyPoints.reduce((a, b) => a + b.samples, 0)} kayıt`}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 rounded-2xl border border-white/70 shadow-sm p-4 enterAnim">
                            <div className="text-sm font-black text-slate-800 mb-2">Skor Trend</div>
                            {loading ? (
                                <div className="h-[78px] w-[300px] rounded-xl bg-slate-200/60 animate-pulse" />
                            ) : dailyPoints.length ? (
                                <Sparkline values={scoreTrend} labels={scoreLabels} animateKey={animateKey} />
                            ) : (
                                <div className="h-[78px] w-[300px] grid place-items-center text-slate-500 font-semibold">Veri yok</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* KPI GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 enterAnim">
                        <div className="flex items-center gap-2 text-indigo-700 font-black mb-2">
                            <Clock size={18} />
                            Toplam Süre
                        </div>
                        <div className="text-4xl font-black text-slate-900">
                            {loading ? "—" : totalHours} <span className="text-lg text-slate-400 font-semibold">Saat</span>
                        </div>
                    </div>

                    <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100 enterAnim">
                        <div className="flex items-center gap-2 text-blue-700 font-black mb-2">
                            <TrendingUp size={18} />
                            Günlük Ort.
                        </div>
                        <div className="text-4xl font-black text-slate-900">
                            {loading ? "—" : dailyAvgHours} <span className="text-lg text-slate-400 font-semibold">Saat</span>
                        </div>
                    </div>

                    <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-100 enterAnim">
                        <div className="flex items-center gap-2 text-emerald-700 font-black mb-2">
                            <Target size={18} />
                            En İyi Gün
                        </div>
                        <div className="text-3xl font-black text-emerald-900">{loading ? "—" : bestDayLabel}</div>
                        <p className="text-xs font-black text-emerald-700 mt-2 bg-white/60 inline-block px-2 py-1 rounded-lg border border-emerald-200">
                            {loading ? "—" : `${bestDayHours} Saat`}
                        </p>
                    </div>

                    <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200 enterAnim">
                        <div className="flex items-center gap-2 text-slate-700 font-black mb-2">
                            <Zap size={18} className="text-indigo-600" />
                            Ort. Skor
                        </div>
                        <div className="text-4xl font-black text-slate-900">
                            {loading ? "—" : avgScore ?? 0}
                            <span className="text-lg text-slate-400 font-semibold"> /100</span>
                        </div>
                    </div>

                    {/* TODAY */}
                    <div className="bg-white/70 rounded-2xl p-4 border border-white/70 shadow-sm enterAnim">
                        <div className="flex items-center gap-2 text-slate-800 font-black mb-2">
                            <BadgeCheck size={18} className="text-indigo-600" />
                            Bugün
                        </div>
                        <div className="text-3xl font-black text-slate-900">
                            {loading ? "—" : todayHours} <span className="text-base text-slate-400 font-semibold">saat</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-2">
                            Skor: <span className="font-black text-slate-800">{loading ? "—" : todayScore ?? 0}</span>
                        </div>
                    </div>

                    {/* STREAK */}
                    <div className="bg-gradient-to-br from-orange-50/80 to-rose-50/60 rounded-2xl p-4 border border-orange-100 enterAnim">
                        <div className="flex items-center gap-2 text-orange-700 font-black mb-2">
                            <Flame size={18} />
                            Odak Serisi
                        </div>
                        <div className="text-4xl font-black text-slate-900">
                            {loading ? "—" : streakDays} <span className="text-lg text-slate-400 font-semibold">gün</span>
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-2">(bugünden geriye, en az 1 odaklı kayıt)</div>
                    </div>
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* BAR CHART */}
                    <div className="lg:col-span-2 bg-white/65 rounded-3xl border border-white/70 shadow-sm p-5 enterAnim">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-lg font-black text-slate-900">Odak Süresi</div>
                                <div className="text-xs font-bold text-slate-500">
                                    {rangeDays === 30 ? "30 günde 5 günlük paket bar" : "Günlük bar"} • bar yüksekliği = odaklı saat
                                </div>
                            </div>
                            <div className="text-xs font-black text-slate-600 px-3 py-1 rounded-full bg-slate-900/5 border border-slate-200">
                                Max: {fmt1(barMaxHours)} saat
                            </div>
                        </div>

                        <div className="h-[320px] flex items-end gap-3 sm:gap-6 px-2 pb-2">
                            {loading ? (
                                <div className="w-full text-center text-slate-500 font-semibold">Yükleniyor...</div>
                            ) : barPoints.length === 0 ? (
                                <div className="w-full text-center text-slate-500 font-semibold">Veri yok.</div>
                            ) : (
                                barPoints.map((p, index) => {
                                    const header = rangeDays === 30 ? (p.rangeLabel ?? p.name) : `${relDayTR(p.iso)} • ${p.name}`;
                                    const sub = rangeDays === 30 ? p.rangeSubLabel ?? "" : "";
                                    return (
                                        <div
                                            key={`${p.iso}-${index}`}
                                            className="h-full flex flex-col justify-end items-center gap-3 group cursor-pointer relative"
                                        >
                                            <div className="mb-2 opacity-0 group-hover:opacity-100 transition bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg whitespace-nowrap absolute -mt-16 z-20">
                                                <div className="font-black">{header}</div>
                                                {sub ? <div className="opacity-85">{sub}</div> : null}
                                                <div className="opacity-95">
                                                    {p.saat} saat • Skor: {p.score} • Kayıt: {p.samples}
                                                </div>
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                            </div>

                                            <div
                                                className="w-12 sm:w-14 rounded-2xl bg-gradient-to-t from-indigo-600 to-blue-400 shadow-lg shadow-indigo-100 group-hover:brightness-110 transition-all duration-300"
                                                style={
                                                    {
                                                        ["--h"]: `${p.heightPct}%`,
                                                        height: animateBars ? `${p.heightPct}%` : "0%",
                                                        animation: animateBars ? `barGrow 650ms ease-out both` : undefined,
                                                        animationDelay: `${120 + index * 60}ms`,
                                                    } as CSSVars
                                                }
                                            />

                                            <div className="text-sm font-black text-slate-800">{rangeDays === 30 ? p.rangeLabel ?? p.name : p.name}</div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="bg-white/65 rounded-3xl border border-white/70 shadow-sm p-5 enterAnim">
                        <div className="text-lg font-black text-slate-900 mb-1">Gün Gün Detay</div>
                        <div className="text-xs font-bold text-slate-500 mb-4">Saat, skor ve kayıt sayısı</div>

                        {loading ? (
                            <div className="space-y-3">
                                <div className="h-12 rounded-2xl bg-slate-200/60 animate-pulse" />
                                <div className="h-12 rounded-2xl bg-slate-200/60 animate-pulse" />
                                <div className="h-12 rounded-2xl bg-slate-200/60 animate-pulse" />
                                <div className="h-12 rounded-2xl bg-slate-200/60 animate-pulse" />
                            </div>
                        ) : dailyPoints.length === 0 ? (
                            <div className="h-[240px] grid place-items-center text-slate-500 font-semibold">Veri yok.</div>
                        ) : (
                            <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
                                {dailyPoints.map((d) => {
                                    const maxH = Math.max(0.1, ...dailyPoints.map((x) => x.saat));
                                    const barW = clamp((d.saat / maxH) * 100, 0, 100);
                                    return (
                                        <div
                                            key={d.iso}
                                            className="p-3 rounded-2xl bg-white/70 border border-white/80 flex items-center justify-between gap-3"
                                            title={`${relDayTR(d.iso)} • ${weekdayShortTR(d.iso)} | ${d.saat} saat | Skor: ${d.score} | Kayıt: ${d.samples}`}
                                        >
                                            <div className="min-w-[84px]">
                                                <div className="text-xs font-black text-slate-500">{relDayTR(d.iso)}</div>
                                                <div className="text-sm font-black text-slate-900">{weekdayShortTR(d.iso)}</div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="h-2.5 rounded-full bg-slate-200/70 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-400 transition-all duration-700"
                                                        style={{ width: `${barW}%` }}
                                                    />
                                                </div>
                                                <div className="mt-1 text-[11px] font-bold text-slate-500">
                                                    {d.saat} saat • {d.samples} kayıt
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-xs font-black text-slate-500">Skor</div>
                                                <div className="text-lg font-black text-slate-900">{d.score}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-4 text-[11px] font-bold text-slate-500 bg-slate-900/5 border border-slate-200 rounded-2xl p-3">
                            Not: Saat = odaklı sample × {WRITE_SAMPLE_SECONDS}s / 3600
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
