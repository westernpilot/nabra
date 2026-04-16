import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { getAuthState, type AuthState } from "../../services/auth";
import { getStreak } from "../../services/streak";
import { getUserGameProgress, type GameProgress } from "../../services/levels";
import { useTheme, getLogo } from "../../services/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const [auth, setAuth] = useState<AuthState>(getAuthState());
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, totalDays: 0 });
  const [game, setGame] = useState<GameProgress | null>(null);

  const load = useCallback(() => {
    setAuth(getAuthState());
    getStreak().then(setStreak);
    getUserGameProgress().then(setGame);
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
  const greenBorder = mode === "dark" ? "#22C55E40" : "#16A34A60";
  const greenIconBg = mode === "dark" ? "#0D2818" : "#DCFCE7";
  const greenIcon = mode === "dark" ? "#22C55E" : "#16A34A";

  const totalStars = game
    ? Object.values(game.levels).reduce((sum, lv) => sum + (lv.stars || 0), 0)
    : 0;
  const currentLevelNum = game?.currentLevel ?? 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={getLogo(mode)} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.tagline, { color: colors.textDim }]}>
            {user ? `Welcome back${user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}` : "Master your Arabic pronunciation"}
          </Text>
        </View>

        <View style={styles.streakRow}>
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.streakFire}>{streak.currentStreak > 0 ? "🔥" : "❄️"}</Text>
            <Text style={[styles.streakCount, { color: colors.text }]}>{streak.currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: colors.textDim }]}>Day Streak</Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.streakFire}>⭐</Text>
            <Text style={[styles.streakCount, { color: colors.text }]}>{totalStars}</Text>
            <Text style={[styles.streakLabel, { color: colors.textDim }]}>Stars</Text>
          </View>
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.streakFire}>🎯</Text>
            <Text style={[styles.streakCount, { color: colors.text }]}>{currentLevelNum}</Text>
            <Text style={[styles.streakLabel, { color: colors.textDim }]}>Level</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: colors.card, borderColor: greenBorder }]}
          onPress={() => router.push("/levels")}
          activeOpacity={0.8}
        >
          <View style={styles.playButtonInner}>
            <Text style={[styles.playIcon, { color: greenIcon, backgroundColor: greenIconBg }]}>▶</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.playButtonTitle, { color: colors.text }]}>Continue Playing</Text>
              <Text style={[styles.playButtonSub, { color: colors.textDim }]}>
                Level {currentLevelNum} · Keep your streak alive
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: colors.cardAlt, borderColor: colors.borderStrong }]}
          onPress={() => router.push("/test")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryIcon}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.secondaryTitle, { color: colors.textSecondary }]}>
              Quick Test
            </Text>
            <Text style={[styles.secondarySub, { color: colors.textDim }]}>
              5 sentences to check your current level
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: colors.cardAlt, borderColor: colors.borderStrong }]}
          onPress={() => router.push("/coach")}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryIcon}>🧠</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.secondaryTitle, { color: colors.textSecondary }]}>
              Talk to Coach
            </Text>
            <Text style={[styles.secondarySub, { color: colors.textDim }]}>
              Get AI analysis on your weak letters
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, flexGrow: 1, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: 24 },
  logo: { width: 200, height: 140, marginBottom: 4 },
  tagline: {
    fontSize: 15,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  streakRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
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
  playButton: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  playButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  playIcon: {
    fontSize: 22,
    width: 50,
    height: 50,
    lineHeight: 50,
    textAlign: "center",
    borderRadius: 25,
    overflow: "hidden",
  },
  playButtonTitle: { fontSize: 18, fontWeight: "800", marginBottom: 3 },
  playButtonSub: { fontSize: 13, fontWeight: "500" },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  secondaryIcon: { fontSize: 22 },
  secondaryTitle: { fontSize: 16, fontWeight: "700" },
  secondarySub: { fontSize: 12, marginTop: 2 },
});
