import React, { useState } from 'react';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import AuthCard from '../components/layout/AuthCard';
import TextInput from '../components/inputs/TextInput';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { supabase } from '../lib/supabaseClient';

const Signup: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // Ekstra olarak İsim de alalım
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Supabase ile Kayıt Olma İşlemi
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName, // İsmi de veritabanına ekleyelim
                    },
                },
            });

            if (error) throw error;

            setSuccess(true);
            console.log("Kayıt Başarılı:", data);
            alert("Kayıt başarılı! Şimdi giriş yapabilirsin.");

        } catch (err: any) {
            console.error("Kayıt Hatası:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Aramıza Katıl"
            subtitle="EduLink ile potansiyelini keşfetmeye başla."
        >
            <form className="space-y-6" onSubmit={handleSignup}>

                {/* Hata Mesajı */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Başarı Mesajı */}
                {success && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-200 text-sm text-center">
                        Hesabın oluşturuldu! Giriş yapabilirsin.
                    </div>
                )}

                <TextInput
                    label="Adın Soyadın"
                    type="text"
                    placeholder="Şevval Yılmaz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    icon={<User size={20} />}
                    required
                />

                <TextInput
                    label="E-posta Adresi"
                    type="email"
                    placeholder="ogrenci@edulink.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={<Mail size={20} />}
                    required
                />

                <TextInput
                    label="Şifre"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={<Lock size={20} />}
                    required
                    minLength={6}
                />

                <PrimaryButton type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 py-3 text-lg flex items-center justify-center gap-2">
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Hesap Oluşturuluyor...
                        </>
                    ) : (
                        "Ücretsiz Kayıt Ol"
                    )}
                </PrimaryButton>

                <p className="text-center text-sm text-gray-300 mt-6">
                    Zaten hesabın var mı? <a href="#" className="font-semibold text-blue-300 hover:text-blue-100 hover:underline transition-colors">Giriş Yap</a>
                </p>
            </form>
        </AuthCard>
    );
};

export default Signup;