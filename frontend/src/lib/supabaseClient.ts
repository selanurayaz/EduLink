// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Her oturum açıldığında (Google + normal şifre + magic link) kullanicilar tablosuna kaydet
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log("[AuthStateChange] event:", event, "user:", session?.user?.id)

  if (event !== "SIGNED_IN" || !session?.user) return

  const user = session.user

  // 1) Daha önce var mı kontrol et
  const { data: existing, error: selectError } = await supabase
    .from("kullanicilar")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (selectError) {
    console.error("[kullanicilar SELECT error]", selectError)
    return
  }

  if (existing) {
    console.log("[kullanicilar] zaten kayıt var, tekrar eklemiyorum.")
    return
  }

  // 2) Yeni kayıt ekle — SADECE auth_user_id + eposta
  const { error: insertError } = await supabase.from("kullanicilar").insert({
    auth_user_id: user.id,
    eposta: user.email,
    // ad_soyad alanın varsa ve NULL kabul ediyorsa hiç göndermememiz yeterli.
    // NOT NULL ise, buraya ad_soyad: "" koyabilirsin.
  })

  if (insertError) {
    console.error("[kullanicilar INSERT error]", insertError)
  } else {
    console.log("[kullanicilar] yeni kullanıcı eklendi ✅", {
      eposta: user.email,
    })
  }
})
