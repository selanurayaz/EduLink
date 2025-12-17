import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

type QuizQuestion = {
    id: number;
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
    difficulty: string;
    category: string;
    q_type: string;
};

const shuffleArray = (array: string[]) =>
    [...array].sort(() => Math.random() - 0.5);

const Quiz = () => {
    const navigate = useNavigate();

    // 🔐 Auth
    const [userId, setUserId] = useState<string | null>(null);

    // 🔧 Setup
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
        null
    );
    const [quizStarted, setQuizStarted] = useState(false);

    // 🎮 Quiz state
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🔐 Kullanıcıyı al
    useEffect(() => {
        const init = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            setUserId(user?.id ?? null);

            const { data } = await supabase
                .from("quiz_questions")
                .select("category");

            if (data) {
                const unique = Array.from(
                    new Set(data.map((i) => i.category))
                );
                setCategories(unique);
            }
        };

        void init();
    }, []);

    // 💾 Quiz sonucu kaydet (AUTH BAĞLI)
    const saveQuizResult = async (
        score: number,
        totalQuestions: number,
        quizType: "normal" | "mini",
        category: string | null,
        difficulty: string | null
    ) => {
        if (!userId) return;

        const { error } = await supabase.from("quiz_results").insert({
            user_id: userId,
            score,
            total_questions: totalQuestions,
            quiz_type: quizType,
            category,
            difficulty,
        });

        if (error) {
            console.error("Quiz sonucu kaydedilemedi:", error);
        }
    };

    // 📥 Quiz fetch
    const fetchQuiz = async (limit: number) => {
        setLoading(true);

        let query = supabase
            .from("quiz_questions")
            .select(
                "id, question, correct_answer, incorrect_answers, difficulty, category, q_type"
            );

        if (selectedCategory) query = query.eq("category", selectedCategory);
        if (selectedDifficulty) query = query.eq("difficulty", selectedDifficulty);

        const { data } = await query.limit(limit);

        if (data) {
            setQuestions(data);
            setQuizStarted(true);
        }

        setLoading(false);
    };

    // ⚡ Mini quiz
    const startMiniQuiz = async () => {
        setLoading(true);

        const { data } = await supabase
            .from("quiz_questions")
            .select(
                "id, question, correct_answer, incorrect_answers, difficulty, category, q_type"
            )
            .order("id", { ascending: false })
            .limit(3);

        if (data) {
            setQuestions(data);
            setQuizStarted(true);
        }

        setLoading(false);
    };

    const currentQuestion = questions[currentIndex];
    const options = currentQuestion
        ? shuffleArray([
            currentQuestion.correct_answer,
            ...currentQuestion.incorrect_answers,
        ])
        : [];

    const handleConfirm = () => {
        if (!selectedOption) return;
        if (selectedOption === currentQuestion.correct_answer) {
            setScore((s) => s + 1);
        }
        setShowAnswer(true);
    };

    const handleNext = () => {
        setSelectedOption(null);
        setShowAnswer(false);

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex((i) => i + 1);
        } else {
            void saveQuizResult(
                score,
                questions.length,
                questions.length === 3 ? "mini" : "normal",
                selectedCategory,
                selectedDifficulty
            );
            setIsFinished(true);
        }
    };

    const resetQuiz = () => {
        setQuizStarted(false);
        setQuestions([]);
        setCurrentIndex(0);
        setScore(0);
        setIsFinished(false);
        setSelectedCategory(null);
        setSelectedDifficulty(null);
    };


    // 🔹 Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Yükleniyor...
            </div>
        );
    }

    // 🔹 Result screen
    if (isFinished) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6">
                <h1 className="text-3xl font-black">Quiz Bitti 🎉</h1>
                <p className="text-xl">
                    Skor: <strong>{score} / {questions.length}</strong>
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={resetQuiz}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
                    >
                        Tekrar Dene
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-6 py-3 bg-slate-200 rounded-xl font-bold"
                    >
                        Dashboard’a Dön
                    </button>
                </div>
            </div>
        );
    }

    // 🔹 Quiz gameplay
    if (quizStarted && currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8">
                    <div className="text-sm text-slate-500 mb-2">
                        Soru {currentIndex + 1} / {questions.length}
                    </div>

                    <h2 className="text-xl font-bold mb-6">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-3">
                        {options.map((option) => {
                            const isCorrect =
                                showAnswer && option === currentQuestion.correct_answer;
                            const isWrong =
                                showAnswer &&
                                option === selectedOption &&
                                option !== currentQuestion.correct_answer;

                            return (
                                <button
                                    key={option}
                                    onClick={() => setSelectedOption(option)}
                                    disabled={showAnswer}
                                    className={`w-full p-3 rounded-xl border text-left
                    ${isCorrect ? "bg-green-100 border-green-500" : ""}
                    ${isWrong ? "bg-red-100 border-red-500" : ""}
                    ${
                                        selectedOption === option && !showAnswer
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-slate-200"
                                    }
                  `}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex justify-end">
                        {!showAnswer ? (
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedOption}
                                className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold disabled:opacity-50"
                            >
                                Cevabı Onayla
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
                            >
                                Sonraki
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 🔹 Quiz setup screen
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-6">
                <h1 className="text-2xl font-black text-center">Quiz’e Başla</h1>

                <select
                    value={selectedCategory ?? ""}
                    onChange={(e) =>
                        setSelectedCategory(e.target.value || null)
                    }
                    className="w-full p-3 border rounded-xl"
                >
                    <option value="">Kategori (Opsiyonel)</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedDifficulty ?? ""}
                    onChange={(e) =>
                        setSelectedDifficulty(e.target.value || null)
                    }
                    className="w-full p-3 border rounded-xl"
                >
                    <option value="">Zorluk (Opsiyonel)</option>
                    <option value="easy">Kolay</option>
                    <option value="medium">Orta</option>
                    <option value="hard">Zor</option>
                </select>

                <button
                    onClick={() => fetchQuiz(10)}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
                >
                    Quiz’e Başla
                </button>

                <button
                    onClick={startMiniQuiz}
                    className="w-full py-3 bg-amber-500 text-white rounded-xl font-bold"
                >
                    Günün Mini Quiz’i
                </button>
            </div>
        </div>
    );
};

export default Quiz;
