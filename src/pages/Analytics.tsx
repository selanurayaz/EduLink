import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingUp, Calendar, Zap, Target } from 'lucide-react';

// VERİLER
const weeklyData = [
    { name: 'Pzt', saat: 2.5, height: '40%' },
    { name: 'Sal', saat: 3.8, height: '60%' },
    { name: 'Çar', saat: 1.5, height: '25%' },
    { name: 'Per', saat: 4.2, height: '65%' },
    { name: 'Cum', saat: 5.0, height: '75%' },
    { name: 'Cmt', saat: 6.5, height: '90%' },
    { name: 'Paz', saat: 3.0, height: '45%' },
];

const Analytics = () => {
    const navigate = useNavigate();

    return (
        // YENİ TASARIM: Light Mode Arkaplan
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-200 p-4 md:p-8">

            {/* ARKA PLAN EFEKTLERİ */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0"></div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* ÜST BAR */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-sm border border-slate-200 transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform"/>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-cyan-600">
                            Haftalık Raporun 📈
                        </h1>
                        <p className="text-slate-500 font-medium">Son 7 gündeki odaklanma performansın.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* 1. SOL KARTLAR (Özet Bilgiler) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Toplam Süre */}
                        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 p-6 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-blue-100 transition-colors"></div>

                            <div className="flex items-center gap-3 mb-3 text-slate-600 relative z-10">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Clock size={20} />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wide">Toplam Süre</span>
                            </div>
                            <div className="text-4xl font-black text-slate-900 relative z-10">
                                26.5 <span className="text-lg text-slate-400 font-medium">Saat</span>
                            </div>
                        </div>

                        {/* Günlük Ortalama */}
                        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-purple-900/5 p-6 rounded-[2rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full blur-2xl -mr-5 -mt-5 group-hover:bg-purple-100 transition-colors"></div>

                            <div className="flex items-center gap-3 mb-3 text-slate-600 relative z-10">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <TrendingUp size={20} />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wide">Günlük Ort.</span>
                            </div>
                            <div className="text-4xl font-black text-slate-900 relative z-10">
                                3.8 <span className="text-lg text-slate-400 font-medium">Saat</span>
                            </div>
                        </div>

                        {/* En Verimli Gün */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-[2rem] relative">
                            <div className="flex items-center gap-3 mb-3 text-emerald-700">
                                <div className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm">
                                    <Zap size={20} />
                                </div>
                                <span className="font-bold text-sm uppercase tracking-wide">En İyi Gün</span>
                            </div>
                            <div className="text-3xl font-black text-emerald-900">Cumartesi</div>
                            <p className="text-xs font-bold text-emerald-600 mt-2 bg-white/50 inline-block px-2 py-1 rounded-md">
                                🔥 6.5 saat çalışma
                            </p>
                        </div>
                    </div>

                    {/* 2. GRAFİK ALANI (Light Mode CSS Chart) */}
                    <div className="lg:col-span-3 bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-[2rem] p-8 relative">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <Calendar size={22} />
                                </div>
                                Aktivite Grafiği
                            </h2>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                        Bu Hafta
                    </span>
                        </div>

                        {/* Grafik Konteyneri */}
                        <div className="h-[320px] flex items-end gap-3 sm:gap-6 px-2 pb-2">
                            {weeklyData.map((data, index) => (
                                <div key={index} className="h-full flex-1 flex flex-col justify-end items-center gap-3 group cursor-pointer">

                                    {/* Tooltip (Hover) */}
                                    <div className="mb-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap absolute -mt-10 z-20">
                                        {data.saat} Saat
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                    </div>

                                    {/* Sütun (Bar) */}
                                    <div
                                        style={{ height: data.height }}
                                        className={`w-full max-w-[60px] rounded-t-2xl transition-all duration-500 relative overflow-hidden group-hover:brightness-110 shadow-sm
                                    ${index === 5
                                            ? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-purple-200'
                                            : 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-blue-200'
                                        }`}
                                    >
                                        {/* Bar İçindeki Parlama Efekti */}
                                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>

                                    {/* Gün İsmi */}
                                    <span className={`text-xs sm:text-sm font-bold transition-colors ${index === 5 ? 'text-purple-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
                                {data.name}
                            </span>
                                </div>
                            ))}
                        </div>

                        {/* Alt Çizgi */}
                        <div className="h-[2px] w-full bg-slate-100 mt-2 rounded-full"></div>
                    </div>

                    {/* 3. ALT BİLGİ KUTULARI */}
                    <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">

                        {/* Geliştirme Kutusu */}
                        <div className="bg-orange-50/80 border border-orange-100 rounded-[2rem] p-6 flex items-center gap-5 hover:bg-orange-50 transition-colors cursor-default">
                            <div className="p-4 bg-white text-orange-500 rounded-2xl shadow-sm border border-orange-100">
                                <Target size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-900 text-lg">Dikkat!</h3>
                                <p className="text-sm text-orange-700/80 mt-1">
                                    Çarşamba günleri performansın <span className="font-bold">%40</span> düşüyor. Hafta ortası motivasyonunu artırmalısın! 📉
                                </p>
                            </div>
                        </div>

                        {/* Övgü Kutusu */}
                        <div className="bg-blue-50/80 border border-blue-100 rounded-[2rem] p-6 flex items-center gap-5 hover:bg-blue-50 transition-colors cursor-default">
                            <div className="p-4 bg-white text-blue-500 rounded-2xl shadow-sm border border-blue-100">
                                <Zap size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-blue-900 text-lg">Harika İş!</h3>
                                <p className="text-sm text-blue-700/80 mt-1">
                                    Geçen haftaya göre <span className="font-bold bg-blue-200/50 px-1 rounded text-blue-800">%15</span> daha fazla odaklandın. Böyle devam et! 🚀
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Analytics;