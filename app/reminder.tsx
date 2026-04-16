import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../services/theme";
import { markOnboardingComplete } from "../services/onboarding";

const REMINDER_KEY = "nabra_reminder_set";

const TIME_OPTIONS = [
  { label: "8:00 AM", sublabel: "Morning", hour: 8, minute: 0, icon: "🌅" },
  { label: "12:00 PM", sublabel: "Midday", hour: 12, minute: 0, icon: "☀️" },
  { label: "6:00 PM", sublabel: "Evening", hour: 18, minute: 0, icon: "🌆" },
  { label: "9:00 PM", sublabel: "Night", hour: 21, minute: 0, icon: "🌙" },
];

const MESSAGES = [
  "Time to practice your Arabic! Your streak is waiting 🔥",
  "Don't break your streak! Quick practice session?",
  "Your Arabic pronunciation won't improve itself — let's go!",
  "A few minutes of practice keeps the streak alive 🔥",
];

export default function ReminderScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<number | null>(null);
  const [setting, setSetting] = useState(false);

  async function scheduleReminder() {
    if (selected === null) return;
    setSetting(true);

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Notifications Disabled",
          "Enable notifications in your device settings to get daily reminders.",
          [{ text: "OK", onPress: () => skipAndContinue() }]
        );
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      const opt = TIME_OPTIONS[selected];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nabra — Practice Time!",
          body: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: opt.hour,
          minute: opt.minute,
        },
      });

      await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify({
        hour: opt.hour,
        minute: opt.minute,
        label: opt.label,
      }));

      await markOnboardingComplete();
      router.replace("/");
    } catch (e) {
      console.warn("Notification scheduling failed:", e);
      await markOnboardingComplete();
      router.replace("/");
    } finally {
      setSetting(false);
    }
  }

  async function skipAndContinue() {
    await AsyncStorage.setItem(REMINDER_KEY, "skipped");
    await markOnboardingComplete();
    router.replace("/");
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.emoji}>⏰</Text>
          <Text style={[styles.title, { color: colors.text }]}>Set a Daily Reminder</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            Consistent practice builds streaks and improves pronunciation faster
          </Text>
        </View>

        <View style={styles.optionsSection}>
          <Text style={[styles.optionsLabel, { color: colors.textMuted }]}>
            When should we remind you?
          </Text>
          {TIME_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selected === i ? "#F59E0B" : colors.border,
                },
              ]}
              onPress={() => setSelected(i)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{opt.icon}</Text>
              <View style={styles.optionInfo}>
                <Text style={[
                  styles.optionTime,
                  { color: selected === i ? "#F59E0B" : colors.textSecondary },
                ]}>
                  {opt.label}
                </Text>
                <Text style={[styles.optionSub, { color: colors.textDim }]}>{opt.sublabel}</Text>
              </View>
              <View style={[
                styles.radio,
                { borderColor: selected === i ? "#F59E0B" : colors.borderStrong },
              ]}>
                {selected === i && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.setButton,
              { backgroundColor: selected === null ? colors.cardAlt : "#F59E0B" },
            ]}
            onPress={scheduleReminder}
            disabled={selected === null || setting}
            activeOpacity={0.8}
          >
            <Text style={[styles.setButtonText, { color: selected === null ? colors.textDim : "#000" }]}>
              {setting ? "Setting up..." : "Set Reminder"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipAndContinue}
            activeOpacity={0.8}
          >
            <Text style={[styles.skipButtonText, { color: colors.textDim }]}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
  },
  topSection: { alignItems: "center" },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  optionsSection: { gap: 10 },
  optionsLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#1F1F1F",
    gap: 14,
  },
  optionCardSelected: {
    borderColor: "#F59E0B",
    backgroundColor: "#1A1A0A",
  },
  optionIcon: { fontSize: 24 },
  optionInfo: { flex: 1 },
  optionTime: {
    fontSize: 17,
    fontWeight: "700",
    color: "#E5E5E5",
  },
  optionTimeSelected: { color: "#F59E0B" },
  optionSub: { fontSize: 13, color: "#6B7280", marginTop: 1 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: { borderColor: "#F59E0B" },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F59E0B",
  },
  bottomSection: { gap: 12 },
  setButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  setButtonDisabled: {
    backgroundColor: "#1A1A1A",
  },
  setButtonText: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#4B5563",
    fontSize: 15,
    fontWeight: "600",
  },
});
