import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, ArrowLeft, Camera } from 'lucide-react';

// DÜZELTME 1: Dosya adı büyük 'C' ile (Senin dosya yapına göre)
import { supabase } from '../lib/supabaseClient';

// DÜZELTME 2: Butonların yollarını garantiye alalım
import PrimaryButton from '../components/buttons/PrimaryButton';
import TextInput from '../components/inputs/TextInput';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        const getProfile = async () => {
            // Hata ihtimaline karşı güvenli veri çekme
            const { data } = await supabase.auth.getUser();
            if (data && data.user) {
                setEmail(data.user.email || '');
                const meta = data.user.user_metadata;
                if (meta && meta.full_name) {
                    setFullName(meta.full_name);
                }
            }
        };
        getProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;
            alert("Profil güncellendi! ✨");
        } catch (error: any) {
            console.error(error);
            alert("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-black text-white p-6 flex justify-center">
            <div className="w-full max-w-2xl">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Panele Dön
                </button>

                <div className="bg-blue-950/40 backdrop-blur-xl border border-blue-700/30 rounded-3xl p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold mb-1">Profil Ayarları</h1>
                    <p className="text-gray-400 mb-8">Hesap bilgilerini buradan yönetebilirsin.</p>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="flex justify-center mb-8">
                            <div className="relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-1">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                        <User size={40} className="text-gray-300" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-black group-hover:bg-blue-500 transition-colors">
                                    <Camera size={16} className="text-white" />
                                </div>
                            </div>
                        </div>

                        <TextInput
                            label="Ad Soyad"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            icon={<User size={18} />}
                            placeholder="İsim giriniz"
                            type="text"
                        />

                        <div className="opacity-70 pointer-events-none">
                            <TextInput
                                label="E-posta"
                                value={email}
                                icon={<Mail size={18} />}
                                type="email"
                                onChange={() => {}}
                                readOnly
                            />
                        </div>

                        <div className="pt-4">
                            {/* Hata çıkmasın diye className'i kaldırdım, gerekirse ekleriz */}
                            <PrimaryButton type="submit" disabled={loading}>
                                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;