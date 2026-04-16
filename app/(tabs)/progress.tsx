import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import {
  getHistory,
  clearHistory,
  getProblemLetters,
  type SessionRecord,
  type ProblemLetter,
} from "../../services/progress";
import { LEVEL_INFO, type DifficultyLevel } from "../../services/levels";
import { ARABIC_PRONUNCIATION_GUIDE, ZONE_INFO } from "../../services/arabicGuide";
import { useTheme } from "../../services/theme";

function scoreColor(score: number, colors: { success: string; danger: string }) {
  if (score >= 80) return colors.success;
  if (score >= 60) return "#F59E0B";
  return colors.danger;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProgressScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [problems, setProblems] = useState<ProblemLetter[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getHistory(), getProblemLetters()])
      .then(([h, p]) => {
        setSessions(h.reverse());
        setProblems(p);
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const bestScore = sessions.length > 0 ? Math.max(...sessions.map((s) => s.score)) : 0;
  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((a, b) => a + b.score, 0) / sessions.length)
      : 0;
  const recentScores = sessions.slice(0, 10).reverse();

  function handleClear() {
    Alert.alert(
      "Clear all progress?",
      "This will delete your session history and letter stats. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearHistory();
            setSessions([]);
            setProblems([]);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            Your pronunciation journey over time
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <Text style={[styles.loadingText, { color: colors.textDim }]}>Loading...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No sessions yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.textDim }]}>
              Complete a level or quick test to start tracking your progress.
            </Text>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/levels")}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaBtnText, { color: colors.primaryText }]}>
                Start a level
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{sessions.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textDim }]}>Sessions</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: scoreColor(bestScore, colors) }]}>
                  {bestScore}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textDim }]}>Best</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.text }]}>{avgScore}</Text>
                <Text style={[styles.statLabel, { color: colors.textDim }]}>Average</Text>
              </View>
            </View>

            {recentScores.length > 1 && (
              <View style={[styles.trendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Score Trend</Text>
                <View style={styles.chartContainer}>
                  {recentScores.map((s) => (
                    <View key={s.id} style={styles.chartColumn}>
                      <Text
                        style={[styles.chartLabel, { color: scoreColor(s.score, colors) }]}
                      >
                        {s.score}
                      </Text>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: Math.max(8, (s.score / 100) * 120),
                            backgroundColor: scoreColor(s.score, colors),
                          },
                        ]}
                      />
                      <Text style={[styles.chartDate, { color: colors.textDim }]}>
                        {new Date(s.date).toLocaleDateString("en", { day: "numeric" })}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {problems.length > 0 && (
              <View style={[styles.weakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Letters You Need to Work On
                </Text>
                <Text style={[styles.weakSubtitle, { color: colors.textDim }]}>
                  These letters keep coming up across your sessions
                </Text>
                {problems.map((p) => {
                  const guide = ARABIC_PRONUNCIATION_GUIDE[p.letter];
                  const zone = guide ? ZONE_INFO[guide.zone] : null;
                  const pct = Math.round(p.errorRate * 100);
                  return (
                    <TouchableOpacity
                      key={p.letter}
                      style={[styles.problemCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                      onPress={() =>
                        router.push({ pathname: "/drill", params: { letter: p.letter } })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.problemLeft}>
                        <View
                          style={[
                            styles.problemCircle,
                            {
                              borderColor: zone?.color || colors.danger,
                              backgroundColor: colors.card,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.problemLetter,
                              { color: zone?.color || colors.danger },
                            ]}
                          >
                            {p.letter}
                          </Text>
                        </View>
                        <View style={styles.problemInfo}>
                          <Text style={[styles.problemName, { color: colors.text }]}>
                            {guide?.name || p.letter}
                          </Text>
                          <View style={styles.problemStatsRow}>
                            <Text style={[styles.problemStat, { color: colors.textDim }]}>
                              Wrong {pct}% of the time
                            </Text>
                            {p.streak >= 3 && (
                              <View
                                style={[
                                  styles.streakBadge,
                                  { backgroundColor: colors.danger + "20" },
                                ]}
                              >
                                <Text style={[styles.streakText, { color: colors.danger }]}>
                                  {p.streak} in a row
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={[styles.problemBar, { backgroundColor: colors.border }]}>
                            <View
                              style={[
                                styles.problemBarFill,
                                {
                                  width: `${pct}%`,
                                  backgroundColor:
                                    pct >= 70
                                      ? colors.danger
                                      : pct >= 40
                                      ? "#F59E0B"
                                      : "#3B82F6",
                                },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.problemArrow, { color: colors.textDim }]}>→</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>
              Session History
            </Text>
            {sessions.map((s) => {
              const lvl = s.level as DifficultyLevel | undefined;
              const lvlInfo = lvl ? LEVEL_INFO[lvl] : null;
              return (
                <View
                  key={s.id}
                  style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={styles.sessionHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                      <Text style={[styles.sessionDate, { color: colors.textDim }]}>
                        {formatDate(s.date)}
                      </Text>
                      {lvlInfo && (
                        <Text style={[styles.sessionLevel, { color: lvlInfo.color }]}>
                          {lvlInfo.label}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.sessionScore,
                        { color: scoreColor(s.score, colors) },
                      ]}
                    >
                      {s.score}/100
                    </Text>
                  </View>
                  <View style={[styles.scoreBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        {
                          width: `${Math.min(100, s.score)}%`,
                          backgroundColor: scoreColor(s.score, colors),
                        },
                      ]}
                    />
                  </View>
                  {s.weakLetters.length > 0 && (
                    <View style={styles.sessionLetters}>
                      {s.weakLetters.slice(0, 5).map((l) => (
                        <Text key={l} style={[styles.sessionLetter, { color: "#F59E0B" }]}>
                          {l}
                        </Text>
                      ))}
                      {s.weakLetters.length > 5 && (
                        <Text style={[styles.sessionLetterMore, { color: colors.textDim }]}>
                          +{s.weakLetters.length - 5}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.clearBtn, { borderColor: mode === "dark" ? "#2A1215" : "#FECACA" }]}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <Text style={[styles.clearBtnText, { color: colors.danger }]}>Clear History</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 4 },
  center: { paddingVertical: 60, alignItems: "center" },
  loadingText: { fontSize: 14 },
  emptyCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
  },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  ctaBtn: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaBtnText: { fontSize: 15, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 4 },
  trendCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 160,
    marginTop: 12,
  },
  chartColumn: { alignItems: "center", flex: 1 },
  chartBar: { width: 18, borderRadius: 9, minHeight: 8 },
  chartLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  chartDate: { fontSize: 10, marginTop: 6 },
  weakCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
  },
  weakSubtitle: { fontSize: 12, marginBottom: 14 },
  problemCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  problemLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  problemCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  problemLetter: { fontSize: 22, fontWeight: "800" },
  problemInfo: { flex: 1 },
  problemName: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  problemStatsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  problemStat: { fontSize: 11, fontWeight: "500" },
  streakBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
  },
  streakText: { fontSize: 10, fontWeight: "700" },
  problemBar: { height: 5, borderRadius: 3, overflow: "hidden" },
  problemBarFill: { height: "100%", borderRadius: 3 },
  problemArrow: { fontSize: 18, fontWeight: "700", marginLeft: 8 },
  sessionCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDate: { fontSize: 13, fontWeight: "500" },
  sessionLevel: { fontSize: 11, fontWeight: "700" },
  sessionScore: { fontSize: 17, fontWeight: "800" },
  scoreBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  scoreBarFill: { height: "100%", borderRadius: 3 },
  sessionLetters: { flexDirection: "row", gap: 8 },
  sessionLetter: { fontSize: 17, fontWeight: "600" },
  sessionLetterMore: { fontSize: 12, fontWeight: "600", alignSelf: "center" },
  clearBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 16,
  },
  clearBtnText: { fontSize: 14, fontWeight: "600" },
});
