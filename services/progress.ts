import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AssessmentResult } from "./assessment";

const STORAGE_KEY = "nabra_progress";

export interface SessionRecord {
  id: string;
  date: string;
  score: number;
  sentenceScores: number[];
  weakLetters: string[];
}

export async function saveSession(result: AssessmentResult): Promise<void> {
  const record: SessionRecord = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    score: result.score,
    sentenceScores: result.sentenceResults.map((s) => s.score),
    weakLetters: [
      ...new Set(
        result.sentenceResults.flatMap((s) => s.letterTips.map((t) => t.letter))
      ),
    ],
  };

  const history = await getHistory();
  history.push(record);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export async function getHistory(): Promise<SessionRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SessionRecord[];
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
