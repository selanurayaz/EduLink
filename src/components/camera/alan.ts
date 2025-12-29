import { supabase } from "@/lib/supabaseClient";
import { getAppUserId } from "@/lib/appUser";

/**
 * Kullanıcının "Genel" alanını döner.
 * Yoksa oluşturur.
 *
 * Not: alanlar.olusturan_kullanici_id nullable olsa da,
 * biz kullanıcıya göre alan üretmek için kullanıyoruz.
 */
export async function getGenelAlanId(): Promise<string> {
    const kullaniciId = await getAppUserId();
    if (!kullaniciId) throw new Error("Kullanıcı bulunamadı (getAppUserId boş).");

    // 1) varsa al
    const { data: existing, error: selErr } = await supabase
        .from("alanlar")
        .select("id")
        .eq("olusturan_kullanici_id", kullaniciId)
        .eq("baslik", "Genel")
        .maybeSingle();

    if (selErr) throw new Error(`alanlar select hatası: ${selErr.message}`);
    if (existing?.id) return existing.id;

    // 2) yoksa oluştur
    const { data: inserted, error: insErr } = await supabase
        .from("alanlar")
        .insert({
            baslik: "Genel",
            aciklama: "Varsayılan alan",
            olusturan_kullanici_id: kullaniciId,
        })
        .select("id")
        .single();

    if (insErr) throw new Error(`alanlar insert hatası: ${insErr.message}`);
    return inserted.id;
}
