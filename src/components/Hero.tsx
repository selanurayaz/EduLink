import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

const phrases = [
  "Hedeflerine odaklan.",
  "Günlük çalışma planını oluştur.",
  "Odak süreni takip et.",
  "Kendini geliştir.",
  "Başarı bir alışkanlıktır.",
]

type Theme = "dark" | "light"
type HeroProps = {
  onStart?: () => void
}

export function Hero({ onStart }: HeroProps) {
  const [index, setIndex] = useState(0)
  const [theme, setTheme] = useState<Theme>("dark")
  


  const isDark = theme === "dark"

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  const mainBg = isDark ? "bg-slate-950" : "bg-slate-50"
  const mainText = isDark ? "text-slate-100" : "text-slate-900"
  const subText = isDark ? "text-slate-300" : "text-slate-600"
  const cardBg = isDark ? "bg-slate-900/50" : "bg-white"
  const cardBorder = isDark ? "border-slate-700" : "border-slate-200"
  const cardText = isDark ? "text-slate-300" : "text-slate-600"

  return (
    <div
      className={`min-h-screen ${mainBg} ${mainText} flex items-center justify-center px-6 relative font-body`}
    >
      {/* Logo sol üst */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
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

      {/* Tema toggle sağ üst */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
          isDark
            ? "border-slate-700 bg-slate-900/70 text-slate-200"
            : "border-slate-300 bg-white/80 text-slate-700"
        }`}
      >
        <span>{isDark ? "🌙 Dark" : "☀️ Light"}</span>
      </button>

      {/* Ana içerik */}
      <div className="w-full max-w-5xl grid gap-12 md:grid-cols-[1.1fr,1fr] items-center">
        {/* SOL TARAF */}
        <div className="space-y-6">
          {/* Büyük dönen yazı */}
          <div className="h-[80px] md:h-[110px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.h1
                key={index}
                initial={{ opacity: 0, rotateX: -90 }}
                animate={{ opacity: 1, rotateX: 0 }}
                exit={{ opacity: 0, rotateX: 90 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl font-extrabold tracking-tight font-display text-emerald-400"
              >
                {phrases[index]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <p className={`max-w-xl text-lg ${subText}`}>
            EduLink, ders çalışma sürecini koçluk deneyimine dönüştüren akıllı
            bir yardımcıdır. Programını planla, odak süreni ölç, gelişimini
            takip et.
          </p>

          <p className="text-sm text-slate-500/70 mt-6">
            Veriminizi artırın, zamanınızı geri kazanın.
          </p>
        </div>

        {/* SAĞ TARAF: Sadece CTA kartı */}
        <div className="hidden md:flex justify-center">
          <div
            className={`w-full max-w-sm aspect-[4/5] rounded-3xl border ${cardBorder} ${cardBg} backdrop-blur-sm shadow-2xl shadow-emerald-500/10 flex flex-col items-center justify-center text-center px-6 ${cardText}`}
          >
            <h2 className="text-lg font-semibold mb-3">
              EduLink ile çalışmaya hazır mısın?
            </h2>
            <p className="text-sm mb-6">
              Hedeflerini, ders programını ve odak süreni takip etmek için
              hesabınla giriş yap ya da yeni bir hesap oluştur.
            </p>
            <button
  type="button"
  onClick={onStart}
  className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold px-6 py-2.5 transition shadow-md shadow-emerald-500/30"
>
  Öğrenmeye başla
</button>

           
          </div>
        </div>
      </div>
    </div>
  )
}
