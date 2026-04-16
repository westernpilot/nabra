import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuthState, signOut, type AuthState } from "../services/auth";
import { getStreak } from "../services/streak";
import { useTheme, getLogo } from "../services/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, mode, toggle } = useTheme();
  const [auth, setAuth] = useState<AuthState>(getAuthState());
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, totalDays: 0 });

  useEffect(() => {
    setAuth(getAuthState());
    getStreak().then(setStreak);
  }, []);

  const user = auth.status === "signed_in" ? auth.user : null;

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

  async function handleSignIn() {
    await signOut();
    router.replace("/auth");
  }

  const greenBorder = mode === "dark" ? "#22C55E40" : "#16A34A60";
  const greenIconBg = mode === "dark" ? "#0D2818" : "#DCFCE7";
  const greenIcon = mode === "dark" ? "#22C55E" : "#16A34A";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        {/* Account bar */}
        <View style={styles.accountBar}>
          {user ? (
            <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7}>
              <View style={styles.accountRow}>
                <View style={[styles.avatar, { backgroundColor: colors.borderStrong }]}>
                  <Text style={[styles.avatarText, { color: colors.textSecondary }]}>
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.accountName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {user.displayName || "User"}
                  </Text>
                  <Text style={[styles.accountEmail, { color: colors.textDim }]} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
                <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
              <View style={styles.accountRow}>
                <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                  <Text style={[styles.avatarText, { color: colors.textDim }]}>G</Text>
                </View>
                <Text style={[styles.guestLabel, { color: colors.textDim }]}>Guest Mode</Text>
                <Text style={styles.signInText}>Sign In</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Theme toggle */}
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={toggle}
          activeOpacity={0.7}
        >
          <Text style={styles.themeToggleIcon}>{mode === "dark" ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Image
            source={getLogo(mode)}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.tagline, { color: colors.textDim }]}>
            Master your Arabic pronunciation
          </Text>
        </View>

        {/* Streak */}
        <View style={styles.streakRow}>
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.streakFire}>{streak.currentStreak > 0 ? "🔥" : "❄️"}</Text>
            <Text style={[styles.streakCount, { color: colors.text }]}>{streak.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: colors.textDim }]}>Day Streak</Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.streakFire}>🏆</Text>
            <Text style={[styles.streakCount, { color: colors.text }]}>{streak.longestStreak}</Text>
            <Text style={[styles.streakLabel, { color: colors.textDim }]}>Best</Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.streakFire}>📅</Text>
            <Text style={[styles.streakCount, { color: colors.text }]}>{streak.totalDays}</Text>
            <Text style={[styles.streakLabel, { color: colors.textDim }]}>Total Days</Text>
          </View>
        </View>

        {/* Play Levels */}
        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: colors.card, borderColor: greenBorder },
          ]}
          onPress={() => router.push("/levels")}
          activeOpacity={0.8}
        >
          <View style={styles.playButtonInner}>
            <Text style={[styles.playIcon, { color: greenIcon, backgroundColor: greenIconBg }]}>▶</Text>
            <View>
              <Text style={[styles.playButtonTitle, { color: colors.text }]}>Play Levels</Text>
              <Text style={[styles.playButtonSub, { color: colors.textDim }]}>
                30 levels · 5 sentences each · Earn stars
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Test */}
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.cardAlt, borderColor: colors.borderStrong }]}
          onPress={() => router.push("/test")}
          activeOpacity={0.8}
        >
          <Text style={[styles.startButtonText, { color: colors.textSecondary }]}>Quick Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.historyButton, { borderColor: colors.border }]}
          onPress={() => router.push("/history")}
          activeOpacity={0.8}
        >
          <Text style={[styles.historyButtonText, { color: colors.textDim }]}>View Progress</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  accountBar: {
    position: "absolute",
    top: 12,
    left: 24,
    right: 72,
    zIndex: 10,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700" },
  accountName: { fontSize: 13, fontWeight: "600" },
  accountEmail: { fontSize: 11 },
  guestLabel: { fontSize: 14, fontWeight: "500", flex: 1 },
  signOutText: { fontSize: 13, fontWeight: "600" },
  signInText: { color: "#60A5FA", fontSize: 13, fontWeight: "600" },
  themeToggle: {
    position: "absolute",
    top: 16,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    zIndex: 10,
  },
  themeToggleIcon: { fontSize: 18 },
  hero: { alignItems: "center", marginBottom: 24 },
  streakRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  streakCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  streakFire: { fontSize: 20, marginBottom: 4 },
  streakCount: { fontSize: 22, fontWeight: "800" },
  streakLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  logo: { width: 220, height: 160, marginBottom: 12 },
  tagline: {
    fontSize: 16,
    marginTop: 4,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  playButton: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  playButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playIcon: {
    fontSize: 24,
    width: 50,
    height: 50,
    lineHeight: 50,
    textAlign: "center",
    borderRadius: 25,
    overflow: "hidden",
  },
  playButtonTitle: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 3,
  },
  playButtonSub: {
    fontSize: 13,
    fontWeight: "500",
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  historyButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
  },
  historyButtonText: { fontSize: 16, fontWeight: "600" },
});
