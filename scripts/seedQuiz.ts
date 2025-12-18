import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);


type OpenTriviaQuestion = {
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
    category: string;
    difficulty: string;
    type: string;
};

const decodeHtml = (text: string): string =>
    text
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

const seedQuiz = async (): Promise<void> => {
    const response = await fetch(
        "https://opentdb.com/api.php?amount=20&type=multiple"
    );

    const json = await response.json();

    const questions = (json.results as OpenTriviaQuestion[]).map((q) => ({
        question: decodeHtml(q.question),
        correct_answer: decodeHtml(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(decodeHtml),
        category: q.category,
        difficulty: q.difficulty,
        q_type: q.type,
    }));

    const { error } = await supabase
        .from("quiz_questions")
        .insert(questions);

    if (error) {
        console.error("❌ Supabase insert error:", error);
    } else {
        console.log("✅ Quiz soruları başarıyla eklendi");
    }
};

// Promise uyarısını kapat
void seedQuiz();
