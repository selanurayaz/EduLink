import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, LayoutDashboard, User, BarChart2, ListTodo, ChevronRight, Zap,
    Compass, ArrowRight, PlayCircle
} from 'lucide-react';
import FocusCamera from '../components/camera/FocusCamera';
import { supabase } from '../lib/supabaseClient';

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
    const [quizCount, setQuizCount] = React.useState<number>(0);
    const [averageScore, setAverageScore] = React.useState<number>(0);
    const [lastQuizDate, setLastQuizDate] = React.useState<string | null>(null);
    const [quizLoading, setQuizLoading] = React.useState<boolean>(true);
    const [quizTrend, setQuizTrend] = React.useState<{ date: string; score: number }[]>([]);




    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };
    React.useEffect(() => {
        const fetchQuizSummary = async () => {

            const { data: trendData } = await supabase
                .from("quiz_results")
                .select("score, total_questions, created_at")
                .order("created_at", { ascending: true });

            if (trendData) {
                setQuizTrend(
                    trendData.map((q) => ({
                        date: new Date(q.created_at).toLocaleDateString("tr-TR"),
                        score: Math.round((q.score / q.total_questions) * 100),
                    }))
                );
            }


            setQuizLoading(true);

            // 1️⃣ Quiz sayısı
            const { count } = await supabase
                .from("quiz_results")
                .select("*", { count: "exact", head: true });

            // 2️⃣ Ortalama skor
            const { data: scores } = await supabase
                .from("quiz_results")
                .select("score, total_questions");

            // 3️⃣ Son quiz tarihi
            const { data: lastQuiz } = await supabase
                .from("quiz_results")
                .select("created_at")
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

            setQuizCount(count ?? 0);

            if (scores && scores.length > 0) {
                const avg =
                    scores.reduce(
                        (acc, q) => acc + q.score / q.total_questions,
                        0
                    ) / scores.length;

                setAverageScore(Math.round(avg * 100));
            } else {
                setAverageScore(0);
            }

            setLastQuizDate(lastQuiz?.created_at ?? null);
            setQuizLoading(false);
        };

        void fetchQuizSummary();
    }, []);


    return (
        // YENİ TASARIM: Mavi/Canlı Atmosfer
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-200">

            {/* --- ARKA PLAN EFEKTLERİ --- */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
            <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>
            <div className="absolute bottom-[-20%] left-[30%] w-[700px] h-[700px] bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000 z-0"></div>

            {/* --- ÜST MENÜ (NAVBAR) --- */}
            <nav className="bg-white/60 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">

                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 rotate-3 hover:rotate-0 transition-all">
                                <LayoutDashboard size={22} className="text-white" />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-slate-900">EduLink<span className="text-blue-600">.</span></span>
                        </div>

                        {/* Sağ Taraf: Butonlar */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 px-4 py-2.5 rounded-xl transition-all font-medium"
                            >
                                <User size={20} />
                                <span className="hidden sm:inline">Profilim</span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50/80 hover:bg-red-100 border border-red-100/50 transition-all shadow-sm"
                            >
                                <LogOut size={18} />
                                <span>Çıkış</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- ANA İÇERİK --- */}
            <main className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 relative z-10">

                {/* Karşılama Başlığı */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-800 via-blue-600 to-cyan-500 drop-shadow-sm">
                            Hoşgeldin! 👋
                        </h1>
                        <p className="text-slate-500 font-medium text-lg">Bugün potansiyelini açığa çıkarmaya hazır mısın?</p>
                    </div>

                    <div className="hidden md:flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm text-sm font-semibold text-blue-700">
                        <Zap size={16} className="fill-blue-600 text-blue-600" />
                        <span>Hedef: Günlük 2 Saat Odaklanma</span>
                    </div>
                </div>

                {/* --- İÇERİK KEŞFİNE GİDİŞ BANNERI (ÜSTTE) --- */}
                <div
                    onClick={() => navigate('/discovery')}
                    className="w-full bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-8 md:p-10 mb-10 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Compass size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Eğitim Kütüphanesi 📚</h2>
                                <p className="text-slate-500 font-medium text-lg">
                                    Makaleler, videolar ve podcastler ile gelişimini hızlandır.
                                </p>
                            </div>
                        </div>

                        <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-2 group-hover:translate-x-2">
                            Kütüphaneyi Keşfet <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* --- GRID YAPISI --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL: Kamera (2 birim) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/60 shadow-2xl shadow-blue-900/5 relative overflow-hidden group h-full">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h2 className="font-bold text-slate-700 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                                    Canlı Odak Analizi
                                </h2>
                                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">AI Active</span>
                            </div>

                            <div className="rounded-2xl overflow-hidden shadow-inner border border-slate-200/50">
                                <FocusCamera />
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON (1 birim) */}
                    <div className="space-y-6">
                        {/* --- QUIZ ÖZET KARTLARI --- */}
                        <button
                            onClick={() => navigate("/quiz-history")}
                            className="w-full bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 text-left font-bold text-blue-700 hover:bg-white transition"
                        >
                            Quiz Geçmişini Gör →
                        </button>


                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 text-center shadow-sm">
                                <div className="text-xs text-slate-500 font-semibold mb-1">Quiz</div>
                                <div className="text-2xl font-black text-blue-600">
                                    {quizLoading ? "--" : quizCount}
                                </div>
                            </div>

                            <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 text-center shadow-sm">
                                <div className="text-xs text-slate-500 font-semibold mb-1">Başarı</div>
                                <div className="text-2xl font-black text-green-600">
                                    {quizLoading ? "--" : `%${averageScore}`}
                                </div>
                            </div>

                            <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-4 text-center shadow-sm">
                                <div className="text-xs text-slate-500 font-semibold mb-1">Son Quiz</div>
                                <div className="text-sm font-bold text-slate-700">
                                    {quizLoading
                                        ? "--"
                                        : lastQuizDate
                                            ? new Date(lastQuizDate).toLocaleDateString("tr-TR")
                                            : "Yok"}
                                </div>
                            </div>
                        </div>


                        {/* --- 1. YENİ GİRİŞ KAPISI: İLERLEME KARTI (BURASI EKLENDİ) --- */}
                        <div
                            onClick={() => navigate('/progress')}
                            className="bg-gradient-to-br from-white to-slate-50 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 cursor-pointer hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                        >
                            {/* Dekoratif Arkaplan */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-100 transition-colors"></div>

                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-indigo-100">
                                    <PlayCircle size={24} fill="currentColor" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">İlerleme Durumu</h3>
                                    <p className="text-xs text-slate-500 font-medium">Kaldığın yerden devam et</p>
                                </div>
                            </div>

                            {/* Mini Özet (Video) */}
                            <div className="bg-white/50 rounded-xl p-3 border border-indigo-100/50 mb-3 relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-700">Algoritma Analizi</span>
                                    <span className="text-[10px] font-bold text-indigo-600">%45</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="w-[45%] h-full bg-indigo-500 rounded-full"></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] text-blue-600 font-bold">M</div>
                                    <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] text-purple-600 font-bold">P</div>
                                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">+2</div>
                                </div>
                                <span className="text-sm font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Tümünü Gör <ArrowRight size={16} />
                    </span>
                            </div>
                        </div>

                        {/* 2. KUTU: Odak Skoru */}
                        <div
                            onClick={() => navigate('/analytics')}
                            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-7 cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>

                            <div className="flex items-center gap-4 mb-5 relative z-10">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-blue-100">
                                    <BarChart2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Odak Skoru</h3>
                                    <p className="text-xs text-slate-500 font-medium">Günlük Performans</p>
                                </div>
                            </div>
                            <div className="text-5xl font-black text-slate-900 mb-2 relative z-10 tracking-tight">--</div>
                            <div className="flex items-center text-sm text-blue-600 font-bold mt-4 relative z-10 group-hover:gap-2 transition-all">
                                Raporu Görüntüle <ChevronRight size={18} />
                            </div>
                        </div>


                        {/* QUİZ BAŞARI TRENDİ */}
                        <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-7 shadow-sm">
                            <h3 className="font-bold text-slate-800 text-lg mb-4">Quiz Başarı Trendi (%)</h3>

                            {quizTrend.length === 0 ? (
                                <p className="text-sm text-slate-500">Henüz veri yok.</p>
                            ) : (
                                <div className="w-full h-[220px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={quizTrend}>
                                            <XAxis dataKey="date" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="score" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>



                        {/* 3. KUTU: Planlayıcı */}
                        <div
                            onClick={() => navigate('/planner')}
                            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] p-7 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>

                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-purple-100">
                                    <ListTodo size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">Planlayıcı</h3>
                                    <p className="text-xs text-slate-500 font-medium">Görev Yönetimi</p>
                                </div>
                            </div>
                            <p className="text-slate-600 font-medium text-sm mb-5 relative z-10 leading-relaxed">
                                Bugün hangi derse odaklanmak istersin?
                            </p>
                            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-purple-100 flex items-center justify-between relative z-10 shadow-sm">
                                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">AI Önerisi</span>
                                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md">Lineer Cebir</span>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;