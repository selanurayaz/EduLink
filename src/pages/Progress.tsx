
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, PlayCircle, BookOpen, Headphones, CheckCircle2,
    ArrowRight, BarChart
} from 'lucide-react';

// HATA ÇÖZÜMÜ: ": Element" ve "React.FC" ifadeleri kaldırıldı.
// Artık sadece düz bir fonksiyon, hata verme ihtimali yok.
const Progress = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-200 p-4 md:p-8">

            {/* ARKA PLAN EFEKTLERİ */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>

            <div className="max-w-5xl mx-auto relative z-10">

                {/* ÜST BAR */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-sm border border-slate-200 transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform"/>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">İlerleme Durumu 📊</h1>
                        <p className="text-slate-500 font-medium">Yarım kalan içeriklerini tamamla.</p>
                    </div>
                </div>

                {/* ÖZET KARTI (BANNER) */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-900/20 mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
                                <BarChart size={32} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Genel Başarım</h2>
                                <p className="text-indigo-100">Bu hafta harika gidiyorsun!</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-black mb-1">%68</div>
                            <div className="text-sm font-medium text-indigo-200">Tamamlanan İçerik</div>
                        </div>
                    </div>
                </div>

                {/* --- KATEGORİ: DEVAM ET (IN PROGRESS) --- */}
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Devam Et
                </h3>

                <div className="grid grid-cols-1 gap-6 mb-12">

                    {/* Kart 1: Video */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group cursor-pointer">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            {/* Thumbnail */}
                            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                                <div className="absolute inset-0 bg-indigo-900/10"></div>
                                <PlayCircle size={40} className="text-indigo-600 relative z-10" />
                            </div>

                            {/* İçerik */}
                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-800">Algoritma Analizi ve Big O</h4>
                                        <p className="text-sm text-slate-500 font-medium">Bölüm 3 • Video Ders</p>
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100">
                                25 dk kaldı
                            </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2 mt-4">
                                    <div className="w-[45%] h-full bg-indigo-500 rounded-full relative overflow-hidden group-hover:bg-indigo-600 transition-colors">
                                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-right text-xs font-bold text-indigo-600">%45</p>
                            </div>

                            <button className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Kart 2: Makale */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group cursor-pointer">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <BookOpen size={32} />
                            </div>
                            <div className="flex-1 w-full">
                                <h4 className="text-lg font-bold text-slate-800 mb-1">Pomodoro Tekniği ile Verim</h4>
                                <p className="text-sm text-slate-500 mb-4">Makale • Kişisel Gelişim</p>

                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="w-[70%] h-full bg-blue-500 rounded-full"></div>
                                </div>
                            </div>
                            <button className="text-blue-600 font-bold text-sm px-6 py-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                                Okumaya Dön
                            </button>
                        </div>
                    </div>

                    {/* Kart 3: Podcast */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group cursor-pointer">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-full md:w-24 h-24 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                <Headphones size={32} />
                            </div>
                            <div className="flex-1 w-full">
                                <h4 className="text-lg font-bold text-slate-800 mb-1">Beyin ve Öğrenme Psikolojisi</h4>
                                <p className="text-sm text-slate-500 mb-4">Podcast • Bölüm 42</p>

                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="w-[20%] h-full bg-purple-500 rounded-full"></div>
                                </div>
                            </div>
                            <button className="text-purple-600 font-bold text-sm px-6 py-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                                Dinlemeye Dön
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- KATEGORİ: TAMAMLANANLAR --- */}
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                    Tamamlananlar
                </h3>

                <div className="space-y-4">
                    <div className="bg-white/60 p-4 rounded-2xl border border-slate-200 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="font-bold text-slate-700 line-through decoration-slate-400">React Temelleri - Video 1</span>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Tamamlandı</span>
                    </div>

                    <div className="bg-white/60 p-4 rounded-2xl border border-slate-200 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="font-bold text-slate-700 line-through decoration-slate-400">Dijital Minimalizm Makalesi</span>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Tamamlandı</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Progress;