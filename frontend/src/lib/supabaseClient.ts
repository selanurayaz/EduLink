// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Her oturum açıldığında (Google + normal şifre) kullanicilar tablosuna kaydet
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

  // 2) Yoksa ekle
  const { error: insertError } = await supabase.from("kullanicilar").insert({
    auth_user_id: user.id,
    ad_soyad: (user.user_metadata as any)?.full_name ?? "",
    eposta: user.email,
  })

  if (insertError) {
    console.error("[kullanicilar INSERT error]", insertError)
  } else {
    console.log("[kullanicilar] yeni kullanıcı eklendi ✅")
  }
  console.log("SUPABASE_URL:", supabaseUrl)
console.log("SUPABASE_ANON_KEY startsWith:", supabaseAnonKey?.slice(0, 8))

})
