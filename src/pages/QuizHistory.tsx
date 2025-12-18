import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type QuizResult = {
    id: string;
    score: number;
    total_questions: number;
    quiz_type: string;
    category: string | null;
    difficulty: string | null;
    created_at: string;
};

const QuizHistory = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            const { data, error } = await supabase
                .from("quiz_results")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) {
                setResults(data);
            }

            setLoading(false);
        };

        void fetchResults();
    }, []);

    if (loading) {
        return <div className="p-10">Yükleniyor...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black">Quiz Geçmişi</h1>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 bg-slate-200 rounded-lg font-bold"
                >
                    Dashboard
                </button>
            </div>

            {results.length === 0 ? (
                <p>Henüz quiz çözmedin.</p>
            ) : (
                <div className="space-y-4">
                    {results.map((q) => (
                        <div
                            key={q.id}
                            className="bg-white rounded-xl p-4 shadow flex justify-between items-center"
                        >
                            <div>
                                <div className="font-bold">
                                    {q.quiz_type === "mini" ? "Mini Quiz" : "Quiz"}
                                </div>
                                <div className="text-sm text-slate-500">
                                    {q.category ?? "Tüm Kategoriler"} •{" "}
                                    {q.difficulty ?? "Tüm Zorluklar"}
                                </div>
                                <div className="text-xs text-slate-400">
                                    {new Date(q.created_at).toLocaleString("tr-TR")}
                                </div>
                            </div>

                            <div className="text-xl font-black text-blue-600">
                                {q.score}/{q.total_questions}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizHistory;
