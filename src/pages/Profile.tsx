import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Shield, LogOut, Settings, Award, Zap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserData();
    }, []);

    const getUserData = async () => {
        try {
            // 1. Kullanıcıyı çek
            const { data: { user } } = await supabase.auth.getUser();

            // 2. Eğer kullanıcı yoksa (Giriş yapmamışsa) Login'e at
            if (!user) {
                navigate('/login');
                return;
            }

            // 3. Kullanıcı varsa kaydet
            setUser(user);
        } catch (error) {
            console.error("Profil hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login"); // Çıkış yapınca login'e git
    };

    // Yüklenirken dönen yuvarlak
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Eğer yükleme bitti ama user hala yoksa (Render hatasını önlemek için)
    if (!user) return null;

    // Tarihi güvenli formatlama fonksiyonu
    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return "Tarih yok";
            return new Date(dateString).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return "Tarih Hatası";
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-200 p-4 md:p-8">

            {/* ARKA PLAN EFEKTLERİ */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0"></div>

            <div className="max-w-5xl mx-auto relative z-10">

                {/* ÜST BAR */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-sm border border-slate-200 transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform"/>
                    </button>
                    <h1 className="text-3xl font-black text-slate-900">Profilim</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL KOLON: Profil Kartı */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-[2rem] p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500 to-cyan-400"></div>

                            <div className="relative z-10">
                                {/* Profil Resmi */}
                                <div className="w-24 h-24 mx-auto bg-white p-1 rounded-full shadow-lg mb-4">
                                    <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <User size={40} />
                                    </div>
                                </div>

                                {/* İsim Kontrolü (Metadata yoksa 'Öğrenci' yazar) */}
                                <h2 className="text-xl font-bold text-slate-900">
                                    {user.user_metadata?.full_name || 'Öğrenci'}
                                </h2>
                                <p className="text-sm text-slate-500 mb-6">{user.email}</p>

                                <div className="flex justify-center gap-2 mb-6">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1">
                                🛡️ Standart Üye
                            </span>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 rounded-xl border-2 border-red-50 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LogOut size={18} /> Çıkış Yap
                                </button>
                            </div>
                        </div>

                        {/* Rozetler */}
                        <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-[2rem] p-6">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Award className="text-yellow-500" /> Başarı Rozetleri
                            </h3>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 shadow-sm shrink-0" title="İlk Giriş">
                                    <Zap size={24} />
                                </div>
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 shadow-inner shrink-0 border border-slate-200 border-dashed">
                                    <span className="text-xs font-bold">?</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ KOLON: Detaylar */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Hesap Bilgileri */}
                        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-[2rem] p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Hesap Bilgileri</h3>
                                <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                    <Settings size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="group">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">E-Posta Adresi</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl group-hover:border-blue-200 transition-colors">
                                        <Mail className="text-slate-400" size={20} />
                                        <span className="text-slate-700 font-medium">{user.email}</span>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Kayıt Tarihi</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl group-hover:border-blue-200 transition-colors">
                                        <Calendar className="text-slate-400" size={20} />
                                        {/* GÜVENLİ TARİH FONKSİYONU KULLANILDI 👇 */}
                                        <span className="text-slate-700 font-medium">
                                    {formatDate(user.created_at)}
                                </span>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Hesap Güvenliği</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl group-hover:border-blue-200 transition-colors">
                                        <Shield className="text-green-500" size={20} />
                                        <span className="text-slate-700 font-medium">E-posta doğrulandı</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;