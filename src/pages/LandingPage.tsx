import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Zap, BarChart2, ShieldCheck, ArrowRight, MousePointerClick } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        // YENİ TASARIM: Daha belirgin Mavi -> Beyaz Geçişi
        <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-50 to-white text-slate-800 font-sans selection:bg-blue-200">

            {/* --- NAVBAR --- */}
            <nav className="fixed w-full z-50 bg-white/60 backdrop-blur-lg border-b border-blue-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center text-white rotate-3 hover:rotate-0 transition-all duration-300">
                                <LayoutDashboard size={22} />
                            </div>
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">EduLink<span className="text-blue-600">.</span></span>
                        </div>

                        {/* Butonlar */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate('/login')}
                                className="hidden md:block text-slate-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                Giriş Yap
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-xl shadow-blue-300/50"
                            >
                                Ücretsiz Başla
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION (GİRİŞ) --- */}
            <div className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">

                {/* Arkaplan Süsleri */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                    {/* Rozet */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-blue-200 text-blue-700 text-sm font-bold mb-8 shadow-sm backdrop-blur-sm hover:bg-white/80 transition-colors cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
                        Yapay Zeka Destekli Odaklanma Koçu
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[1.1]">
                        Dikkatin <span className="text-slate-400/50 line-through decoration-red-400 decoration-4">Dağılmasın</span> <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 drop-shadow-sm">
               Potansiyelin Konuşsun.
            </span>
                    </h1>

                    <p className="mt-6 text-xl md:text-2xl text-slate-600/90 max-w-3xl mx-auto mb-12 leading-relaxed">
                        EduLink, kameranızı kullanarak odaklanma sürenizi analiz eder, size özel grafikler sunar ve çalışma veriminizi <span className="font-bold text-blue-600">2 kata kadar</span> artırır.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-2xl shadow-blue-900/20 flex items-center justify-center gap-3"
                        >
                            Hemen Başla <ArrowRight size={20} className="text-blue-400" />
                        </button>
                        <button className="bg-white text-slate-700 border border-slate-200 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 hover:border-blue-200 hover:-translate-y-1 transition-all shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2">
                            <MousePointerClick size={20} /> Nasıl Çalışır?
                        </button>
                    </div>

                </div>
            </div>

            {/* --- ÖZELLİKLER --- */}
            <div className="relative bg-white py-32">
                {/* Dalga Efekti */}
                <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 -mt-1">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-blue-50/50"></path>
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Neden EduLink?</h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">Sadece bir yapılacaklar listesi değil, seni anlayan ve yönlendiren akıllı bir çalışma sistemi.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                        {/* Kart 1 */}
                        <div className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Odak Takibi</h3>
                            <p className="text-slate-600 leading-relaxed">Kamera analizi ile ne kadar süre gerçekten odaklandığını milisaniyesine kadar ölçer.</p>
                        </div>

                        {/* Kart 2 */}
                        <div className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-100/50 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                <BarChart2 size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Detaylı Raporlar</h3>
                            <p className="text-slate-600 leading-relaxed">Günlük ve haftalık çalışma grafiklerinle gelişimini gör. Verimli saatlerini keşfet.</p>
                        </div>

                        {/* Kart 3 */}
                        <div className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">%100 Gizlilik</h3>
                            <p className="text-slate-600 leading-relaxed">Görüntüleriniz asla sunucuya gitmez. Analizler tarayıcınızda, sizin cihazınızda yapılır.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CTA ALANI (Alt Mavi Bant) --- */}
            <div className="py-20 bg-blue-600 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
                    <h2 className="text-4xl font-bold text-white mb-6">Odaklanmaya Hazır Mısın?</h2>
                    <p className="text-blue-100 text-lg mb-10">Binlerce öğrenci EduLink ile çalışma alışkanlığını değiştirdi. Sen de aramıza katıl.</p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-white text-blue-700 px-12 py-4 rounded-full font-bold text-xl hover:bg-blue-50 hover:scale-105 transition-all shadow-xl"
                    >
                        Ücretsiz Hesap Oluştur
                    </button>
                </div>
            </div>

            {/* --- FOOTER --- */}
            <footer className="bg-slate-900 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">EL</div>
                        <span className="text-white font-bold text-xl">EduLink</span>
                    </div>
                    <p className="text-slate-500 text-sm">© 2025 EduLink Projesi. Tüm hakları saklıdır.</p>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;