import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

export function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string>("Girişin hazırlanıyor...")
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    let finished = false

    // ⏱ ZAMAN AŞIMI: 8 sn içinde iş bitmezse giriş sayfasına at
    const timeoutId = window.setTimeout(() => {
      if (!isMounted || finished) return

      finished = true
      setError("Giriş işlemi zaman aşımına uğradı. Lütfen tekrar dene.")
      setInfo("")
      navigate("/", { replace: true }) // 🔙 giriş sayfası
    }, 8000)

    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const errorDesc = params.get("error_description")

        // URL'de hata varsa
        if (errorDesc) {
          if (!isMounted) return
          clearTimeout(timeoutId)
          finished = true

          setError(
            "Bağlantı doğrulanırken bir hata oluştu: " +
              decodeURIComponent(errorDesc)
          )
          setInfo("")

          setTimeout(() => {
            navigate("/", { replace: true }) // 🔙 giriş sayfası
          }, 2000)
          return
        }

        // Kullanıcı gerçekten oturum almış mı
        const { data, error } = await supabase.auth.getUser()
        console.log("[auth-callback] getUser:", { data, error })

        if (!isMounted) return

        if (error || !data?.user) {
          clearTimeout(timeoutId)
          finished = true

          setError(
            "Giriş bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar giriş yap."
          )
          setInfo("")

          setTimeout(() => {
            navigate("/", { replace: true }) // 🔙 giriş sayfası
          }, 2000)
          return
        }

        // ✅ Başarılı
        clearTimeout(timeoutId)
        finished = true

        setInfo("Giriş başarılı! Ana sayfaya yönlendiriliyorsun...")
        setError(null)

        setTimeout(() => {
          navigate("/home", { replace: true }) // 🏠 ana sayfa
        }, 1500)
      } catch (err) {
        console.error("[auth-callback] run error:", err)
        if (!isMounted) return
        clearTimeout(timeoutId)
        finished = true

        setError(
          "Giriş sırasında beklenmeyen bir hata oluştu. Lütfen tekrar dene."
        )
        setInfo("")

        setTimeout(() => {
          navigate("/", { replace: true }) // 🔙 giriş sayfası
        }, 2000)
      }
    }

    run()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
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
