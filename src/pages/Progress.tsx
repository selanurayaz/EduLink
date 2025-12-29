import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    PlayCircle,
    BookOpen,
    Headphones,
    CheckCircle2,
    BarChart,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type ContentItem = {
    id: string;
    type: string | null;
    title: string | null;
    description: string | null;
    url: string | null;
    thumbnail_url: string | null;
    duration_seconds: number | null;
};

type ProgressRow = {
    id: string;
    kullanici_id: string;
    icerik_id: string;
    ilerleme_yuzdesi: number | null;
    tamamlandi_mi: boolean | null;
    son_gorulme_tarihi: string | null;

    // ✅ Supabase join bazen object, bazen array döndürebilir
    content_item?: ContentItem | ContentItem[] | null;
};

const norm = (v: unknown) => String(v ?? "").toLowerCase().trim();

const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return "";
    const m = Math.round(seconds / 60);
    return `${m} dk`;
};

const openUrl = (url?: string | null) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
};

const clampPct = (v: number) => Math.max(0, Math.min(100, v));

// ✅ content_item'i güvenli biçimde tek objeye indirger
const getContent = (r: ProgressRow): ContentItem | null => {
    const ci = r.content_item;
    if (!ci) return null;
    return Array.isArray(ci) ? (ci[0] ?? null) : ci;
};

const Progress = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [appUserId, setAppUserId] = useState<string | null>(null);
    const [rows, setRows] = useState<ProgressRow[]>([]);

    const ongoing = useMemo(() => rows.filter((r) => !r.tamamlandi_mi), [rows]);
    const completed = useMemo(() => rows.filter((r) => !!r.tamamlandi_mi), [rows]);

    const completionPercent = useMemo(() => {
        const total = rows.length;
        if (total === 0) return 0;
        return Math.round((completed.length / total) * 100);
    }, [rows.length, completed.length]);

    const fetchAppUserId = async (): Promise<string | null> => {
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) {
            console.error("auth error:", authErr);
            return null;
        }
        const authUid = authData?.user?.id;
        if (!authUid) return null;

        const userRes = await supabase
            .from("kullanicilar")
            .select("id")
            .eq("auth_user_id", authUid)
            .limit(1);

        if (userRes.error) {
            console.error("kullanicilar select error:", userRes.error);
            return null;
        }

        return userRes.data?.[0]?.id ?? null;
    };

    const fetchProgress = async (uid: string) => {
        setLoading(true);

        const res = await supabase
            .from("icerik_ilerleme")
            .select(
                `
        id,
        kullanici_id,
        icerik_id,
        ilerleme_yuzdesi,
        tamamlandi_mi,
        son_gorulme_tarihi,
        content_item:content_items!icerik_ilerleme_icerik_id_fkey (
          id,
          type,
          title,
          description,
          url,
          thumbnail_url,
          duration_seconds
        )
      `
            )
            .eq("kullanici_id", uid)
            .order("son_gorulme_tarihi", { ascending: false });

        if (res.error) {
            console.error("progress fetch error:", res.error);
            setRows([]);
            setLoading(false);
            return;
        }

        const data = (res.data ?? []) as unknown as ProgressRow[];

        // ✅ JOIN boş geldiyse, içerikleri toplu şekilde content_items'tan tamamla
        const missingIds = data
            .filter((r) => !getContent(r))
            .map((r) => r.icerik_id)
            .filter(Boolean);

        if (missingIds.length > 0) {
            const fillRes = await supabase
                .from("content_items")
                .select("id,type,title,description,url,thumbnail_url,duration_seconds")
                .in("id", missingIds);

            if (fillRes.error) {
                console.error("fill content_items error:", fillRes.error);
            } else {
                const map = new Map<string, ContentItem>();
                (fillRes.data as ContentItem[] | null)?.forEach((c) => map.set(c.id, c));

                const filled = data.map((r) => {
                    if (getContent(r)) return r;
                    const c = map.get(r.icerik_id);
                    // ✅ object olarak dolduruyoruz (array karmaşasını bitirir)
                    return c ? { ...r, content_item: c } : r;
                });

                setRows(filled);
                setLoading(false);
                return;
            }
        }

        setRows(data);
        setLoading(false);
    };

    // ✅ % güncelle (DB + local state)
    const updateProgress = async (progressId: string, newPct: number) => {
        const pct = clampPct(newPct);
        const done = pct >= 100;

        const up = await supabase
            .from("icerik_ilerleme")
            .update({
                ilerleme_yuzdesi: pct,
                tamamlandi_mi: done,
                son_gorulme_tarihi: new Date().toISOString(),
            })
            .eq("id", progressId);

        if (up.error) {
            console.error("updateProgress error:", up.error);
            return;
        }

        setRows((prev) =>
            prev.map((r) =>
                r.id === progressId ? { ...r, ilerleme_yuzdesi: pct, tamamlandi_mi: done } : r
            )
        );
    };

    const markCompleted = async (progressId: string) => {
        await updateProgress(progressId, 100);
    };

    // ✅ Devam Et butonu: % +25 artar, sonra link açar
    const handleContinue = async (r: ProgressRow) => {
        const current = clampPct(Number(r.ilerleme_yuzdesi ?? 0));
        const next = clampPct(current + 25);

        await updateProgress(r.id, next);

        const c = getContent(r);
        openUrl(c?.url);
    };

    const actionLabel = (type?: string | null) => {
        const t = norm(type);
        if (t === "article") return "Okumaya Dön";
        if (t === "podcast") return "Dinlemeye Dön";
        return "Devam Et";
    };

    const iconFor = (type?: string | null) => {
        const t = norm(type);
        if (t === "article") return <BookOpen size={32} />;
        if (t === "podcast") return <Headphones size={32} />;
        return <PlayCircle size={40} />;
    };

    const accentFor = (type?: string | null) => {
        const t = norm(type);
        if (t === "article")
            return {
                borderHover: "hover:border-blue-200",
                bg: "bg-blue-50",
                text: "text-blue-600",
                bar: "bg-blue-500",
                btnBg: "bg-blue-50",
                btnHover: "hover:bg-blue-100",
                btnText: "text-blue-600",
            };
        if (t === "podcast")
            return {
                borderHover: "hover:border-purple-200",
                bg: "bg-purple-50",
                text: "text-purple-600",
                bar: "bg-purple-500",
                btnBg: "bg-purple-50",
                btnHover: "hover:bg-purple-100",
                btnText: "text-purple-600",
            };
        return {
            borderHover: "hover:border-indigo-200",
            bg: "bg-slate-100",
            text: "text-indigo-600",
            bar: "bg-indigo-500",
            btnBg: "bg-indigo-600",
            btnHover: "hover:bg-indigo-700",
            btnText: "text-white",
        };
    };

    useEffect(() => {
        const run = async () => {
            const uid = await fetchAppUserId();
            setAppUserId(uid);

            if (!uid) {
                setRows([]);
                setLoading(false);
                return;
            }
            await fetchProgress(uid);
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-200 p-4 md:p-8">
            <div className="max-w-5xl mx-auto relative z-10">
                {/* ÜST BAR */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-sm border border-slate-200 transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">İlerleme Durumu 📊</h1>
                        <p className="text-slate-500 font-medium">Yarım kalan içeriklerini tamamla.</p>
                    </div>
                </div>

                {/* ÖZET KARTI */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-900/20 mb-10 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
                                <BarChart size={32} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Genel Başarım</h2>
                                <p className="text-indigo-100">
                                    {rows.length === 0 ? "Henüz başlatılmış içerik yok." : "Harika gidiyorsun!"}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-black mb-1">%{completionPercent}</div>
                            <div className="text-sm font-medium text-indigo-200">Tamamlanan İçerik</div>
                        </div>
                    </div>
                </div>

                {/* DEVAM EDEN */}
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                    Devam Et
                </h3>

                {loading ? (
                    <div className="text-slate-500 mb-12">Yükleniyor...</div>
                ) : !appUserId ? (
                    <div className="text-slate-500 mb-12">Kullanıcı bulunamadı. (Giriş yaptığından emin ol.)</div>
                ) : ongoing.length === 0 ? (
                    <div className="text-slate-500 mb-12">Devam eden içerik yok.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 mb-12">
                        {ongoing.map((r) => {
                            const c = getContent(r);
                            const t = c?.type ?? "video";
                            const accent = accentFor(t);
                            const pct = clampPct(Number(r.ilerleme_yuzdesi ?? 0));

                            const remainingText =
                                c?.duration_seconds != null
                                    ? `${Math.max(0, Math.round((c.duration_seconds * (1 - pct / 100)) / 60))} dk kaldı`
                                    : "";

                            return (
                                <div
                                    key={r.id}
                                    className={`bg-white/80 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] shadow-sm hover:shadow-xl ${accent.borderHover} transition-all group`}
                                >
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className={`w-full md:w-24 h-24 ${accent.bg} rounded-2xl flex items-center justify-center`}>
                                            <div className={`${accent.text}`}>{iconFor(t)}</div>
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="flex justify-between items-start mb-2 gap-4">
                                                <div>
                                                    <h4 className="text-xl font-bold text-slate-800">{c?.title ?? "Başlıksız"}</h4>
                                                    <p className="text-sm text-slate-500 font-medium">
                                                        {norm(t) === "video" ? "Video" : norm(t) === "article" ? "Makale" : "Podcast"}
                                                        {formatDuration(c?.duration_seconds) ? ` • ${formatDuration(c?.duration_seconds)}` : ""}
                                                    </p>
                                                </div>

                                                {remainingText ? (
                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100">
                            {remainingText}
                          </span>
                                                ) : null}
                                            </div>

                                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-2 mt-4">
                                                <div className={`h-full ${accent.bar} rounded-full`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <p className={`text-right text-xs font-bold ${accent.text}`}>%{pct}</p>
                                        </div>

                                        <button
                                            onClick={() => handleContinue(r)}
                                            className={`${accent.btnText} font-bold text-sm px-6 py-3 ${accent.btnBg} rounded-xl ${accent.btnHover} transition-colors`}
                                            title="+25% ilerleme"
                                        >
                                            {actionLabel(t)}
                                        </button>

                                        <button
                                            onClick={() => markCompleted(r.id)}
                                            className="ml-0 md:ml-2 text-green-700 font-bold text-sm px-5 py-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                                            title="Tamamla"
                                        >
                                            Tamamla
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* TAMAMLANAN */}
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                    Tamamlananlar
                </h3>

                {loading ? (
                    <div className="text-slate-500">Yükleniyor...</div>
                ) : completed.length === 0 ? (
                    <div className="text-slate-500">Tamamlanan içerik yok.</div>
                ) : (
                    <div className="space-y-4">
                        {completed.map((r) => {
                            const c = getContent(r);
                            return (
                                <div
                                    key={r.id}
                                    className="bg-white/60 p-4 rounded-2xl border border-slate-200 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <span className="font-bold text-slate-700 line-through decoration-slate-400">
                      {c?.title ?? "Başlıksız"}
                    </span>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                    Tamamlandı
                  </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Progress;
