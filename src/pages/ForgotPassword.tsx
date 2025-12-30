import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async () => {
        setError(null);

        if (!email) {
            setError("Lütfen e-posta adresini gir.");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:5173/reset-password",
        });

        setLoading(false);

        if (error) {
            setError(
                "Mail gönderilirken bir hata oluştu. Lütfen tekrar dene."
            );
            return;
        }

        setSent(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-5">
                <h1 className="text-lg font-semibold mb-2">Şifremi Unuttum</h1>
                <p className="text-xs text-slate-400 mb-4">
                    E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim.
                </p>

                {error && (
                    <div className="mb-3 text-xs text-red-400">{error}</div>
                )}

                {sent ? (
                    <p className="text-sm text-emerald-400">
                        Mail gönderildi. Gelen kutunu kontrol et.
                    </p>
                ) : (
                    <>
                        <input
                            type="email"
                            className="w-full mb-3 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm outline-none"
                            placeholder="E-posta adresin"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-sm font-semibold py-2 transition"
                        >
                            {loading ? "Gönderiliyor..." : "Bağlantıyı Gönder"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
