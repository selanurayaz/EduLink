import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, PlayCircle, Headphones, Star,
    Clock, Heart, Compass, HelpCircle
} from 'lucide-react';

// ArrowRight listeden çıkarıldı, artık hata vermeyecek.

const Discovery = () => {
    const navigate = useNavigate();

    return (
        // YENİ TASARIM: Light Mode / Mavi Atmosfer
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-200 p-4 md:p-8">

            {/* ARKA PLAN EFEKTLERİ */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0"></div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* ÜST BAR */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-sm border border-slate-200 transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Keşfet & Öğren 🚀</h1>
                        <p className="text-slate-500 font-medium">Kendini geliştirmek için en iyi kaynaklar.</p>
                    </div>
                </div>

                {/* 1. ÖNE ÇIKAN (FEATURED) - BÜYÜK BANNER */}
                <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-colors"></div>

                    <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full mb-4 border border-white/20">
              HAFTANIN EDİTÖR SEÇİMİ
            </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                            "Deep Work": Odaklanma Sanatı
                        </h2>
                        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                            Cal Newport'un efsanevi kitabından, dijital çağda dikkatinizi nasıl yöneteceğinize dair 5 altın kuralı derledik.
                        </p>
                        <button
                            onClick={() => navigate('/articles')}
                            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
                        >
                            <BookOpen size={20} /> Hemen Oku
                        </button>
                    </div>
                </div>

                {/* 2. KATEGORİ IZGARASI */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* SOL KOLON: MAKALELER */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Popüler Makaleler</h3>
                        </div>

                        {/* Kart 1 */}
                        <div
                            onClick={() => navigate('/articles')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Verimlilik</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> 5 dk</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">Pomodoro Tekniği 101</h4>
                            <p className="text-sm text-slate-500 mb-4">25 dakika çalışıp 5 dakika mola vererek beyninizi nasıl hacklersiniz?</p>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="w-2/3 h-full bg-blue-500"></div>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">%65 Okundu</span>
                        </div>

                        {/* Kart 2 */}
                        <div
                            onClick={() => navigate('/articles')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">Bilim</span>
                                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> 8 dk</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-purple-600 transition-colors">Dopamin Detoksu</h4>
                            <p className="text-sm text-slate-500">Sosyal medya bağımlılığından kurtulup gerçek hayata dönmenin yolları.</p>
                        </div>
                    </div>

                    {/* ORTA SOL: VİDEOLAR */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                                <PlayCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Video Serileri</h3>
                        </div>

                        {/* Kart 1 */}
                        <div
                            onClick={() => navigate('/videos')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-teal-900/5 transition-all cursor-pointer group"
                        >
                            {/* Video Thumbnail (Temsili) */}
                            <div className="w-full h-32 bg-slate-200 rounded-2xl mb-4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-teal-600 shadow-lg scale-90 group-hover:scale-110 transition-transform">
                                        <PlayCircle size={20} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-teal-600 transition-colors">Benimle Çalış (2 Saat)</h4>
                            <p className="text-sm text-slate-500">Kütüphane ortamı sesleriyle odaklanma seansı.</p>
                        </div>

                        {/* Kart 2 */}
                        <div
                            onClick={() => navigate('/videos')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-teal-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">Motivasyon</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-teal-600 transition-colors">Neden Erteliyoruz?</h4>
                            <p className="text-sm text-slate-500">Erteleme hastalığının psikolojik sebepleri ve çözümleri.</p>
                        </div>
                    </div>

                    {/* ORTA SAĞ: PODCASTLER */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Headphones size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Podcastler</h3>
                        </div>

                        {/* Kart 1 */}
                        <div
                            onClick={() => navigate('/podcasts')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-indigo-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Compass size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Beyin ve Öğrenme</h4>
                                    <p className="text-xs text-slate-500">Bölüm 42 • 35 dk</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
                                    <PlayCircle size={20} fill="currentColor" />
                                </button>
                                <button className="text-slate-400 hover:text-red-500 transition-colors">
                                    <Heart size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Kart 2 */}
                        <div
                            onClick={() => navigate('/podcasts')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-indigo-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-pink-600 transition-colors">Başarı Hikayeleri</h4>
                                    <p className="text-xs text-slate-500">Bölüm 12 • 45 dk</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <button className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                                    <PlayCircle size={20} fill="currentColor" />
                                </button>
                                <button className="text-slate-400 hover:text-red-500 transition-colors">
                                    <Heart size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON: QUIZLER */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                <HelpCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Quizler</h3>
                        </div>

                        {/* Kart 1 */}
                        <div
                            onClick={() => navigate('/quiz')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-amber-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Hızlı Quiz</h4>
                                    <p className="text-xs text-slate-500">5 soru • 2-3 dk</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">Kısa testlerle öğrendiklerini pekiştir.</p>
<<<<<<< HEAD
                            <button
                                className="w-full bg-amber-50 text-amber-700 font-bold py-2.5 rounded-xl hover:bg-amber-100 transition-colors">
=======
                            <button className="w-full bg-amber-50 text-amber-700 font-bold py-2.5 rounded-xl hover:bg-amber-100 transition-colors">
>>>>>>> 962b2d052ac79bf0d2ff07babe0ad5b0cff98311
                                Quize Başla
                            </button>
                        </div>

                        {/* Kart 2 */}
                        <div
                            onClick={() => navigate('/quiz')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-amber-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-yellow-700 transition-colors">Günün Mini Testi</h4>
                                    <p className="text-xs text-slate-500">3 soru • 1 dk</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">Bugün öğrendiklerini hızla kontrol et.</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Discovery;
