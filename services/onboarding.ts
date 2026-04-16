import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "nabra_onboarding_complete";
const REMINDER_KEY = "nabra_reminder_set";
const LANGUAGE_KEY = "nabra_selected_language";

export async function isOnboardingComplete(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
  if (raw === "true") return true;

  // Backwards compatibility for existing users
  const [reminder, language] = await Promise.all([
    AsyncStorage.getItem(REMINDER_KEY),
    AsyncStorage.getItem(LANGUAGE_KEY),
  ]);
  if (reminder && language) {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    return true;
  }
  return false;
}

export async function markOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}

export async function resetOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}
