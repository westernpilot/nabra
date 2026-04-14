import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AssessmentResult } from "./assessment";
import { getUserLevel } from "./levels";
import { syncProgressToCloud, syncLetterStatsToCloud } from "./cloudSync";

const STORAGE_KEY = "nabra_progress";
const LETTER_STATS_KEY = "nabra_letter_stats";

export interface SessionRecord {
  id: string;
  date: string;
  score: number;
  sentenceScores: number[];
  weakLetters: string[];
  level?: string;
}

export interface LetterStats {
  [letter: string]: {
    totalSeen: number;
    totalWeak: number;
    lastSeen: string;
    streak: number;
  };
}

export async function saveSession(result: AssessmentResult): Promise<void> {
  const currentLevel = await getUserLevel();

  const allWeakLetters: string[] = [];
  const allSeenLetters: string[] = [];

  for (const sr of result.sentenceResults) {
    for (const tip of sr.letterTips) {
      allWeakLetters.push(tip.letter);
    }
    const sentenceChars = sr.sentence.replace(/[\s\u064B-\u065F\u0670\u0640]/g, "");
    allSeenLetters.push(...new Set(sentenceChars));
  }

  const record: SessionRecord = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    score: result.score,
    sentenceScores: result.sentenceResults.map((s) => s.score),
    weakLetters: [...new Set(allWeakLetters)],
    level: currentLevel,
  };

  const history = await getHistory();
  history.push(record);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  syncProgressToCloud(record).catch(() => {});

  await updateLetterStats([...new Set(allSeenLetters)], [...new Set(allWeakLetters)]);
}

async function updateLetterStats(
  seenLetters: string[],
  weakLetters: string[]
): Promise<void> {
  const stats = await getLetterStats();
  const weakSet = new Set(weakLetters);
  const now = new Date().toISOString();

  for (const letter of seenLetters) {
    if (!stats[letter]) {
      stats[letter] = { totalSeen: 0, totalWeak: 0, lastSeen: now, streak: 0 };
    }
    stats[letter].totalSeen++;
    stats[letter].lastSeen = now;

    if (weakSet.has(letter)) {
      stats[letter].totalWeak++;
      stats[letter].streak++;
    } else {
      stats[letter].streak = 0;
    }
  }

  await AsyncStorage.setItem(LETTER_STATS_KEY, JSON.stringify(stats));

  syncLetterStatsToCloud(stats).catch(() => {});
}

export async function getLetterStats(): Promise<LetterStats> {
  const raw = await AsyncStorage.getItem(LETTER_STATS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as LetterStats;
  } catch {
    return {};
  }
}

export interface ProblemLetter {
  letter: string;
  errorRate: number;
  totalSeen: number;
  totalWeak: number;
  streak: number;
}

export async function getProblemLetters(): Promise<ProblemLetter[]> {
  const stats = await getLetterStats();
  const problems: ProblemLetter[] = [];

  for (const [letter, s] of Object.entries(stats)) {
    if (s.totalSeen >= 2 && s.totalWeak >= 2) {
      problems.push({
        letter,
        errorRate: s.totalWeak / s.totalSeen,
        totalSeen: s.totalSeen,
        totalWeak: s.totalWeak,
        streak: s.streak,
      });
    }
  }

  return problems
    .sort((a, b) => b.errorRate - a.errorRate || b.streak - a.streak)
    .slice(0, 10);
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
  await AsyncStorage.removeItem(LETTER_STATS_KEY);
}
