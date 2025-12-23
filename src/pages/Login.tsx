import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        console.log('Giriş başarılı:', data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
      // YENİ TASARIM: Landing Page ile aynı dinamik arka plan
      <div className="min-h-screen bg-slate-50 relative flex items-center justify-center overflow-hidden p-4">

        {/* --- ARKA PLAN EFEKTLERİ (Landing Page'den alındı) --- */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/30 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>

        {/* Sol Üst Logo */}
        <div
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity z-20"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-xl font-bold text-slate-900">EduLink<span className="text-blue-600">.</span></span>
        </div>

        {/* Kart Yapısı */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-blue-900/10 rounded-3xl p-8 md:p-10 relative z-10">

          <div className="text-center mb-8">
            {/* Landing Page'deki BÜYÜK YAZI RENGİ BURAYA UYGULANDI 👇 */}
            <h2 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 drop-shadow-sm">
              Tekrar Hoşgeldin! 👋
            </h2>
            <p className="text-slate-500 font-medium">EduLink ile potansiyelini keşfetmeye devam et.</p>
          </div>

          {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm animate-pulse">
                <AlertCircle size={18} />
                {error}
              </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">E-posta Adresi</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="ornek@ogrenci.com"
                    required
                />
              </div>
            </div>

            {/* Şifre Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-700">Şifre</label>
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">Şifremi Unuttum?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium"
                    placeholder="••••••••"
                    required
                />
              </div>
            </div>

            {/* Giriş Butonu */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                  <>Giriş Yap <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Hesabın yok mu?{' '}
            <button onClick={() => navigate('/signup')} className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Hemen Kaydol
            </button>
          </div>

        </div>
      </div>
  );
};

export default Login;