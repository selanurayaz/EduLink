import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {supabase} from "../lib/supabaseClient";

//kategoriler için renk paletleri
const CATEGORY_COLOR_PALETTE = [
    {
        bg: "bg-blue-50",
        border: "border-blue-300",
        badge: "bg-blue-100 text-blue-700",
    },
    {
        bg: "bg-emerald-50",
        border: "border-emerald-300",
        badge: "bg-emerald-100 text-emerald-700",
    },
    {
        bg: "bg-amber-50",
        border: "border-amber-300",
        badge: "bg-amber-100 text-amber-700",
    },
    {
        bg: "bg-rose-50",
        border: "border-rose-300",
        badge: "bg-rose-100 text-rose-700",
    },
    {
        bg: "bg-violet-50",
        border: "border-violet-300",
        badge: "bg-violet-100 text-violet-700",
    },
    {
        bg: "bg-cyan-50",
        border: "border-cyan-300",
        badge: "bg-cyan-100 text-cyan-700",
    },
    {
        bg: "bg-orange-50",
        border: "border-orange-300",
        badge: "bg-orange-100 text-orange-700",
    },
];

//hash fonksiyonu
const hashStringToIndex = (value: string, max: number) => {
    let hash = 0;

    for (let i = 0; i < value.length; i++) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    return Math.abs(hash) % max;
};

//kategori-renk fonksiyonu
const getCategoryStyle = (category?: string) => {
    if (!category) return CATEGORY_COLOR_PALETTE[0];

    const index = hashStringToIndex(
        category,
        CATEGORY_COLOR_PALETTE.length
    );

    return CATEGORY_COLOR_PALETTE[index];
};


const getListCategoryStyle = (
    category: string,
    index: number
) => {
    const baseIndex = hashStringToIndex(
        category,
        CATEGORY_COLOR_PALETTE.length
    );

    // Ardışık elemanlar aynı renge düşmesin diye index
    const adjustedIndex =
        (baseIndex + index) % CATEGORY_COLOR_PALETTE.length;

    return CATEGORY_COLOR_PALETTE[adjustedIndex];
};




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
    const [categorySearch, setCategorySearch] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
        null
    );
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizType, setQuizType] = useState<"normal" | "mini" | null>(null);

    // 🎮 Quiz state
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [optionsMap, setOptionsMap] = useState<Record<number, string[]>>({});
    const currentQuestion = questions[currentIndex];
    const categoryStyle = getCategoryStyle(currentQuestion?.category);
    const filteredCategories = categories.filter((cat) =>
        cat.toLowerCase().includes(categorySearch.toLowerCase())
    );
    const [showSuggestions, setShowSuggestions] = useState(false);


    //  Kullanıcıyı al
    useEffect(() => {
        const init = async () => {
            const {
                data: {user},
            } = await supabase.auth.getUser();

            setUserId(user?.id ?? null);

            const {data} = await supabase
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

    // Quiz başladığında (questions set edilince) : Her soru için şıkları 1 kere karıştırıyor,optionsMap içine kaydediyor
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (questions.length === 0) return;

        const map: Record<number, string[]> = {};

        questions.forEach((q) => {
            map[q.id] = shuffleArray([
                q.correct_answer,
                ...q.incorrect_answers,
            ]);
        });

        setOptionsMap(map);
    }, [questions]);


    //  Quiz sonucu kaydet (AUTH BAĞLI)
    const saveQuizResult = async (
        score: number,
        totalQuestions: number,
        quizType: "normal" | "mini",
        category: string | null,
        difficulty: string | null
    ) => {
        if (!userId) return;

        const {error} = await supabase.from("quiz_results").insert({
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

    //  Quiz fetch
    const fetchQuiz = async (limit: number) => {
        setLoading(true);

        let query = supabase
            .from("quiz_questions")
            .select(
                "id, question, correct_answer, incorrect_answers, difficulty, category, q_type"
            );

        if (selectedCategory) query = query.eq("category", selectedCategory);
        if (selectedDifficulty) query = query.eq("difficulty", selectedDifficulty);

        const {data} = await query.limit(limit);

        if (data) {
            setQuestions(data);
            setQuizType("normal");
            setQuizStarted(true);
        }

        setLoading(false);
    };

    //  Mini quiz
    const startMiniQuiz = async () => {
        setLoading(true);

        const {data} = await supabase
            .from("quiz_questions")
            .select(
                "id, question, correct_answer, incorrect_answers, difficulty, category, q_type"
            )
            .order("id", {ascending: false})
            .limit(8);

        if (data) {
            setQuestions(data);
            setQuizType("mini");
            setQuizStarted(true);
        }

        setLoading(false);
    };

    const options = currentQuestion
        ? optionsMap[currentQuestion.id] || []
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
                quizType!,
                //questions.length === 8 ? "mini" : "normal",
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
        setOptionsMap({});
        setQuizType(null);

    };


    //  Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Yükleniyor...
            </div>
        );
    }

    //  Result screen
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

    //  Quiz gameplay
    if (quizStarted && currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div
                    className={`max-w-xl w-full rounded-3xl shadow-xl p-8 border
                    ${categoryStyle.bg}
                    ${categoryStyle.border}`}
                >

                    {/* QUIZ ÜST BAR */}
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-400">
                                {quizType === "mini" ? "Mini Quiz" : "Normal Quiz"}
                            </span>

                            <span className="font-bold text-slate-800">
                                {selectedCategory ?? "Genel"}
                            </span>

                            {currentQuestion?.category && (
                                <span
                                    className={`inline-block w-fit px-3 py-0.5 rounded-full text-xs font-semibold
                                    ${categoryStyle.badge}`}
                                >
                                    {currentQuestion.category}
                                </span>
                            )}
                        </div>

                        <div className="text-sm font-semibold text-slate-500">
                            {currentIndex + 1} / {questions.length}
                        </div>

                        <button
                            onClick={resetQuiz}
                            className="text-xs font-bold text-red-500 hover:text-red-600"
                        >
                            Quizden Çık
                        </button>
                    </div>


                    {/* progress çizgisi (sonraki adımın mini versiyonu) */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-6">
                        <div
                            className="h-full bg-blue-600 transition-all"
                            style={{width: `${((currentIndex + 1) / questions.length) * 100}%`}}
                        />
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

    //  Quiz setup screen
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-14 space-y-16">
                <h1 className="text-2xl font-black text-center">Quiz’e Başla</h1>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700">
                        📚 Kategori Seç
                    </label>

                    <div
                        className="relative"
                        tabIndex={-1}
                        onBlur={() => setShowSuggestions(false)}
                    >
                        {/*  KATEGORİ INPUT */}
                        <input
                            value={categorySearch}
                            onChange={(e) => {
                                setCategorySearch(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Kategori ara…"
                            className="w-full p-4 rounded-xl border-2 border-blue-400 focus:ring-2 focus:ring-blue-200"
                        />

                        {/*  TAHMİN LİSTESİ */}
                        {showSuggestions && filteredCategories.length > 0 && (
                            <div
                                className="absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl border bg-white shadow-lg z-20">
                                {filteredCategories.map((cat, index) => {
                                    const style = getListCategoryStyle(cat, index);
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onMouseDown={() => {
                                                setSelectedCategory(cat);
                                                setCategorySearch(cat);
                                                setShowSuggestions(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition
                                                        ${style.bg} hover:opacity-80`}
                                            >
                                            {cat}
                                        </button>
                                    );
                                })}

                            </div>
                        )}
                    </div>

                    {selectedCategory && (
                        <div className="flex justify-center">
                            <div
                                className="mt-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm shadow-sm">
                                Seçilen kategori: {selectedCategory}
                            </div>
                        </div>
                    )}


                    <select
                        value={selectedCategory ?? ""}
                        onChange={(e) => setSelectedCategory(e.target.value || null)}
                        className="w-full p-4 text-lg border-2 border-blue-200 rounded-2xl focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Kategori (Opsiyonel)</option>

                        {categories
                            .filter((cat) =>
                                cat.toLowerCase().includes(categorySearch.toLowerCase())
                            )
                            .map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                    </select>

                </div>


                <div className="space-y-3 pt-2">
                    <label className="text-sm font-bold text-slate-700">
                        🎯 Zorluk Seviyesi
                    </label>

                    <select
                        value={selectedDifficulty ?? ""}
                        onChange={(e) => setSelectedDifficulty(e.target.value || null)}
                        className="w-full p-3 rounded-xl border border-purple-300 bg-purple-50 font-semibold"
                    >
                        <option value="">Tüm Seviyeler</option>
                        <option value="easy">Kolay</option>
                        <option value="medium">Orta</option>
                        <option value="hard">Zor</option>
                    </select>
                </div>


                <button
                    onClick={() => fetchQuiz(15)}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                    Quiz’e Başla (15 Soru)
                </button>

                <button
                    onClick={startMiniQuiz}
                    className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                >
                    Günün Mini Quiz’i (8 Soru)
                </button>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                    Ana Menüye Dön
                </button>

                <p className="text-sm text-slate-500 text-center">
                    Kategori ve zorluk seç, hemen başla
                </p>

            </div>
        </div>
    );
};

export default Quiz;
