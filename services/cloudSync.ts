import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebase";
import { getCurrentUser, isSignedIn } from "./auth";
import type { SessionRecord, LetterStats } from "./progress";
import type { DifficultyLevel } from "./levels";

function userDocRef() {
  const user = getCurrentUser();
  if (!user) return null;
  return doc(db, "users", user.uid);
}

export async function syncProgressToCloud(
  session: SessionRecord
): Promise<void> {
  if (!isSignedIn()) return;
  const ref = userDocRef();
  if (!ref) return;

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { sessions: arrayUnion(session) });
    } else {
      await setDoc(ref, { sessions: [session], letterStats: {}, level: session.level || "beginner_1" });
    }
  } catch (e) {
    console.warn("Cloud sync failed (session):", e);
  }
}

export async function syncLetterStatsToCloud(
  stats: LetterStats
): Promise<void> {
  if (!isSignedIn()) return;
  const ref = userDocRef();
  if (!ref) return;

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { letterStats: stats });
    } else {
      await setDoc(ref, { sessions: [], letterStats: stats, level: "beginner_1" });
    }
  } catch (e) {
    console.warn("Cloud sync failed (letterStats):", e);
  }
}

export async function syncLevelToCloud(level: DifficultyLevel): Promise<void> {
  if (!isSignedIn()) return;
  const ref = userDocRef();
  if (!ref) return;

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, { level });
    } else {
      await setDoc(ref, { sessions: [], letterStats: {}, level });
    }
  } catch (e) {
    console.warn("Cloud sync failed (level):", e);
  }
}

export async function pullCloudData(): Promise<{
  sessions: SessionRecord[];
  letterStats: LetterStats;
  level: DifficultyLevel;
} | null> {
  if (!isSignedIn()) return null;
  const ref = userDocRef();
  if (!ref) return null;

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      sessions: (data.sessions || []) as SessionRecord[],
      letterStats: (data.letterStats || {}) as LetterStats,
      level: (data.level || "beginner_1") as DifficultyLevel,
    };
  } catch (e) {
    console.warn("Cloud pull failed:", e);
    return null;
  }
}

export async function mergeCloudToLocal(): Promise<void> {
  const cloud = await pullCloudData();
  if (!cloud) return;

  const STORAGE_KEY = "nabra_progress";
  const LETTER_STATS_KEY = "nabra_letter_stats";
  const LEVEL_KEY = "nabra_user_level";

  try {
    const localRaw = await AsyncStorage.getItem(STORAGE_KEY);
    const localSessions: SessionRecord[] = localRaw ? JSON.parse(localRaw) : [];

    const localIds = new Set(localSessions.map((s) => s.id));
    const merged = [...localSessions];
    for (const cs of cloud.sessions) {
      if (!localIds.has(cs.id)) {
        merged.push(cs);
      }
    }
    merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    const localStatsRaw = await AsyncStorage.getItem(LETTER_STATS_KEY);
    const localStats: LetterStats = localStatsRaw ? JSON.parse(localStatsRaw) : {};
    for (const [letter, cs] of Object.entries(cloud.letterStats)) {
      const ls = localStats[letter];
      if (!ls || cs.totalSeen > ls.totalSeen) {
        localStats[letter] = cs;
      }
    }
    await AsyncStorage.setItem(LETTER_STATS_KEY, JSON.stringify(localStats));

    const localLevel = await AsyncStorage.getItem(LEVEL_KEY);
    if (!localLevel && cloud.level) {
      await AsyncStorage.setItem(LEVEL_KEY, cloud.level);
    }
  } catch (e) {
    console.warn("Cloud merge failed:", e);
  }
}

export async function pushLocalToCloud(): Promise<void> {
  if (!isSignedIn()) return;

  const STORAGE_KEY = "nabra_progress";
  const LETTER_STATS_KEY = "nabra_letter_stats";
  const LEVEL_KEY = "nabra_user_level";

  try {
    const sessionsRaw = await AsyncStorage.getItem(STORAGE_KEY);
    const sessions: SessionRecord[] = sessionsRaw ? JSON.parse(sessionsRaw) : [];

    const statsRaw = await AsyncStorage.getItem(LETTER_STATS_KEY);
    const letterStats: LetterStats = statsRaw ? JSON.parse(statsRaw) : {};

    const level = ((await AsyncStorage.getItem(LEVEL_KEY)) || "beginner_1") as DifficultyLevel;

    const ref = userDocRef();
    if (!ref) return;
    await setDoc(ref, { sessions, letterStats, level });
  } catch (e) {
    console.warn("Cloud push failed:", e);
  }
}
