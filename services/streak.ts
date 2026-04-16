import AsyncStorage from "@react-native-async-storage/async-storage";

const STREAK_KEY = "nabra_streak";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalDays: number;
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

async function getStreakData(): Promise<StreakData> {
  const raw = await AsyncStorage.getItem(STREAK_KEY);
  if (!raw) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: "", totalDays: 0 };
  }
  try {
    return JSON.parse(raw) as StreakData;
  } catch {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: "", totalDays: 0 };
  }
}

async function saveStreakData(data: StreakData): Promise<void> {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export async function recordActivity(): Promise<StreakData> {
  const data = await getStreakData();
  const today = todayStr();

  if (data.lastActiveDate === today) {
    return data;
  }

  const yesterday = yesterdayStr();

  if (data.lastActiveDate === yesterday) {
    data.currentStreak += 1;
  } else if (data.lastActiveDate === "") {
    data.currentStreak = 1;
  } else {
    data.currentStreak = 1;
  }

  data.totalDays += 1;
  data.lastActiveDate = today;
  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }

  await saveStreakData(data);
  return data;
}

export async function getStreak(): Promise<StreakData> {
  const data = await getStreakData();
  const today = todayStr();
  const yesterday = yesterdayStr();

  if (data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
    data.currentStreak = 0;
  }

  return data;
}
