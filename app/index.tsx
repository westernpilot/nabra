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
import { getUserLevel, LEVEL_INFO, type DifficultyLevel } from "../services/levels";
import { getAuthState, signOut, type AuthState } from "../services/auth";
import { pushLocalToCloud } from "../services/cloudSync";

export default function HomeScreen() {
  const router = useRouter();
  const [level, setLevel] = useState<DifficultyLevel>("beginner_1");
  const [auth, setAuth] = useState<AuthState>(getAuthState());

  useEffect(() => {
    getUserLevel().then(setLevel);
    setAuth(getAuthState());
  }, []);

  const info = LEVEL_INFO[level];
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
    await pushLocalToCloud();
    router.push("/auth");
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

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pronunciation Test</Text>
            <View style={[styles.levelBadge, { borderColor: info.color }]}>
              <Text style={[styles.levelText, { color: info.color }]}>
                {info.label}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            {info.description}. Read 3 sentences aloud and we'll score your pronunciation.
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3 sentences</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>~2 min</Text>
            </View>
            <View style={[styles.badge, { borderWidth: 1, borderColor: info.color + "40" }]}>
              <Text style={[styles.badgeText, { color: info.color }]}>
                {info.labelAr}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push("/language")}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Test</Text>
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
  hero: { alignItems: "center", marginBottom: 48 },
  logo: { width: 220, height: 160, marginBottom: 12 },
  tagline: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#1A1A1A",
  },
  levelText: { fontSize: 13, fontWeight: "700" },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 16,
  },
  cardMeta: { flexDirection: "row", gap: 8 },
  badge: {
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
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
