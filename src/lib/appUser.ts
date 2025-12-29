import { supabase } from "./supabaseClient";

let cachedAppUserId: string | null = null;

// Auth state değişince cache'i temizle (multi-tab / session refresh vs.)
supabase.auth.onAuthStateChange(() => {
    cachedAppUserId = null;
});

export function clearAppUserIdCache() {
    cachedAppUserId = null;
}

export async function getAppUserId(): Promise<string | null> {
    if (cachedAppUserId) return cachedAppUserId;

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user?.id) return null;

    const authUid = authData.user.id;
    const authEmail = authData.user.email ?? null;

    // 1) Önce auth_user_id ile bul
    const r1 = await supabase
        .from("kullanicilar")
        .select("id")
        .eq("auth_user_id", authUid)
        .maybeSingle();

    if (!r1.error && r1.data?.id) {
        cachedAppUserId = r1.data.id;
        return r1.data.id;
    }

    // 2) Fallback: eposta ile bul (senin SQL seed'in zaten eposta üzerinden gidiyor)
    if (authEmail) {
        const r2 = await supabase
            .from("kullanicilar")
            .select("id, auth_user_id")
            .eq("eposta", authEmail)
            .maybeSingle();

        if (!r2.error && r2.data?.id) {
            const appId = r2.data.id;

            // 3) Eğer row bulundu ama auth_user_id boşsa -> otomatik bağla
            // (RLS izin vermezse update hata verir ama yine de appId döndürüyoruz)
            if (!r2.data.auth_user_id) {
                const upd = await supabase
                    .from("kullanicilar")
                    .update({ auth_user_id: authUid })
                    .eq("id", appId);

                if (upd.error) {
                    console.warn("[appUser] auth_user_id bind update failed (RLS olabilir):", upd.error);
                }
            }

            cachedAppUserId = appId;
            return appId;
        }

        if (r2.error) console.error("[appUser] eposta lookup error:", r2.error);
    }

    // debug
    if (r1.error) console.error("[appUser] auth_user_id lookup error:", r1.error);
    console.warn("[appUser] appUserId bulunamadı. authUid:", authUid, "email:", authEmail);

    return null;
}
