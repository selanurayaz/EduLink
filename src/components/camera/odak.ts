import { supabase } from "@/lib/supabaseClient";
import { getAppUserId } from "@/lib/appUser";

export type InsertOdakKaydiParams = {
    odaklanmis_mi: boolean;
    guven_skoru?: number | null;
    alan_id?: string | null; // 🔑 ŞİMDİ NULL olabilir
};

export async function insertOdakKaydi(params: InsertOdakKaydiParams) {
    const kullanici_id = await getAppUserId();
    if (!kullanici_id) {
        throw new Error("Kullanıcı bulunamadı (getAppUserId boş).");
    }

    const payload = {
        kullanici_id,
        alan_id: params.alan_id ?? null, // ✅ alan hazır değilse null
        odaklanmis_mi: params.odaklanmis_mi,
        guven_skoru: params.guven_skoru ?? null,
        // olusturulma_tarihi -> DB default now()
    };

    const { error } = await supabase
        .from("odak_kayitlari")
        .insert(payload);

    if (error) {
        throw new Error(`odak_kayitlari insert hatası: ${error.message}`);
    }
}
