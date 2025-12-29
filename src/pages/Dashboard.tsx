import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LogOut, LayoutDashboard, User, BarChart2, ListTodo, ChevronRight, Zap,
    Compass, ArrowRight, PlayCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useFocusTracking } from "../context/useFocusTracking";


//quizler için grafik verisi importları
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [averageScore, setAverageScore] = React.useState<number>(0);
    const [lastQuizDate, setLastQuizDate] = React.useState<string | null>(null);
    const [quizLoading, setQuizLoading] = React.useState<boolean>(true);

    // ✅ Son 10 gün grafiği için: gün bazlı özet
    const [quizTrend, setQuizTrend] = React.useState<{
        date: string;         // "tr-TR" tarih
        correct: number;      // toplam doğru (günlük ortalama)
        total: number;        // toplam soru (günlük ortalama)
        percent: number;      // yüzde (günlük ortalama)
    }[]>([]);

    // ✅ Odak skoru kartı
    const [focusLoading, setFocusLoading] = React.useState<boolean>(true);
    const [focusScoreToday, setFocusScoreToday] = React.useState<number | null>(null);




    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    // auth_user_id -> kullanicilar.id
    const getAppUserId = async (): Promise<string | null> => {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authData?.user?.id) return null;

        const { data, error } = await supabase
            .from("kullanicilar")
            .select("id")
            .eq("auth_user_id", authData.user.id)
            .maybeSingle();

        if (error) return null;
        return data?.id ?? null;
    };
    React.useEffect(() => {
        const fetchAll = async () => {
            // -------------------- QUIZ (SON 10 GÜN) --------------------
            setQuizLoading(true);
            try {
                const since = new Date();
                since.setDate(since.getDate() - 10);

                const { data: raw, error } = await supabase
                    .from("quiz_results")
                    .select("score, total_questions, created_at")
                    .gte("created_at", since.toISOString())
                    .order("created_at", { ascending: true });

                if (error || !raw) {
                    setQuizTrend([]);
                    setAverageScore(0);
                    setLastQuizDate(null);
                } else {
                    // Gün bazlı grupla (son 10 gün)
                    const map = new Map<string, { correctSum: number; totalSum: number; count: number; lastTs: string }>();

                    for (const r of raw) {
                        const d = new Date(r.created_at);
                        const key = d.toLocaleDateString("tr-TR");
                        const correct = Number(r.score) || 0;
                        const total = Number(r.total_questions) || 0;

                        const existing = map.get(key);
                        if (!existing) {
                            map.set(key, {
                                correctSum: correct,
                                totalSum: total,
                                count: 1,
                                lastTs: r.created_at
                            });
                        } else {
                            existing.correctSum += correct;
                            existing.totalSum += total;
                            existing.count += 1;
                            // son timestamp
                            if (new Date(r.created_at).getTime() > new Date(existing.lastTs).getTime()) {
                                existing.lastTs = r.created_at;
                            }
                        }
                    }

                    const trendArr = Array.from(map.entries()).map(([date, v]) => {
                        const correctAvg = v.correctSum / v.count;
                        const totalAvg = v.totalSum / v.count;
                        const percentAvg = totalAvg > 0 ? Math.round((correctAvg / totalAvg) * 100) : 0;

                        return {
                            date,
                            correct: Math.round(correctAvg),
                            total: Math.round(totalAvg),
                            percent: percentAvg,
                        };
                    });

                    // "son 10 gün" grafiği: sadece son 10 günü (max 10 nokta) tut
                    const last10 = trendArr.slice(-10);
                    setQuizTrend(last10);

                    // Ortalama skor: son 10 quiz değil, son 10 GÜN'ün yüzde ortalaması
                    if (last10.length > 0) {
                        const avgPercent = Math.round(last10.reduce((a, b) => a + (b.percent || 0), 0) / last10.length);
                        setAverageScore(avgPercent);

                        // Son quiz tarihi (raw'ın son kaydı)
                        const last = raw[raw.length - 1];
                        setLastQuizDate(last?.created_at ?? null);
                    } else {
                        setAverageScore(0);
                        setLastQuizDate(null);
                    }
                }
            } finally {
                setQuizLoading(false);
            }

            // -------------------- ODAK (BUGÜN) --------------------
            try {
                setFocusLoading(true);
                const appUserId = await getAppUserId();

                if (!appUserId) {
                    setFocusScoreToday(null);
                } else {
                    const startOfToday = new Date();
                    startOfToday.setHours(0, 0, 0, 0);

                    const { data: focusRows, error: focusErr } = await supabase
                        .from("odak_kayitlari")
                        .select("guven_skoru, olusturulma_tarihi")
                        .eq("kullanici_id", appUserId)
                        .gte("olusturulma_tarihi", startOfToday.toISOString())
                        .order("olusturulma_tarihi", { ascending: false })
                        .limit(200);

                    if (focusErr || !focusRows) {
                        setFocusScoreToday(null);
                    } else if (focusRows.length === 0) {
                        setFocusScoreToday(null);
                    } else {
                        const nums = focusRows
                            .map((r) => Number((r as { guven_skoru: number | string | null }).guven_skoru))
                            .filter((n: number) => Number.isFinite(n));

                        if (nums.length === 0) {
                            setFocusScoreToday(null);
                        } else {
                            const avg = nums.reduce((a: number, b: number) => a + b, 0) / nums.length;
                            setFocusScoreToday(Math.round(avg * 100)); // 0-100
                        }
                    }
                }
            } finally {
                setFocusLoading(false);
            }
        };

        void fetchAll();
    }, [location.pathname]); // ✅ quizten geri dönünce yenilensin
    const {
        trackingEnabled,
        setTrackingEnabled,
        cameraState,
        cameraConfidence,
        cameraUpdatedAt
    } = useFocusTracking();


    return (
        // YENİ TASARIM: Mavi/Canlı Atmosfer
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-200">

            {/* Arka plan dekoratif efekt */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-200/50 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-200/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* TOP BAR */}
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-md">
                            <LayoutDashboard size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-800 leading-tight">EduLink</h1>
                            <p className="text-xs text-slate-500 font-medium">Odak • Plan • Başarı</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 rounded-xl bg-white/70 hover:bg-white shadow-sm border border-slate-200/60 transition hover:scale-[1.04] active:scale-[0.98]"
                            title="Profil"
                        >
                            <User size={18} className="text-slate-700" />
                        </button>

                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-xl bg-white/70 hover:bg-white shadow-sm border border-slate-200/60 transition hover:scale-[1.04] active:scale-[0.98]"
                            title="Çıkış Yap"
                        >
                            <LogOut size={18} className="text-slate-700" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* HERO */}
                <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl p-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 via-blue-100/20 to-transparent"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                                Bugün odaklanıp fark atalım 🚀
                            </h2>
                            <p className="text-slate-600 mt-1 font-medium">
                                Kamera odak analizini aç, hedefini belirle, istatistiklerini takip et.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm text-sm font-semibold text-blue-700 hover:scale-[1.02] active:scale-[0.99] transition-transform">
                            <Zap size={16} className="fill-blue-600 text-blue-600" />
                            <span>Hedef: Günlük 2 Saat Odaklanma</span>
                        </div>
                    </div>

                    {/* --- İÇERİK KEŞFİNE GİDİŞ BANNERI (ÜSTTE) --- */}
                    <div
                        onClick={() => navigate('/discovery')}
                        className="w-full bg-white/70 backdrop-blur-md border border-white/50 shadow-md rounded-2xl px-5 py-4 mt-6 flex items-center justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all group relative overflow-hidden hover:scale-[1.01] active:scale-[0.995] cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/60 via-blue-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Compass size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Keşfet & İçerik Önerileri</h3>
                                <p className="text-sm text-slate-600 font-medium">
                                    İlgi alanına göre içerik bul, ilerlemeni kaydet.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center gap-2 text-indigo-700 font-bold">
                            Hemen Git <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>

                {/* CAMERA + STATS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* CAMERA CARD */}
                    <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl p-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 via-indigo-100/20 to-transparent"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-200">
                                        <PlayCircle size={22} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                </span>
                                                Canlı Odak Analizi
                                            </span>
                                        </h2>
                                        <span className="text-xs font-semibold text-slate-500">Kamera üzerinden odak analizi</span>
                                    </div>
                                </div>

                                {(() => {
                                    const pct = Math.round((cameraConfidence || 0) * 100);

                                    const stale = trackingEnabled && cameraUpdatedAt
                                        ? (Date.now() - cameraUpdatedAt > 6000) // 6sn veri gelmediyse "dondu" gibi kabul
                                        : false;

                                    let text = "AI";
                                    let cls = "text-slate-700 bg-white/60 border-slate-200";

                                    if (!trackingEnabled) {
                                        text = "Kamera: Kapalı";
                                        cls = "text-rose-700 bg-rose-50 border-rose-200";
                                    } else if (stale) {
                                        text = "Kamera: Bekliyor…";
                                        cls = "text-amber-800 bg-amber-50 border-amber-200";
                                    } else {
                                        switch (cameraState) {
                                            case "focused":
                                                text = `ODAKLI ✅ (%${pct})`;
                                                cls = "text-emerald-800 bg-emerald-50 border-emerald-200";
                                                break;
                                            case "distracted":
                                                text = `DAĞINIK ⚠️ (%${pct})`;
                                                cls = "text-amber-800 bg-amber-50 border-amber-200";
                                                break;
                                            case "no_face":
                                                text = "YÜZ YOK ❌";
                                                cls = "text-slate-800 bg-slate-100 border-slate-200";
                                                break;
                                            case "loading":
                                                text = "YÜKLENİYOR…";
                                                cls = "text-slate-800 bg-slate-100 border-slate-200";
                                                break;
                                            case "error":
                                                text = "HATA";
                                                cls = "text-rose-700 bg-rose-50 border-rose-200";
                                                break;
                                            default:
                                                text = "AI";
                                                cls = "text-slate-700 bg-white/60 border-slate-200";
                                        }
                                    }

                                    return (
                                        <span
                                            className={`text-xs font-semibold px-2 py-1 rounded-md border hover:scale-[1.02] active:scale-[0.99] transition-transform ${cls}`}
                                            title="Kamera durumu"
                                        >
      {text}
    </span>
                                    );
                                })()}

                            </div>

                            <div className="rounded-2xl overflow-hidden shadow-inner border border-slate-200/50">
                                {trackingEnabled ? (
                                    <div id="focus-camera-mount" />
                                ) : (
                                    <div className="w-full h-[360px] flex items-center justify-center bg-black/10 text-slate-700 font-bold">
                                        Kamera kapalı
                                    </div>
                                )}
                            </div>
                            
                            {/* Kamera altı: Odak takibini kapat/aç */}
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setTrackingEnabled((p: boolean) => !p)}
                                    className={`px-4 py-2 rounded-xl border shadow-sm font-bold text-sm transition 
                                      hover:scale-[1.03] active:scale-[0.98]
                                      ${trackingEnabled
                                        ? "bg-white/70 border-slate-200 text-slate-700 hover:bg-white"
                                        : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                                    }`}
                                >
                                    {trackingEnabled ? "Odak takibini kapat" : "Odak takibini aç"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON */}
                    <div className="space-y-6">

                        <button
                            onClick={() => navigate("/quiz-history")}
                            className="w-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl p-4 text-left font-bold text-blue-700 hover:bg-white transition hover:scale-[1.01] active:scale-[0.99] transition-transform"
                        >
                            Quiz Geçmişini Gör →
                        </button>

                        {/* Quick Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* 1. KUTU: Quiz */}
                            <div
                                onClick={() => navigate('/quiz')}
                                className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden hover:scale-[1.01] active:scale-[0.995] transition-transform cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-gradient-to-br from-indigo-200/50 to-blue-200/20 blur-2xl -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>

                                <div className="flex items-center gap-4 mb-4 relative z-10">
                                    <div className="p-3 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl text-white transition-all duration-300 shadow-lg shadow-indigo-100">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">Quiz</h3>
                                        <p className="text-xs text-slate-500 font-medium">Hızlı test çöz</p>
                                    </div>
                                </div>

                                <div className="text-sm text-slate-600 font-semibold relative z-10">
                                    Hedefini güçlendir. Günlük mini quizlerle ilerle.
                                </div>

                                <span className="flex items-center gap-1 text-indigo-700 text-sm font-bold mt-4 relative z-10 group-hover:gap-2 transition-all">
                                    Tümünü Gör <ArrowRight size={16} />
                                </span>
                            </div>

                            {/* 2. KUTU: Odak Skoru */}
                            <div
                                onClick={() => navigate('/analytics')}
                                className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden hover:scale-[1.01] active:scale-[0.995] transition-transform cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-gradient-to-br from-blue-200/50 to-indigo-200/20 blur-2xl -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>

                                <div className="flex items-center gap-4 mb-5 relative z-10">
                                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-2xl text-white transition-all duration-300 shadow-lg shadow-blue-100">
                                        <BarChart2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">Odak Skoru</h3>
                                        <p className="text-xs text-slate-500 font-medium">Günlük Performans</p>
                                    </div>
                                </div>

                                <div className="text-5xl font-black text-slate-900 mb-2 relative z-10 tracking-tight">
                                    {focusLoading ? "--" : (focusScoreToday ?? "--")}
                                </div>

                                <div className="flex items-center text-sm text-blue-600 font-bold mt-4 relative z-10 group-hover:gap-2 transition-all">
                                    Raporu Görüntüle <ChevronRight size={18} />
                                </div>
                            </div>

                        </div>

                        {/* QUIZ PERFORMANCE CARD */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 via-blue-100/20 to-transparent"></div>

                            <div className="relative z-10">
                                <h3 className="text-lg font-black text-slate-900 mb-1">Quiz Performansı</h3>
                                <p className="text-sm text-slate-600 font-medium mb-4">
                                    Son 10 günün ortalama başarın
                                </p>

                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <div className="text-5xl font-black text-slate-900 tracking-tight">
                                            {quizLoading ? "--" : averageScore}
                                        </div>
                                        <div className="text-xs text-slate-500 font-semibold mt-1">
                                            {lastQuizDate
                                                ? `Son Quiz: ${new Date(lastQuizDate).toLocaleDateString("tr-TR")}`
                                                : "Henüz quiz yok"}
                                        </div>
                                    </div>

                                    <div className="w-40 h-20 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm p-2">
                                        {quizLoading ? (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-semibold">
                                                Yükleniyor...
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={quizTrend}>
                                                    <XAxis dataKey="date" hide />
                                                    <YAxis hide domain={[0, 100]} />
                                                    <Tooltip
                                                        formatter={(value: unknown, _name: unknown, props: unknown) => {
                                                            const payload =
                                                                typeof props === "object" && props !== null && "payload" in props
                                                                    ? (props as { payload?: unknown }).payload
                                                                    : undefined;

                                                            if (
                                                                payload &&
                                                                typeof payload === "object" &&
                                                                "correct" in payload &&
                                                                "total" in payload &&
                                                                "percent" in payload
                                                            ) {
                                                                const p = payload as { correct: number; total: number; percent: number };
                                                                return [`${p.correct}/${p.total} (%${p.percent})`, "Skor"];
                                                            }

                                                            return [String(value ?? ""), "Skor"];
                                                        }}
                                                    />

                                                    <Line
                                                        type="monotone"
                                                        dataKey="percent"
                                                        stroke="#4f46e5"
                                                        strokeWidth={3}
                                                        dot={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PLANLAYICI KARTI */}
                        <div
                            onClick={() => navigate('/planner')}
                            className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden hover:scale-[1.01] active:scale-[0.995] transition-transform cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-gradient-to-br from-purple-200/50 to-pink-200/20 blur-2xl -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-500"></div>

                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl text-white transition-all duration-300 shadow-lg shadow-purple-100">
                                    <ListTodo size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Planlayıcı</h3>
                                    <p className="text-xs text-slate-500 font-medium">Görevlerini yönet</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 font-semibold relative z-10">
                                Günlük to-do listeni planla ve takip et.
                            </p>

                            <div className="flex items-center gap-1 text-sm text-purple-700 font-bold mt-4 relative z-10 group-hover:gap-2 transition-all">
                                Aç <ChevronRight size={18} />
                            </div>

                            <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 p-3 mt-4 relative z-10 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI Önerisi</span>
                                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md">Lineer Cebir</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;
