import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "nabra_onboarding_complete";
const REMINDER_KEY = "nabra_reminder_set";
const LANGUAGE_KEY = "nabra_selected_language";

let _cache: boolean | null = null;

export async function isOnboardingComplete(): Promise<boolean> {
  if (_cache === true) return true;

  const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
  if (raw === "true") {
    _cache = true;
    return true;
  }

  const [reminder, language] = await Promise.all([
    AsyncStorage.getItem(REMINDER_KEY),
    AsyncStorage.getItem(LANGUAGE_KEY),
  ]);
  if (reminder && language) {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    _cache = true;
    return true;
  }
  _cache = false;
  return false;
}

export function isOnboardingCompleteSync(): boolean | null {
  return _cache;
}

export async function markOnboardingComplete(): Promise<void> {
  _cache = true;
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export async function resetOnboarding(): Promise<void> {
  _cache = false;
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}
