import { useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabaseClient"

type Mode = "signin" | "signup"
type EyeState = "forward" | "down" | "closed"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function MonkeyFace({ eyeState }: { eyeState: EyeState }) {
  const isClosed = eyeState === "closed"
  const isDown = eyeState === "down"

  return (
    <div className="relative flex items-center justify-center">
      <div className="h-20 w-20 rounded-full bg-amber-300 shadow-inner shadow-amber-500/40 relative">
        {/* Kulaklar */}
        <div className="absolute -left-3 top-6 h-7 w-7 rounded-full bg-amber-300 border border-amber-400" />
        <div className="absolute -right-3 top-6 h-7 w-7 rounded-full bg-amber-300 border border-amber-400" />
        {/* Yüz alt bölge */}
        <div className="absolute inset-x-3 bottom-3 h-8 rounded-3xl bg-amber-200" />
        {/* Gözler */}
        <div className="absolute inset-x-4 top-6 flex justify-between px-1">
          {["left", "right"].map((side) => (
            <div key={side} className="relative h-4 w-4">
              <div className="absolute inset-0 rounded-full bg-white" />
              {isClosed ? (
                <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-amber-700 rounded-full" />
              ) : (
                <div
                  className="absolute h-2 w-2 rounded-full bg-amber-900"
                  style={{
                    top: isDown ? "14px" : "8px",
                    left: "8px",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        {/* Ağız */}
        <div className="absolute inset-x-6 bottom-4 h-4 flex items-center justify-center">
          <div className="h-3 w-6 rounded-b-full border-b-2 border-amber-800" />
        </div>
      </div>
    </div>
  )
}

function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
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

function generateStrongPassword(length = 14): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lower = "abcdefghijkmnopqrstuvwxyz"
  const digits = "0123456789"
  const symbols = "!@#$%^&*()_+-=<>?"
  const all = upper + lower + digits + symbols

  let pwd = ""
  pwd += upper[Math.floor(Math.random() * upper.length)]
  pwd += lower[Math.floor(Math.random() * lower.length)]
  pwd += digits[Math.floor(Math.random() * digits.length)]
  pwd += symbols[Math.floor(Math.random() * symbols.length)]

  for (let i = pwd.length; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)]
  }

  return pwd
}

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin")

  // Sign in state
  const [signinEmail, setSigninEmail] = useState("")
  const [signinPassword, setSigninPassword] = useState("")
  const [showSigninPassword, setShowSigninPassword] = useState(true)

  // Sign up state
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [showSignupPassword, setShowSignupPassword] = useState(true)

  // Validasyon state
  const [signinEmailError, setSigninEmailError] = useState<string | null>(null)
  const [signinPasswordError, setSigninPasswordError] = useState<string | null>(null)
  const [signupNameError, setSignupNameError] = useState<string | null>(null)
  const [signupEmailError, setSignupEmailError] = useState<string | null>(null)
  const [signupPasswordError, setSignupPasswordError] = useState<string | null>(null)

  // Ortak state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isSignup = mode === "signup"

  // Maymunun bakacağı aktif şifre alanı
  const activePassword = isSignup ? signupPassword : signinPassword
  const activeVisible = isSignup ? showSignupPassword : showSigninPassword

  let eyeState: EyeState = "forward"
  if (!activePassword) eyeState = "forward"
  else if (!activeVisible) eyeState = "closed"
  else eyeState = "down"

  const containerBg = "bg-slate-950"
  const textMain = "text-slate-100"
  const cardBg = "bg-slate-900/70"
  const cardBorder = "border-slate-700"
  const inputBg = "bg-slate-900"
  const inputBorder = "border-slate-700"

  const resetMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const resetFieldErrors = () => {
    setSigninEmailError(null)
    setSigninPasswordError(null)
    setSignupNameError(null)
    setSignupEmailError(null)
    setSignupPasswordError(null)
  }

  const showSuccess = (message: string) => {
    setSuccess(message)
    setTimeout(() => {
      setSuccess(null)
    }, 15000)
  }

  const goSignup = () => {
    resetMessages()
    resetFieldErrors()
    setMode("signup")
  }

  const goSignin = () => {
    resetMessages()
    resetFieldErrors()
    setMode("signin")
  }

  // 🔑 GİRİŞ
  const handleSignin = async () => {
    resetMessages()
    resetFieldErrors()

    let hasError = false

    if (!signinEmail.trim()) {
      setSigninEmailError("E-posta adresi boş olamaz.")
      hasError = true
    } else if (!emailRegex.test(signinEmail)) {
      setSigninEmailError("Lütfen geçerli bir e-posta adresi giriniz.")
      hasError = true
    }

    if (!signinPassword) {
      setSigninPasswordError("Şifre alanı boş olamaz.")
      hasError = true
    }

    if (hasError) return

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password: signinPassword,
      })
      if (error) throw error
      console.log("Giriş başarılı:", data)
      showSuccess("Giriş başarılı! Birazdan çalışma alanına yönlendirileceksin.")
    } catch (err: any) {
      console.error(err)
      setError("Giriş yapılamadı. E-posta veya şifreyi kontrol et.")
    } finally {
      setLoading(false)
    }
  }

  // 🔑 Google ile devam (hem giriş hem kayıt için)
  const handleGoogleContinue = async () => {
  resetMessages()
  resetFieldErrors()
  setLoading(true)
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/dashboard",
        queryParams: {
          prompt: "select_account", // 🔥 her seferinde hesap seçtir
        },
      },
    })
    if (error) throw error
    console.log("Google ile yönlendirme:", data)
    showSuccess(
      mode === "signin"
        ? "Google ile giriş yapmak için yönlendiriliyorsun..."
        : "Google ile hesabın oluşturulup giriş yapman için yönlendiriliyorsun..."
    )
  } catch (err: any) {
    console.error(err)
    setError("Google ile devam ederken bir sorun oluştu. Lütfen tekrar dene.")
    setLoading(false)
  }
}


  // 🆕 KAYIT
  const handleSignup = async () => {
    resetMessages()
    resetFieldErrors()

    let hasError = false

    if (!signupName.trim()) {
      setSignupNameError("Ad Soyad alanı boş olamaz.")
      hasError = true
    }

    if (!signupEmail.trim()) {
      setSignupEmailError("E-posta adresi boş olamaz.")
      hasError = true
    } else if (!emailRegex.test(signupEmail)) {
      setSignupEmailError("Lütfen geçerli bir e-posta adresi giriniz.")
      hasError = true
    }

    if (!signupPassword) {
      setSignupPasswordError("Şifre alanı boş olamaz.")
      hasError = true
    }

    if (hasError) return

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
      })
      if (error) throw error
      if (data.user) {
        const { error: insertError } = await supabase
          .from("kullanicilar")
          .insert({
            ad_soyad: signupName,
            eposta: signupEmail,
            auth_user_id: data.user.id,
          })
        if (insertError) throw insertError
      }
      console.log("Kayıt başarılı:", data)
      showSuccess(
        "Kayıt başarılı! Eğer mail doğrulaması gerekiyorsa, lütfen e-posta kutunu kontrol et."
      )
    } catch (err: any) {
      console.error(err)
      setError("Kayıt sırasında bir hata oluştu. Lütfen bilgilerini kontrol et.")
    } finally {
      setLoading(false)
    }
  }

  const signupPasswordStrength = getPasswordStrength(signupPassword)
  const strengthLabel =
    signupPasswordStrength === "weak"
      ? "Zayıf – en az 12 karakter, büyük/küçük harf, sayı ve sembol kullan."
      : signupPasswordStrength === "medium"
      ? "Orta – biraz daha uzun ve daha çeşitli karakterler ekle."
      : "Güçlü – bu şifre gayet iyi görünüyor. 👍"

  const strengthBarWidth =
    signupPasswordStrength === "weak"
      ? "33%"
      : signupPasswordStrength === "medium"
      ? "66%"
      : "100%"

  const strengthBarClass =
    signupPasswordStrength === "weak"
      ? "bg-red-500"
      : signupPasswordStrength === "medium"
      ? "bg-amber-400"
      : "bg-emerald-500"

  const strengthTextClass =
    signupPasswordStrength === "weak"
      ? "text-red-400"
      : signupPasswordStrength === "medium"
      ? "text-amber-300"
      : "text-emerald-300"

  return (
    <div
      className={`min-h-screen ${containerBg} ${textMain} flex items-center justify-center px-6 font-body`}
    >
      <div className="w-full max-w-5xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/60 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full border-2 border-emerald-400 relative">
              <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-emerald-400 bg-slate-950" />
            </div>
          </div>
          <span className="text-xl font-semibold tracking-tight font-display">
            <span>Edu</span>
            <span className="text-emerald-400">Link</span>
          </span>
        </div>

        {/* Hata / başarı mesajı */}
        {(error || success) && (
          <div className="mb-4 text-sm">
            {error && <p className="text-red-400">{error}</p>}
            {success && <p className="text-emerald-400">{success}</p>}
          </div>
        )}

        {/* İki kart yan yana */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* METİN KARTI */}
          <motion.div
            layout
            style={{ order: isSignup ? 2 : 1 }} // signin -> sol, signup -> sağ
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={`flex-1 rounded-3xl border ${cardBorder} ${cardBg} p-6 flex flex-col justify-between`}
          >
            {mode === "signin" ? (
              <>
                <div>
                  <h2 className="text-xl font-display font-semibold mb-2">
                    EduLink’e ilk kez mi geliyorsun?
                  </h2>
                  <p className="text-sm text-slate-300">
                    Hedeflerini, ders programını ve odak süreni takip etmek için
                    birkaç adımda ücretsiz hesap oluştur.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goSignup}
                  className="self-start mt-6 rounded-xl border border-emerald-400/70 px-5 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10 transition"
                >
                  Yeni misin? Kaydol
                </button>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-display font-semibold mb-2">
                    Zaten hesabın var mı?
                  </h2>
                  <p className="text-sm text-slate-300">
                    Giriş yap, çalışmalarını kaldığın yerden devam ettir.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={goSignin}
                  className="self-start mt-6 rounded-xl border border-emerald-400/70 px-5 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10 transition"
                >
                  Hesabın var mı? Giriş yap
                </button>
              </>
            )}
          </motion.div>

          {/* MAYMUNLU FORM KARTI */}
          <motion.div
            layout
            style={{ order: isSignup ? 1 : 2 }} // signin -> sağ, signup -> sol
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={`flex-1 rounded-3xl border ${cardBorder} ${cardBg} p-6`}
          >
            <div className="flex justify-center mb-4">
              <MonkeyFace eyeState={eyeState} />
            </div>

            {mode === "signin" ? (
              <>
                <h2 className="text-xl font-display font-semibold mb-4 text-center">
                  Giriş yap
                </h2>

                <div className="space-y-4">
                  {/* E-posta */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">
                      E-posta
                    </label>
                    <input
                      type="email"
                      className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${inputBg} ${
                        signinEmailError
                          ? "border-red-500 focus:ring-2 focus:ring-red-500"
                          : `${inputBorder} focus:ring-2 focus:ring-emerald-500/70`
                      }`}
                      placeholder="ornek@edulink.app"
                      value={signinEmail}
                      onChange={(e) => {
                        setSigninEmail(e.target.value)
                        if (signinEmailError) setSigninEmailError(null)
                      }}
                    />
                    {signinEmailError && (
                      <p className="text-[11px] text-red-400">
                        {signinEmailError}
                      </p>
                    )}
                  </div>

                  {/* Şifre */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">
                      Şifre
                    </label>
                    <div
                      className={`flex items-center rounded-xl border px-3 ${
                        signinPasswordError
                          ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                          : `${inputBorder} focus-within:ring-2 focus-within:ring-emerald-500/70`
                      } ${inputBg}`}
                    >
                      <input
                        type={showSigninPassword ? "text" : "password"}
                        className="w-full bg-transparent py-2 text-sm outline-none"
                        placeholder="••••••••"
                        value={signinPassword}
                        onChange={(e) => {
                          setSigninPassword(e.target.value)
                          if (signinPasswordError) setSigninPasswordError(null)
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSigninPassword((prev) => !prev)
                        }
                        className="ml-2 text-xs text-slate-400 hover:text-emerald-400 transition"
                      >
                        {showSigninPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                    {signinPasswordError && (
                      <p className="text-[11px] text-red-400">
                        {signinPasswordError}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignin}
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-sm font-semibold py-2.5 transition shadow-md shadow-emerald-500/30"
                >
                  {loading && !isSignup ? "Giriş yapılıyor..." : "Giriş Yap"}
                </button>

                {/* Google ile devam butonu – daha soluk */}
                <button
                  type="button"
                  onClick={handleGoogleContinue}
                  disabled={loading}
                  className="mt-3 w-full rounded-xl border border-slate-700/60 bg-slate-900/40 text-slate-100/80 text-sm font-semibold py-2.5 shadow-none hover:bg-slate-900/70 hover:border-emerald-400/60 disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-sm overflow-hidden opacity-70">
                    <svg viewBox="0 0 48 48" className="h-5 w-5">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6 1.54 7.38 2.84l5.42-5.42C33.64 3.74 29.3 2 24 2 14.82 2 7.16 7.66 4.15 15.13l6.9 5.36C12.57 14.14 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#34A853"
                        d="M46.15 24.5c0-1.57-.14-3.08-.4-4.5H24v9h12.9c-.56 2.9-2.23 5.36-4.73 7.02l7.37 5.72C43.84 37.96 46.15 31.74 46.15 24.5z"
                      />
                      <path
                        fill="#4A90E2"
                        d="M11.05 28.02A14.5 14.5 0 0 1 9.5 24c0-1.4.19-2.76.55-4.02l-6.9-5.36A22.42 22.42 0 0 0 2 24c0 3.6.86 7 2.4 10l6.65-5.98z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M24 46c5.3 0 9.74-1.74 12.99-4.76l-7.37-5.72C28.14 36.51 26.2 37 24 37c-6.26 0-11.43-4.64-12.8-10.88l-6.9 5.36C7.16 40.34 14.82 46 24 46z"
                      />
                    </svg>
                  </span>
                  <span>Google ile devam et</span>
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-display font-semibold mb-4 text-center">
                  Kayıt ol
                </h2>

                <div className="space-y-4">
                  {/* Ad Soyad */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${inputBg} ${
                        signupNameError
                          ? "border-red-500 focus:ring-2 focus:ring-red-500"
                          : `${inputBorder} focus:ring-2 focus:ring-emerald-500/70`
                      }`}
                      placeholder="Adın ve soyadın"
                      value={signupName}
                      onChange={(e) => {
                        setSignupName(e.target.value)
                        if (signupNameError) setSignupNameError(null)
                      }}
                    />
                    {signupNameError && (
                      <p className="text-[11px] text-red-400">
                        {signupNameError}
                      </p>
                    )}
                  </div>

                  {/* E-posta */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium">
                      E-posta
                    </label>
                    <input
                      type="email"
                      className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${inputBg} ${
                        signupEmailError
                          ? "border-red-500 focus:ring-2 focus:ring-red-500"
                          : `${inputBorder} focus:ring-2 focus:ring-emerald-500/70`
                      }`}
                      placeholder="ornek@edulink.app"
                      value={signupEmail}
                      onChange={(e) => {
                        setSignupEmail(e.target.value)
                        if (signupEmailError) setSignupEmailError(null)
                      }}
                    />
                    {signupEmailError && (
                      <p className="text-[11px] text-red-400">
                        {signupEmailError}
                      </p>
                    )}
                  </div>

                  {/* Şifre */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400 font-medium flex items-center justify-between">
                      <span>Şifre</span>
                      <span className="text-[10px] text-slate-400">
                        En az 12 karakter, harf + sayı + sembol
                      </span>
                    </label>
                    <div
                      className={`flex items-center rounded-xl border px-3 ${inputBg} ${
                        signupPasswordError
                          ? "border-red-500 focus-within:ring-2 focus-within:ring-red-500"
                          : `${inputBorder} focus-within:ring-2 focus-within:ring-emerald-500/70`
                      }`}
                    >
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        className="w-full bg-transparent py-2 text-sm outline-none"
                        placeholder="Güçlü bir şifre belirle"
                        value={signupPassword}
                        onChange={(e) => {
                          setSignupPassword(e.target.value)
                          if (signupPasswordError) setSignupPasswordError(null)
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowSignupPassword((prev) => !prev)
                        }
                        className="ml-2 text-xs text-slate-400 hover:text-emerald-400 transition"
                      >
                        {showSignupPassword ? "👁️" : "🙈"}
                      </button>
                    </div>
                    {signupPasswordError && (
                      <p className="text-[11px] text-red-400">
                        {signupPasswordError}
                      </p>
                    )}

                    {/* Şifre gücü göstergesi */}
                    {signupPassword && (
                      <div className="mt-2 space-y-1">
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

                    {/* Şifre oluştur butonu */}
                    <button
                      type="button"
                      onClick={() => {
                        const strongPwd = generateStrongPassword()
                        setSignupPassword(strongPwd)
                        showSuccess(
                          "Senin için güçlü bir şifre oluşturduk. İstersen kopyalayıp güvenli bir yere kaydet."
                        )
                      }}
                      className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-1.5 text-[11px] text-slate-200 hover:border-emerald-400 hover:bg-emerald-500/5 transition"
                    >
                      🎲 Güçlü şifre öner
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignup}
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-sm font-semibold py-2.5 transition shadow-md shadow-emerald-500/30"
                >
                  {loading && isSignup ? "Kayıt yapılıyor..." : "Öğrenmeye Başla"}
                </button>

                {/* Kayıtta Google ile kaydol – daha soluk */}
                <button
                  type="button"
                  onClick={handleGoogleContinue}
                  disabled={loading}
                  className="mt-3 w-full rounded-xl border border-slate-700/60 bg-slate-900/40 text-slate-100/80 text-sm font-semibold py-2.5 shadow-none hover:bg-slate-900/70 hover:border-emerald-400/60 disabled:opacity-40 transition flex items-center justify-center gap-2"
                >
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-sm overflow-hidden opacity-70">
                    <svg viewBox="0 0 48 48" className="h-5 w-5">
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6 1.54 7.38 2.84l5.42-5.42C33.64 3.74 29.3 2 24 2 14.82 2 7.16 7.66 4.15 15.13l6.9 5.36C12.57 14.14 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#34A853"
                        d="M46.15 24.5c0-1.57-.14-3.08-.4-4.5H24v9h12.9c-.56 2.9-2.23 5.36-4.73 7.02l7.37 5.72C43.84 37.96 46.15 31.74 46.15 24.5z"
                      />
                      <path
                        fill="#4A90E2"
                        d="M11.05 28.02A14.5 14.5 0 0 1 9.5 24c0-1.4.19-2.76.55-4.02l-6.9-5.36A22.42 22.42 0 0 0 2 24c0 3.6.86 7 2.4 10l6.65-5.98z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M24 46c5.3 0 9.74-1.74 12.99-4.76l-7.37-5.72C28.14 36.51 26.2 37 24 37c-6.26 0-11.43-4.64-12.8-10.88l-6.9 5.36C7.16 40.34 14.82 46 24 46z"
                      />
                    </svg>
                  </span>
                  <span>Google ile kaydol</span>
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
