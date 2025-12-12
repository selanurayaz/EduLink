import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, User, BarChart2 } from 'lucide-react';
import FocusCamera from '../components/camera/FocusCamera';
import { supabase } from '../lib/supabaseClient'; // Eğer hata verirse 'c' harfini küçültmeyi unutma

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-black text-white">

            {/* ÜST MENÜ (NAVBAR) */}
            <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Sol Taraf: Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <LayoutDashboard size={20} className="text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">EduLink<span className="text-blue-400">+</span></span>
                        </div>

                        {/* Sağ Taraf: Butonlar */}
                        <div className="flex items-center gap-4">

                            {/* ✅ YENİ EKLENEN: Profil Butonu */}
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                            >
                                <User size={18} />
                                <span>Profilim</span>
                            </button>

                            {/* Çıkış Yap Butonu */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 transition-all"
                            >
                                <LogOut size={18} />
                                <span>Çıkış</span>
                            </button>
                        </div>

                    </div>
                </div>
            </nav>

            {/* ANA İÇERİK */}
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

                {/* Karşılama */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Hoşgeldin! 👋</h1>
                    <p className="text-gray-400">Yapay zeka odaklanmanı analiz etmek için hazır.</p>
                </div>

                {/* Grid Yapısı */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* SOL: Kamera */}
                    <div className="lg:col-span-2 space-y-6">
                        <FocusCamera />
                    </div>

                    {/* SAĞ: İstatistik (Şimdilik Boş) */}
                    <div className="space-y-6">
                        <div className="bg-blue-950/40 border border-blue-500/20 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <BarChart2 className="text-blue-400" />
                                <h3 className="font-semibold text-blue-100">Odak Skoru</h3>
                            </div>
                            <div className="text-4xl font-bold text-white mb-1">--</div>
                            <p className="text-sm text-blue-300/60">Henüz veri yok</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <h3 className="font-semibold mb-4">Bugünün Hedefleri</h3>
                            <p className="text-sm text-gray-500">Henüz hedef eklemedin.</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Dashboard;