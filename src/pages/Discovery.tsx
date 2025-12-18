import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import {
    ArrowLeft, BookOpen, PlayCircle, Headphones, Star,
    Clock, Heart, Compass, HelpCircle
} from 'lucide-react';

// ✅ Supabase client import (gerekirse yolu düzelt)
import { supabase } from "../lib/supabaseClient";

type ContentItem = {
    id: string;
    type: "article" | "video" | "podcast" | string;
    title: string | null;
    description: string | null;
    url: string | null;
    thumbnail_url: string | null;
    duration_seconds: number | null;
    level: unknown;
    topic_id: number | null;
};

const Discovery = () => {
    const navigate = useNavigate();

    const [articles, setArticles] = useState<ContentItem[]>([]);
    const [videos, setVideos] = useState<ContentItem[]>([]);
    const [podcasts, setPodcasts] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<string | null>(null);



    const formatDuration = (seconds?: number | null) => {
        if (!seconds || seconds <= 0) return "";
        const m = Math.round(seconds / 60);
        return `${m} dk`;
    };

    const openUrl = (url?: string | null) => {
        if (!url) return;
        window.open(url, "_blank", "noopener,noreferrer");
    };
    const startContent = async (contentId: string) => {
        if (!userId) {
            console.error("User not found (not logged in?)");
            return;
        }

        // varsa tekrar insert atmayalım
        const { data: existing, error: exErr } = await supabase
            .from("icerik_ilerleme")
            .select("id")
            .eq("kullanici_id", userId)
            .eq("icerik_id", contentId)
            .maybeSingle();

        if (exErr) {
            console.error("Check progress error:", exErr);
            return;
        }

        if (existing) return;

        const { error } = await supabase.from("icerik_ilerleme").insert({
            kullanici_id: userId,
            icerik_id: contentId,
            ilerleme_yuzdesi: 0,
            tamamlandi_mi: false,
            son_gorulme_tarihi: new Date().toISOString(),
        });

        if (error) {
            console.error("Start insert error:", error);
        }
    };


    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);

            const { data: authData } = await supabase.auth.getUser();
            setUserId(authData?.user?.id ?? null);


            const { data, error } = await supabase
                .from("content_items")
                .select("id,type,title,description,url,thumbnail_url,duration_seconds,level,topic_id,created_at")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("content_items fetch error:", error);
                setArticles([]);
                setVideos([]);
                setPodcasts([]);
                setLoading(false);
                return;
            }

            const items = (data ?? []) as ContentItem[];
            setArticles(items.filter((i) => i.type === "article"));
            setVideos(items.filter((i) => i.type === "video"));
            setPodcasts(items.filter((i) => i.type === "podcast"));

            setLoading(false);
        };

        fetchContent();
    }, []);

    return (
        // YENİ TASARIM: Light Mode / Mavi Atmosfer
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-200 p-4 md:p-8">

            {/* ARKA PLAN EFEKTLERİ */ }
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-purple-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000 z-0"></div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* ÜST BAR */ }
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-sm border border-slate-200 transition-all group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Keşfet & Öğren 🚀</h1>
                        <p className="text-slate-500 font-medium">Kendini geliştirmek için en iyi kaynaklar.</p>
                    </div>
                </div>

                {/* 1. ÖNE ÇIKAN (FEATURED) - BÜYÜK BANNER */ }
                <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl shadow-blue-900/20 relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform duration-500">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-colors"></div>

                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full mb-4 border border-white/20">
                            HAFTANIN EDİTÖR SEÇİMİ
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                            "Deep Work": Odaklanma Sanatı
                        </h2>
                        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                            Cal Newport'un efsanevi kitabından, dijital çağda dikkatinizi nasıl yöneteceğinize dair 5 altın kuralı derledik.
                        </p>
                        <button
                            onClick={() => navigate('/articles')}
                            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
                        >
                            <BookOpen size={20} /> Hemen Oku
                        </button>
                    </div>
                </div>

                {/* 2. KATEGORİ IZGARASI */ }
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* SOL KOLON: MAKALELER */ }
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Popüler Makaleler</h3>
                        </div>

                        {loading ? (
                            <div className="text-sm text-slate-500">Yükleniyor...</div>
                        ) : (
                            <>
                                {articles.slice(0, 2).map((item) => (
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
                                            <p className="text-xs text-slate-400 mt-2">Seviye: {String(item.level)}</p>
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

                                {articles.length === 0 && (
                                    <div className="text-sm text-slate-500">Henüz makale yok.</div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ORTA SOL: VİDEOLAR */ }
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
                                {videos.slice(0, 2).map((item) => (
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
                                            <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
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

                    {/* ORTA SAĞ: PODCASTLER */ }
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
                                {podcasts.slice(0, 2).map((item) => (
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
                                                    <p className="text-xs text-slate-500">{formatDuration(item.duration_seconds)}</p>
                                                )}
                                            </div>
                                        </div>

                                        {item.description && (
                                            <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                                        )}

                                        <div className="flex items-center justify-between mt-4">
                                            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors">
                                                <PlayCircle size={20} fill="currentColor" />
                                            </button>
                                            <button className="text-slate-400 hover:text-red-500 transition-colors">
                                                <Heart size={20} />
                                            </button>
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
                                    </div>
                                ))}

                                {podcasts.length === 0 && (
                                    <div className="text-sm text-slate-500">Henüz podcast yok.</div>
                                )}
                            </>
                        )}
                    </div>

                    {/* SAĞ KOLON: QUIZLER (statik bıraktım) */ }
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                                <HelpCircle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Quizler</h3>
                        </div>

                        <div
                            onClick={() => navigate('/quiz')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-amber-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">Hızlı Quiz</h4>
                                    <p className="text-xs text-slate-500">5 soru • 2-3 dk</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">Kısa testlerle öğrendiklerini pekiştir.</p>
                            <button className="w-full bg-amber-50 text-amber-700 font-bold py-2.5 rounded-xl hover:bg-amber-100 transition-colors">
                                Quize Başla
                            </button>
                        </div>

                        <div
                            onClick={() => navigate('/quiz')}
                            className="bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl hover:shadow-xl hover:shadow-amber-900/5 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-yellow-700 transition-colors">Günün Mini Testi</h4>
                                    <p className="text-xs text-slate-500">3 soru • 1 dk</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500">Bugün öğrendiklerini hızla kontrol et.</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Discovery;
