import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    PlayCircle,
    Headphones,
    Star,
    Clock,
    Heart,
    Compass,
    HelpCircle,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";

type ContentItem = {
    id: string;
    type: "article" | "video" | "podcast" | string;
    source?: string | null; // ✅ eklendi (wiki vs openlibrary ayırmak için)
    title: string | null;
    description: string | null;
    url: string | null;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    level: unknown;
    topic_id: number | null;
    created_at?: string;
};

const Discovery = () => {
    const navigate = useNavigate();

    // ✅ Makaleler iki kaynağa ayrıldı
    const [wikiArticles, setWikiArticles] = useState<ContentItem[]>([]);
    const [openLibArticles, setOpenLibArticles] = useState<ContentItem[]>([]);

    const [videos, setVideos] = useState<ContentItem[]>([]);
    const [podcasts, setPodcasts] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [importingArticle, setImportingArticle] = useState(false); // ✅ tek makale butonu
    const [importingYouTube, setImportingYouTube] = useState(false);
    const [importingPodcast, setImportingPodcast] = useState(false);

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

    const fetchContent = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from("content_items")
            .select(
                "id,type,source,title,description,url,thumbnail_url,duration_seconds,level,topic_id,created_at"
            )
            .order("created_at", { ascending: false });

        if (error) {
            console.error("content_items fetch error:", error);
            setWikiArticles([]);
            setOpenLibArticles([]);
            setVideos([]);
            setPodcasts([]);
            setLoading(false);
            return;
        }

        const items = (data ?? []) as ContentItem[];

        const allArticles = items.filter((i) => norm(i.type) === "article");
        setWikiArticles(allArticles.filter((i) => norm(i.source) === "wikipedia"));
        setOpenLibArticles(allArticles.filter((i) => norm(i.source) === "openlibrary"));

        setVideos(items.filter((i) => norm(i.type) === "video"));
        setPodcasts(items.filter((i) => norm(i.type) === "podcast"));

        setLoading(false);
    };

    useEffect(() => {
        fetchContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startContent = async (contentId: string) => {
        try {
            const { data: authData } = await supabase.auth.getUser();
            const authUid = authData?.user?.id;
            if (!authUid) return;

            const userRes = await supabase
                .from("kullanicilar")
                .select("id")
                .eq("auth_user_id", authUid)
                .limit(1);

            const appUserId = userRes.data?.[0]?.id;
            if (!appUserId) return;

            await supabase.from("icerik_ilerleme").upsert(
                {
                    kullanici_id: appUserId,
                    icerik_id: contentId,
                    ilerleme_yuzdesi: 0,
                    tamamlandi_mi: false,
                    son_gorulme_tarihi: new Date().toISOString(),
                },
                { onConflict: "kullanici_id,icerik_id" }
            );
        } catch (e) {
            console.error("startContent error:", e);
        }
    };

    const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string;

    // ✅ Makale import helper’ları (tek butonda iki kaynak)
    const importWikipediaOnly = async () => {
        const q = searchQuery.trim();
        if (!q) return;

        await fetch(
            `${FUNCTIONS_URL}/import-content?source=wikipedia&lang=tr&query=${encodeURIComponent(q)}`,
            { method: "POST" }
        );
    };

    const importOpenLibraryOnly = async () => {
        const q = searchQuery.trim();
        if (!q) return;

        await fetch(
            `${FUNCTIONS_URL}/import-content?source=openlibrary&lang=tr&query=${encodeURIComponent(q)}&max=10`,
            { method: "POST" }
        );
    };

    // ✅ TEK BUTON: Wikipedia + OpenLibrary
    const importArticle = async () => {
        const q = searchQuery.trim();
        if (!q) return;

        setImportingArticle(true);
        try {
            await Promise.all([importWikipediaOnly(), importOpenLibraryOnly()]);
            await fetchContent();
        } catch (e) {
            console.error("importArticle error:", e);
        } finally {
            setImportingArticle(false);
        }
    };

    const importYouTube = async () => {
        const q = searchQuery.trim();
        if (!q) return;

        setImportingYouTube(true);
        try {
            await fetch(
                `${FUNCTIONS_URL}/import-content?source=youtube&query=${encodeURIComponent(q)}&max=10`,
                { method: "POST" }
            );
            await fetchContent();
        } finally {
            setImportingYouTube(false);
        }
    };

    const importPodcast = async () => {
        const q = searchQuery.trim();
        if (!q) return;

        setImportingPodcast(true);
        try {
            await fetch(
                `${FUNCTIONS_URL}/import-content?source=podcast&query=${encodeURIComponent(q)}&max=10&lang=tr`,
                { method: "POST" }
            );
            await fetchContent();
        } finally {
            setImportingPodcast(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* ÜST BAR */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="p-3 bg-white rounded-xl border"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black">Keşfet & Öğren 🚀</h1>
                        <p className="text-slate-500">En iyi içerikleri keşfet</p>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="mb-8 space-y-3">
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Bir şey ara (Pomodoro, Algoritma, Deep Work...)"
                        className="w-full px-4 py-3 rounded-2xl border"
                    />

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={importYouTube}
                            disabled={importingYouTube || !searchQuery.trim()}
                            className="px-5 py-3 rounded-2xl bg-slate-900 text-white"
                        >
                            {importingYouTube ? "Video getiriliyor..." : "Video Getir"}
                        </button>

                        <button
                            onClick={importArticle}
                            disabled={importingArticle || !searchQuery.trim()}
                            className="px-5 py-3 rounded-2xl bg-slate-900 text-white"
                        >
                            {importingArticle ? "Makaleler getiriliyor..." : "Makale Getir"}
                        </button>

                        <button
                            onClick={importPodcast}
                            disabled={importingPodcast || !searchQuery.trim()}
                            className="px-5 py-3 rounded-2xl bg-slate-900 text-white"
                        >
                            {importingPodcast ? "Podcast getiriliyor..." : "Podcast Getir"}
                        </button>

                        <button
                            onClick={fetchContent}
                            className="px-5 py-3 rounded-2xl bg-white border"
                        >
                            Yenile
                        </button>
                    </div>
                </div>

                {/* HERO */}
                <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-colors"></div>

                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full mb-4 border border-white/20">
                            HAFTANIN EDİTÖR SEÇİMİ
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                            "Deep Work": Odaklanma Sanatı
                        </h2>
                        <p className="text-white/90 text-lg mb-6">
                            Dikkatini dağıtan her şeyden uzaklaşıp üretkenliğini zirveye çıkar.
                        </p>
                        <button
                            onClick={() => navigate("/articles")}
                            className="bg-white text-blue-700 font-black px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                        >
                            Hemen Oku
                        </button>
                    </div>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* MAKALELER */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Popüler Makaleler</h3>
                            </div>

                            <button
                                onClick={() => navigate("/articles")}
                                className="text-sm font-semibold text-blue-600 hover:underline"
                            >
                                Tümünü Gör
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-sm text-slate-500">Yükleniyor...</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Wikipedia sütunu */}
                                <div className="space-y-4">
                                    <div className="text-xs font-black text-slate-500 tracking-wide px-1">
                                        WIKIPEDIA
                                    </div>

                                    {wikiArticles.slice(0, 5).map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => openUrl(item.url)}
                                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                                    {item.topic_id ? `Topic #${item.topic_id}` : "Makale"}
                                                </span>

                                                {!!formatDuration(item.duration_seconds) && (
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock size={12} /> {formatDuration(item.duration_seconds)}
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                                {item.title ?? "Başlıksız"}
                                            </h4>

                                            {item.description && (
                                                <p className="text-sm text-slate-500 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}

                                            {typeof item.level !== "undefined" && item.level !== null && (
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Seviye: {String(item.level)}
                                                </p>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startContent(item.id);
                                                }}
                                                className="mt-3 w-full bg-blue-50 text-blue-700 font-bold py-2 rounded-xl hover:bg-blue-100 transition-colors"
                                            >
                                                İçeriği Başlat
                                            </button>
                                        </div>
                                    ))}

                                    {wikiArticles.length === 0 && (
                                        <div className="text-sm text-slate-500">Wikipedia makalesi yok.</div>
                                    )}
                                </div>

                                {/* OpenLibrary sütunu */}
                                <div className="space-y-4">
                                    <div className="text-xs font-black text-slate-500 tracking-wide px-1">
                                        OPEN LIBRARY
                                    </div>

                                    {openLibArticles.slice(0, 5).map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => openUrl(item.url)}
                                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                                    {item.topic_id ? `Topic #${item.topic_id}` : "Makale"}
                                                </span>

                                                {!!formatDuration(item.duration_seconds) && (
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Clock size={12} /> {formatDuration(item.duration_seconds)}
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                                {item.title ?? "Başlıksız"}
                                            </h4>

                                            {item.description && (
                                                <p className="text-sm text-slate-500 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            )}

                                            {typeof item.level !== "undefined" && item.level !== null && (
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Seviye: {String(item.level)}
                                                </p>
                                            )}

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startContent(item.id);
                                                }}
                                                className="mt-3 w-full bg-blue-50 text-blue-700 font-bold py-2 rounded-xl hover:bg-blue-100 transition-colors"
                                            >
                                                İçeriği Başlat
                                            </button>
                                        </div>
                                    ))}

                                    {openLibArticles.length === 0 && (
                                        <div className="text-sm text-slate-500">OpenLibrary makalesi yok.</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* VİDEOLAR */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-teal-100 text-teal-600 rounded-lg">
                                <PlayCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Video Serileri</h3>
                        </div>

                        {loading ? (
                            <div className="text-sm text-slate-500">Yükleniyor...</div>
                        ) : (
                            <>
                                {videos.slice(0, 5).map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => openUrl(item.url)}
                                        className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-teal-900/5 transition-all cursor-pointer group"
                                    >
                                        <div className="w-full h-32 bg-slate-200 rounded-2xl mb-4 relative overflow-hidden">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={item.thumbnail_url}
                                                    alt={item.title ?? "video"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                                                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-teal-600 shadow-lg scale-90 group-hover:scale-110 transition-transform">
                                                        <PlayCircle size={20} fill="currentColor" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-teal-600 transition-colors">
                                            {item.title ?? "Başlıksız"}
                                        </h4>

                                        {item.description && (
                                            <p className="text-sm text-slate-500 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startContent(item.id);
                                            }}
                                            className="mt-3 w-full bg-teal-50 text-teal-700 font-bold py-2 rounded-xl hover:bg-teal-100 transition-colors"
                                        >
                                            İçeriği Başlat
                                        </button>
                                    </div>
                                ))}

                                {videos.length === 0 && (
                                    <div className="text-sm text-slate-500">Henüz video yok.</div>
                                )}
                            </>
                        )}
                    </div>

                    {/* PODCASTLER */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Headphones size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Podcastler</h3>
                        </div>

                        {loading ? (
                            <div className="text-sm text-slate-500">Yükleniyor...</div>
                        ) : (
                            <>
                                {podcasts.slice(0, 5).map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => openUrl(item.url)}
                                        className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-indigo-900/5 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden">
                                                {item.thumbnail_url ? (
                                                    <img
                                                        src={item.thumbnail_url}
                                                        alt={item.title ?? "podcast"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Compass size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                    {item.title ?? "Başlıksız"}
                                                </h4>
                                                {!!formatDuration(item.duration_seconds) && (
                                                    <p className="text-xs text-slate-500">
                                                        {formatDuration(item.duration_seconds)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {item.description && (
                                            <p className="text-sm text-slate-500 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-4">
                                            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
                                                <PlayCircle size={20} fill="currentColor" />
                                            </button>
                                            <button className="text-slate-400 hover:text-red-500 transition-colors">
                                                <Heart size={20} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startContent(item.id);
                                            }}
                                            className="mt-3 w-full bg-indigo-50 text-indigo-700 font-bold py-2 rounded-xl hover:bg-indigo-100 transition-colors"
                                        >
                                            İçeriği Başlat
                                        </button>
                                    </div>
                                ))}

                                {podcasts.length === 0 && (
                                    <div className="text-sm text-slate-500">Henüz podcast yok.</div>
                                )}
                            </>
                        )}
                    </div>

                    {/* QUIZLER (statik) */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                <HelpCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Quizler</h3>
                        </div>

                        <div
                            onClick={() => navigate("/quiz")}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-amber-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                                        Hızlı Quiz
                                    </h4>
                                    <p className="text-xs text-slate-500">5 soru • 2-3 dk</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                Kısa testlerle öğrendiklerini pekiştir.
                            </p>
                            <button className="w-full bg-amber-50 text-amber-700 font-bold py-2.5 rounded-xl hover:bg-amber-100 transition-colors">
                                Quize Başla
                            </button>
                        </div>

                        <div
                            onClick={() => navigate("/quiz")}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-amber-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-yellow-700 transition-colors">
                                        Günün Mini Testi
                                    </h4>
                                    <p className="text-xs text-slate-500">3 soru • 1 dk</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">
                                Bugün öğrendiklerini hızla kontrol et.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Discovery;
