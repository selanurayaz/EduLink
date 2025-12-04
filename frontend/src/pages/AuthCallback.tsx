import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

export function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string>("Girişin hazırlanıyor...")
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      // URL'de Supabase'in döndürdüğü hata varsa önce onu yakalayalım
      const params = new URLSearchParams(window.location.search)
      const errorDesc = params.get("error_description")

      if (errorDesc) {
        setError(
          "Bağlantı doğrulanırken bir hata oluştu: " +
            decodeURIComponent(errorDesc)
        )
        setInfo("")
        return
      }

      // Kullanıcı gerçekten oturum almış mı kontrol et
      const { data, error } = await supabase.auth.getUser()
      console.log("[auth-callback] getUser:", { data, error })

      if (error || !data?.user) {
        setError(
          "Giriş bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar deneyip yeni bir bağlantı iste."
        )
        setInfo("")
        return
      }

      // Başarılı
      setInfo("Giriş başarılı! Ana sayfaya yönlendiriliyorsun...")
      setError(null)

      setTimeout(() => {
        navigate("/") // Hero/Login akışına geri dön
      }, 1500)
    }

    run()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-center shadow-xl shadow-black/40">
        <h1 className="text-lg font-semibold mb-2">Giriş işlemi</h1>

        {info && (
          <p className="text-sm text-slate-300 mb-3 animate-pulse">
            {info}
          </p>
        )}

        {error && (
          <div className="mt-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {!error && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Güvenli bir şekilde oturum açman sağlanıyor...</span>
          </div>
        )}
      </div>
    </div>
  )
}
