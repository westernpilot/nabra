import { OPENAI_API_KEY } from "./aiConfig";
import type { AssessmentResult, SentenceResult } from "./assessment";
import type { ProblemLetter } from "./progress";
import type { DifficultyLevel } from "./levels";

const API_URL = "https://api.openai.com/v1/chat/completions";

async function chat(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 600,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function getCoachFeedback(params: {
  result: AssessmentResult;
  nativeLanguage: string;
  level: DifficultyLevel;
  problemLetters: ProblemLetter[];
}): Promise<string> {
  const { result, nativeLanguage, level, problemLetters } = params;

  const weakLetters = result.sentenceResults
    .flatMap((sr) => sr.letterTips.map((t) => `${t.letter} (${t.name})`))
    .filter((v, i, a) => a.indexOf(v) === i);

  const sentenceBreakdown = result.sentenceResults
    .map((sr, i) => {
      const mistakes = sr.mistakes.length > 0 ? sr.mistakes.join(", ") : "none";
      return `Sentence ${i + 1}: score ${sr.score}/100, mistakes: ${mistakes}`;
    })
    .join("\n");

  const persistentProblems = problemLetters
    .slice(0, 5)
    .map((p) => `${p.letter} (error rate: ${Math.round(p.errorRate * 100)}%, streak: ${p.streak})`)
    .join(", ");

  const systemPrompt = `You are Nabra Coach, a friendly and encouraging AI Arabic pronunciation coach inside the Nabra app. 

Your style:
- Warm, conversational, and motivating — like a supportive tutor
- Use simple language (the user may not be fluent in English)
- Be specific: reference exact letters, words, and sounds from their results
- Give 1-2 practical mouth-positioning tips they can try RIGHT NOW
- If they did well, celebrate genuinely before suggesting improvements
- Keep it concise: 3-5 short paragraphs max
- Never use generic filler — every sentence should be actionable or encouraging
- Adapt your explanations to their native language (mention sounds that exist in their language as reference points)
- Do NOT use markdown headers or bullet points — write naturally like a coach talking to them
- You may use occasional emoji but keep it minimal (1-2 max)`;

  const userPrompt = `The user just completed a pronunciation test. Here's their data:

Native language: ${nativeLanguage}
Current level: ${level}
Overall score: ${result.score}/100

${sentenceBreakdown}

Letters they struggled with this session: ${weakLetters.join(", ") || "none"}

Letters they consistently struggle with across sessions: ${persistentProblems || "none yet (first session or doing well)"}

Give them personalized coaching feedback. Be specific about how to fix their weak letters, referencing sounds from ${nativeLanguage} where possible.`;

  return chat([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);
}

export async function generateTargetedSentences(params: {
  weakLetters: string[];
  level: DifficultyLevel;
  count?: number;
}): Promise<string[]> {
  const { weakLetters, level, count = 3 } = params;

  const difficultyGuide: Record<string, string> = {
    beginner_1: "Very simple 2-3 word phrases, common everyday words",
    beginner_2: "Short 3-4 word everyday sentences",
    elementary: "Basic conversational sentences, 4-5 words",
    pre_intermediate: "Slightly longer sentences with common vocabulary",
    intermediate: "Natural conversational sentences, 5-7 words",
    upper_intermediate: "Complex sentences with varied vocabulary",
    advanced: "Literary-quality sentences with emphatic letters",
    proficient: "Sophisticated prose with challenging letter combinations",
    expert: "Complex grammatical structures and rare vocabulary",
    master: "Tongue twisters and maximally difficult combinations",
  };

  const systemPrompt = `You are an Arabic sentence generator for a pronunciation learning app. Generate Arabic sentences that:
- Are fully vowelized with tashkeel (fatha, damma, kasra, shadda, sukun, tanween)
- Are strictly NON-RELIGIOUS (no Quran, Hadith, Bible, or religious content)
- Focus on the specified Arabic letters for practice
- Match the specified difficulty level
- Sound natural and are grammatically correct
- Cover everyday topics: food, travel, nature, work, family, sports, weather, city life

Return ONLY the Arabic sentences, one per line, no numbering, no translations.`;

  const userPrompt = `Generate exactly ${count} Arabic sentences at "${level}" level (${difficultyGuide[level] || "intermediate"}).

These sentences MUST heavily feature these letters: ${weakLetters.join("، ")}

Make sure each sentence uses the target letters multiple times. Every sentence must be fully vowelized.`;

  const response = await chat([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  return response
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, count);
}
