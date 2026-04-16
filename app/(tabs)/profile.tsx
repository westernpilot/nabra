import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthState, signOut, type AuthState } from "../../services/auth";
import { useTheme } from "../../services/theme";
import { getSelectedLanguage } from "../../services/languages";

const REMINDER_KEY = "nabra_reminder_set";

interface ReminderInfo {
  hour: number;
  minute: number;
  label: string;
}

function formatReminder(raw: string | null): string {
  if (!raw) return "Not set";
  if (raw === "skipped") return "Off";
  try {
    const r = JSON.parse(raw) as ReminderInfo;
    return r.label || `${r.hour}:${String(r.minute).padStart(2, "0")}`;
  } catch {
    return "Not set";
  }
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, mode, toggle } = useTheme();
  const [auth, setAuth] = useState<AuthState>(getAuthState());
  const [reminder, setReminder] = useState<string>("Not set");
  const [language, setLanguage] = useState<string>("Not set");

  const load = useCallback(async () => {
    setAuth(getAuthState());
    const lang = getSelectedLanguage();
    setLanguage(lang ? `${lang.flag} ${lang.name}` : "Not set");
    const raw = await AsyncStorage.getItem(REMINDER_KEY);
    setReminder(formatReminder(raw));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const user = auth.status === "signed_in" ? auth.user : null;
  const isGuest = auth.status === "signed_in" && !user?.email;

  function handleSignIn() {
    Alert.alert(
      "Sign in to save progress",
      "You'll be signed out of guest mode. Your current local progress will be uploaded once you sign in.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            await signOut();
            router.replace("/auth");
          },
        },
      ]
    );
  }

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth");
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>

        {/* Account card */}
        <View
          style={[
            styles.accountCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {user && user.email ? (
            <>
              <View style={[styles.avatar, { backgroundColor: colors.borderStrong }]}>
                <Text style={[styles.avatarText, { color: colors.textSecondary }]}>
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>
                  {user.displayName || "User"}
                </Text>
                <Text style={[styles.accountEmail, { color: colors.textDim }]} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleSignOut}
                style={[styles.signOutPill, { borderColor: colors.danger + "60" }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.signOutPillText, { color: colors.danger }]}>
                  Sign out
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                <Text style={[styles.avatarText, { color: colors.textDim }]}>G</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.accountName, { color: colors.text }]}>Guest</Text>
                <Text style={[styles.accountEmail, { color: colors.textDim }]}>
                  Sign in to sync progress across devices
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleSignIn}
                style={[styles.signInPill, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.signInPillText, { color: colors.primaryText }]}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionHeader, { color: colors.textDim }]}>PREFERENCES</Text>

        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text style={styles.rowIcon}>{mode === "dark" ? "🌙" : "☀️"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {mode === "dark" ? "Dark Mode" : "Light Mode"}
              </Text>
              <Text style={[styles.rowSub, { color: colors.textDim }]}>
                Tap the switch to change
              </Text>
            </View>
            <Switch
              value={mode === "dark"}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.accent + "60" }}
              thumbColor={mode === "dark" ? colors.accent : colors.bgElevated}
            />
          </View>

          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => router.push({ pathname: "/language", params: { edit: "1" } })}
            activeOpacity={0.6}
          >
            <Text style={styles.rowIcon}>🌍</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Native Language</Text>
              <Text style={[styles.rowSub, { color: colors.textDim }]}>{language}</Text>
            </View>
            <Text style={[styles.rowArrow, { color: colors.textDim }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowLast}
            onPress={() => router.push({ pathname: "/reminder", params: { edit: "1" } })}
            activeOpacity={0.6}
          >
            <Text style={styles.rowIcon}>🔔</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Daily Reminder</Text>
              <Text style={[styles.rowSub, { color: colors.textDim }]}>{reminder}</Text>
            </View>
            <Text style={[styles.rowArrow, { color: colors.textDim }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Quick links */}
        <Text style={[styles.sectionHeader, { color: colors.textDim }]}>PRACTICE</Text>

        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/levels")}
            activeOpacity={0.6}
          >
            <Text style={styles.rowIcon}>🎮</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>All Levels</Text>
              <Text style={[styles.rowSub, { color: colors.textDim }]}>
                30 levels across 6 tiers
              </Text>
            </View>
            <Text style={[styles.rowArrow, { color: colors.textDim }]}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowLast}
            onPress={() => router.push("/test")}
            activeOpacity={0.6}
          >
            <Text style={styles.rowIcon}>⚡</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Quick Test</Text>
              <Text style={[styles.rowSub, { color: colors.textDim }]}>
                5 sentences to re-check your level
              </Text>
            </View>
            <Text style={[styles.rowArrow, { color: colors.textDim }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={[styles.sectionHeader, { color: colors.textDim }]}>ABOUT</Text>

        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rowLast}>
            <Text style={styles.rowIcon}>📘</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Nabra</Text>
              <Text style={[styles.rowSub, { color: colors.textDim }]}>
                Arabic pronunciation, powered by AI
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800" },

  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "800" },
  accountName: { fontSize: 16, fontWeight: "700" },
  accountEmail: { fontSize: 12, marginTop: 2 },
  signOutPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  signOutPillText: { fontSize: 13, fontWeight: "700" },
  signInPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  signInPillText: { fontSize: 14, fontWeight: "700" },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginLeft: 4,
    marginBottom: 10,
    marginTop: 4,
  },
  settingsGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  rowIcon: { fontSize: 20, width: 26, textAlign: "center" },
  rowTitle: { fontSize: 15, fontWeight: "600" },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowArrow: { fontSize: 22, fontWeight: "400" },
});
