import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

type Strength = "weak" | "medium" | "strong"

// Şifre gücünü hesapla
function getPasswordStrength(password: string): Strength {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return "weak"
  if (score <= 4) return "medium"
  return "strong"
}

// Güçlü şifre üret
function generateStrongPassword(length: number = 16): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const digits = "0123456789"
  const symbols = "!@#$%^&*()-_=+[]{};:,.<>/?"
  const all = upper + lower + digits + symbols

  let password = ""
  password += upper[Math.floor(Math.random() * upper.length)]
  password += lower[Math.floor(Math.random() * lower.length)]
  password += digits[Math.floor(Math.random() * digits.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  const arr = password.split("")
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr.join("")
}

export function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [passwordAgain, setPasswordAgain] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordAgain, setShowPasswordAgain] = useState(false)
  const [secondTouched, setSecondTouched] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.auth.getUser()
      console.log("[reset-password] getUser:", { data, error })

      if (error || !data?.user) {
        setError(
          "Bu şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar 'Şifreni mi unuttun?' diyerek yeni bir bağlantı iste."
        )
      }
      setCheckingSession(false)
    }

    check()
  }, [])

  const strength = getPasswordStrength(password)
  const strengthBarWidth =
    strength === "weak" ? "33%" : strength === "medium" ? "66%" : "100%"
  const strengthBarClass =
    strength === "weak"
      ? "bg-red-500"
      : strength === "medium"
      ? "bg-amber-400"
      : "bg-emerald-500"
  const strengthTextClass =
    strength === "weak"
      ? "text-red-400"
      : strength === "medium"
      ? "text-amber-300"
      : "text-emerald-300"

  const strengthLabel =
    strength === "weak"
      ? "Zayıf – en az 12 karakter, büyük/küçük harf, sayı ve sembol kullan."
      : strength === "medium"
      ? "Orta – biraz daha uzun ve daha çeşitli karakterler ekle."
      : "Güçlü – bu şifre gayet iyi görünüyor. 👍"

  const passwordsMismatch =
    secondTouched && passwordAgain.length > 0 && password !== passwordAgain

  const handleSuggestPassword = () => {
    const suggested = generateStrongPassword(16)
    setPassword(suggested)
    setPasswordAgain(suggested)
    setSecondTouched(true)
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!password || !passwordAgain) {
      setError("Lütfen yeni şifreni iki alana da yaz.")
      return
    }

    if (password !== passwordAgain) {
      setError("Şifreler birbiriyle eşleşmiyor.")
      return
    }

    if (password.length < 12) {
      setError("Şifre en az 12 karakter olmalı.")
      return
    }
    if (!/[A-Z]/.test(password)) {
      setError("Şifre en az bir büyük harf içermeli.")
      return
    }
    if (!/[a-z]/.test(password)) {
      setError("Şifre en az bir küçük harf içermeli.")
      return
    }
    if (!/\d/.test(password)) {
      setError("Şifre en az bir rakam içermeli.")
      return
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Şifre en az bir sembol içermeli. (örn: ! @ # $ %)")
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      })

      console.log("[reset-password] updateUser:", { data, error })

      if (error) {
        setError(
          "Şifre güncellenirken bir hata oluştu. Bağlantının süresi dolmuş olabilir, lütfen yeniden şifre sıfırlama iste."
        )
        return
      }

      setSuccess(
        "Şifren başarıyla güncellendi! Birkaç saniye içinde ana sayfaya yönlendirileceksin."
      )
      setPassword("")
      setPasswordAgain("")

      setTimeout(() => {
        navigate("/")
      }, 1800)
    } catch (err) {
      console.error(err)
      setError(
        "Şifre güncellenirken bir hata oluştu. Lütfen daha sonra tekrar dene."
      )
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p>Bağlantı kontrol ediliyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl shadow-black/40">
        {/* Başlık */}
        <div className="mb-4 text-center">
          <h1 className="text-xl font-semibold mb-1">Yeni Şifreni Belirle</h1>
          <p className="text-xs text-slate-400">
            Güçlü bir şifre seç, seni uzun süre idare etsin. 🔐
          </p>
        </div>

        {/* Mesajlar */}
        {error && (
          <div className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {success}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Yeni şifre */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 flex items-center justify-between">
              <span>Yeni şifre</span>
              <span className="text-[10px] text-slate-500">
                En az 12 karakter, büyük/küçük harf, sayı, sembol
              </span>
            </label>

            <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 px-3 focus-within:ring-2 focus-within:ring-emerald-500/70">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-transparent py-2 text-sm outline-none"
                placeholder="Güçlü bir şifre belirle"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="ml-2 text-xs text-slate-400 hover:text-emerald-400 transition"
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>

            {/* Güç göstergesi */}
            {password && (
              <div className="mt-1 space-y-1">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthBarClass} transition-all duration-300`}
                    style={{ width: strengthBarWidth }}
                  />
                </div>
                <p className={`text-[11px] ${strengthTextClass}`}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          {/* Şifre tekrar */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">
              Yeni şifre (tekrar)
            </label>
            <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950 px-3 focus-within:ring-2 focus-within:ring-emerald-500/70">
              <input
                type={showPasswordAgain ? "text" : "password"}
                className="w-full bg-transparent py-2 text-sm outline-none"
                placeholder="Şifreni tekrar yaz"
                value={passwordAgain}
                onChange={(e) => setPasswordAgain(e.target.value)}
                onFocus={() => setSecondTouched(true)}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
              />
              <button
                type="button"
                onClick={() => setShowPasswordAgain((prev) => !prev)}
                className="ml-2 text-xs text-slate-400 hover:text-emerald-400 transition"
              >
                {showPasswordAgain ? "👁️" : "🙈"}
              </button>
            </div>
            {passwordsMismatch && (
              <p className="text-[11px] text-red-400">
                Şifreler şu an birbiriyle uyuşmuyor.
              </p>
            )}
          </div>
        </div>

        {/* 🎲 Güçlü şifre öner butonu – iki inputun da altında */}
        <button
          type="button"
          onClick={handleSuggestPassword}
          className="flex items-center gap-2 mt-4 mb-2 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 transition text-xs"
        >
          <span>🎲</span> Güçlü şifre öner
        </button>

        {/* Şifremi güncelle */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-sm font-semibold py-2.5 transition shadow-md shadow-emerald-500/30"
        >
          {loading ? "Şifre güncelleniyor..." : "Şifremi Güncelle"}
        </button>
      </div>
    </div>
  )
}
