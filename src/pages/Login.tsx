import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Yönlendirme araçları
import { Mail, Lock, Loader2 } from 'lucide-react';
import AuthCard from '../components/layout/AuthCard';
import TextInput from '../components/inputs/TextInput';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { supabase } from '../lib/supabaseClient';

const Login: React.FC = () => {
  const navigate = useNavigate(); // Sayfa değiştiren fonksiyon
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // BAŞARILI OLUNCA BURASI ÇALIŞIR:
      console.log("Giriş Başarılı, Yönlendiriliyor...");
      navigate("/dashboard"); // --> SENİ DASHBOARD'A FIRLATIR

    } catch (err: any) {
      setError("Giriş yapılamadı. Bilgilerini kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <AuthCard title="Tekrar Hoşgeldin!" subtitle="EduLink ile odaklanmaya hazır mısın?">
        <form className="space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-200 text-sm">{error}</div>}

          <TextInput label="E-posta" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={20} />} required />
          <TextInput label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock size={20} />} required />

          <div className="flex justify-end">
            <a href="#" className="text-sm text-blue-300 hover:underline">Şifremi Unuttum?</a>
          </div>

          <PrimaryButton type="submit" disabled={loading}>
            {loading ? <span className="flex items-center gap-2 justify-center"><Loader2 className="animate-spin" /> Giriş Yapılıyor...</span> : "Giriş Yap"}
          </PrimaryButton>

          <p className="text-center text-sm text-gray-300 mt-6">
            Henüz hesabın yok mu? <Link to="/signup" className="text-blue-300 font-bold hover:underline">Hemen Kayıt Ol</Link>
          </p>
        </form>
      </AuthCard>
  );
};

export default Login;