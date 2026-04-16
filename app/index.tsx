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
import { pushLocalToCloud } from "../services/cloudSync";
import { getStreak } from "../services/streak";

export default function HomeScreen() {
  const router = useRouter();
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Account bar */}
        <View style={styles.accountBar}>
          {user ? (
            <TouchableOpacity onPress={handleSignOut} activeOpacity={0.7}>
              <View style={styles.accountRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accountName} numberOfLines={1}>
                    {user.displayName || "User"}
                  </Text>
                  <Text style={styles.accountEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
                <Text style={styles.signOutText}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
              <View style={styles.accountRow}>
                <View style={[styles.avatar, { backgroundColor: "#1F1F1F" }]}>
                  <Text style={[styles.avatarText, { color: "#6B7280" }]}>G</Text>
                </View>
                <Text style={styles.guestLabel}>Guest Mode</Text>
                <Text style={styles.signInText}>Sign In</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.hero}>
          <Image
            source={require("../assets/logo-white.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>
            Master your Arabic pronunciation
          </Text>
        </View>

        {/* Streak */}
        <View style={styles.streakRow}>
          <View style={styles.streakCard}>
            <Text style={styles.streakFire}>{streak.currentStreak > 0 ? "🔥" : "❄️"}</Text>
            <Text style={styles.streakCount}>{streak.currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakFire}>🏆</Text>
            <Text style={styles.streakCount}>{streak.longestStreak}</Text>
            <Text style={styles.streakLabel}>Best</Text>
          </View>
          <View style={styles.streakCard}>
            <Text style={styles.streakFire}>📅</Text>
            <Text style={styles.streakCount}>{streak.totalDays}</Text>
            <Text style={styles.streakLabel}>Total Days</Text>
          </View>
        </View>

        {/* Play Levels */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => router.push("/levels")}
          activeOpacity={0.8}
        >
          <View style={styles.playButtonInner}>
            <Text style={styles.playIcon}>▶</Text>
            <View>
              <Text style={styles.playButtonTitle}>Play Levels</Text>
              <Text style={styles.playButtonSub}>30 levels · 5 sentences each · Earn stars</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Test */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push("/language")}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Quick Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/history")}
          activeOpacity={0.8}
        >
          <Text style={styles.historyButtonText}>View Progress</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  accountBar: {
    position: "absolute",
    top: 12,
    left: 24,
    right: 24,
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
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#E5E5E5", fontSize: 14, fontWeight: "700" },
  accountName: { color: "#E5E5E5", fontSize: 13, fontWeight: "600" },
  accountEmail: { color: "#4B5563", fontSize: 11 },
  guestLabel: { color: "#6B7280", fontSize: 14, fontWeight: "500", flex: 1 },
  signOutText: { color: "#EF4444", fontSize: 13, fontWeight: "600" },
  signInText: { color: "#60A5FA", fontSize: 13, fontWeight: "600" },
  hero: { alignItems: "center", marginBottom: 24 },
  streakRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  streakCard: {
    flex: 1,
    backgroundColor: "#141414",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  streakFire: { fontSize: 20, marginBottom: 4 },
  streakCount: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  streakLabel: { fontSize: 11, color: "#6B7280", fontWeight: "600", marginTop: 2 },
  logo: { width: 220, height: 160, marginBottom: 12 },
  tagline: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  playButton: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 22,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#22C55E40",
  },
  playButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playIcon: {
    fontSize: 24,
    color: "#22C55E",
    width: 50,
    height: 50,
    lineHeight: 50,
    textAlign: "center",
    backgroundColor: "#0D2818",
    borderRadius: 25,
    overflow: "hidden",
  },
  playButtonTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 3,
  },
  playButtonSub: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  startButtonText: {
    color: "#E5E5E5",
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
    borderColor: "#1F1F1F",
  },
  historyButtonText: { color: "#6B7280", fontSize: 16, fontWeight: "600" },
});
