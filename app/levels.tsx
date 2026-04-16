import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  GAME_LEVELS,
  getUserGameProgress,
  getTierForLevel,
  type GameLevel,
} from "../services/levels";
import { useTheme } from "../services/theme";

const TIERS = [
  { key: "beginner", levels: [1, 2, 3, 4, 5] },
  { key: "elementary", levels: [6, 7, 8, 9, 10] },
  { key: "intermediate", levels: [11, 12, 13, 14, 15] },
  { key: "advanced", levels: [16, 17, 18, 19, 20] },
  { key: "expert", levels: [21, 22, 23, 24, 25] },
  { key: "master", levels: [26, 27, 28, 29, 30] },
];

function StarDisplay({ stars, size = 14 }: { stars: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3].map((i) => (
        <Text key={i} style={{ fontSize: size, opacity: i <= stars ? 1 : 0.2 }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function LevelsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [progress, setProgress] = useState<{
    currentLevel: number;
    levels: { [level: number]: { stars: number; score: number } };
  } | null>(null);

  useEffect(() => {
    getUserGameProgress().then(setProgress);
  }, []);

  if (!progress) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const totalStars = Object.values(progress.levels).reduce(
    (sum, l) => sum + (l.stars || 0),
    0
  );

  function isUnlocked(level: number): boolean {
    if (level === 1) return true;
    return level <= progress!.currentLevel;
  }

  function handleLevelPress(level: number) {
    if (!isUnlocked(level)) return;
    router.push({ pathname: "/play", params: { level: String(level) } });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.backText, { color: colors.textSecondary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Levels</Text>
        <View style={styles.starTotal}>
          <Text style={styles.starTotalIcon}>★</Text>
          <Text style={styles.starTotalText}>{totalStars}/90</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {TIERS.map((tier) => {
          const tierInfo = getTierForLevel(tier.levels[0]);
          return (
            <View key={tier.key} style={styles.tierSection}>
              <View style={styles.tierHeader}>
                <View
                  style={[
                    styles.tierDot,
                    { backgroundColor: tierInfo.tierColor },
                  ]}
                />
                <Text style={[styles.tierLabel, { color: tierInfo.tierColor }]}>
                  {tierInfo.tierLabel}
                </Text>
                <Text style={styles.tierLabelAr}>{tierInfo.tierLabelAr}</Text>
              </View>

              <View style={styles.levelGrid}>
                {tier.levels.map((levelNum) => {
                  const unlocked = isUnlocked(levelNum);
                  const levelProgress = progress.levels[levelNum];
                  const stars = levelProgress?.stars || 0;
                  const score = levelProgress?.score || 0;
                  const isCurrent = levelNum === progress.currentLevel;
                  const tierColor = tierInfo.tierColor;

                  return (
                    <TouchableOpacity
                      key={levelNum}
                      style={[
                        styles.levelCard,
                        {
                          backgroundColor: unlocked
                            ? colors.card
                            : colors.bgElevated,
                          borderColor: unlocked
                            ? colors.borderStrong
                            : colors.border,
                        },
                        isCurrent && { borderColor: tierColor, borderWidth: 2 },
                      ]}
                      onPress={() => handleLevelPress(levelNum)}
                      disabled={!unlocked}
                      activeOpacity={0.7}
                    >
                      {!unlocked && (
                        <Text style={styles.lockIcon}>🔒</Text>
                      )}
                      {unlocked && (
                        <>
                          <Text
                            style={[
                              styles.levelNumber,
                              { color: colors.textSecondary },
                              isCurrent && { color: tierColor },
                            ]}
                          >
                            {levelNum}
                          </Text>
                          {score > 0 && (
                            <StarDisplay stars={stars} />
                          )}
                          {score > 0 && (
                            <Text style={[styles.levelScore, { color: colors.textDim }]}>{score}</Text>
                          )}
                          {score === 0 && isCurrent && (
                            <View style={[styles.playBadge, { backgroundColor: tierColor }]}>
                              <Text style={styles.playBadgeText}>PLAY</Text>
                            </View>
                          )}
                        </>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1F1F1F",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 20, color: "#E5E5E5", fontWeight: "600" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  starTotal: { flexDirection: "row", alignItems: "center", gap: 4 },
  starTotalIcon: { fontSize: 18, color: "#F59E0B" },
  starTotalText: { fontSize: 15, fontWeight: "700", color: "#F59E0B" },
  scroll: { padding: 20, paddingBottom: 40 },
  tierSection: { marginBottom: 28 },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  tierDot: { width: 10, height: 10, borderRadius: 5 },
  tierLabel: { fontSize: 17, fontWeight: "800" },
  tierLabelAr: { fontSize: 15, color: "#6B7280", fontWeight: "600" },
  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  levelCard: {
    width: "17.5%",
    aspectRatio: 1,
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  levelCardUnlocked: {
    backgroundColor: "#141414",
    borderColor: "#2A2A2A",
  },
  lockIcon: { fontSize: 18, opacity: 0.4 },
  levelNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#E5E5E5",
    marginBottom: 2,
  },
  levelScore: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 1,
  },
  playBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  playBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.5,
  },
});
