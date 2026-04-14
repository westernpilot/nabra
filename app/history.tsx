import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getHistory,
  clearHistory,
  getProblemLetters,
  type SessionRecord,
  type ProblemLetter,
} from "../services/progress";
import { LEVEL_INFO, type DifficultyLevel } from "../services/levels";
import { ARABIC_PRONUNCIATION_GUIDE, ZONE_INFO } from "../services/arabicGuide";

function getScoreColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
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

function ScoreBar({ score, maxWidth }: { score: number; maxWidth: number }) {
  return (
    <View style={barStyles.container}>
      <View
        style={[
          barStyles.fill,
          {
            width: `${Math.min(100, score)}%`,
            backgroundColor: getScoreColor(score),
          },
        ]}
      />
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: "#1F1F1F",
    borderRadius: 4,
    overflow: "hidden",
    flex: 1,
  },
  fill: { height: "100%", borderRadius: 4 },
});

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [problems, setProblems] = useState<ProblemLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHistory(), getProblemLetters()])
      .then(([h, p]) => {
        setSessions(h.reverse());
        setProblems(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const bestScore =
    sessions.length > 0 ? Math.max(...sessions.map((s) => s.score)) : 0;
  const recentScores = sessions.slice(0, 10).reverse();

  const handleClear = async () => {
    await clearHistory();
    setSessions([]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Progress</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptyText}>
              Complete a pronunciation test to start tracking your progress
            </Text>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => router.replace("/test")}
              activeOpacity={0.8}
            >
              <Text style={styles.startBtnText}>Start Test</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{sessions.length}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: getScoreColor(bestScore) }]}>
                  {bestScore}
                </Text>
                <Text style={styles.statLabel}>Best Score</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {Math.round(
                    sessions.reduce((a, b) => a + b.score, 0) / sessions.length
                  )}
                </Text>
                <Text style={styles.statLabel}>Average</Text>
              </View>
            </View>

            {/* Score trend */}
            {recentScores.length > 1 && (
              <View style={styles.trendCard}>
                <Text style={styles.sectionTitle}>Score Trend</Text>
                <View style={styles.chartContainer}>
                  {recentScores.map((s, i) => (
                    <View key={s.id} style={styles.chartColumn}>
                      <Text style={[styles.chartLabel, { color: getScoreColor(s.score) }]}>
                        {s.score}
                      </Text>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: Math.max(8, (s.score / 100) * 120),
                            backgroundColor: getScoreColor(s.score),
                          },
                        ]}
                      />
                      <Text style={styles.chartDate}>
                        {new Date(s.date).toLocaleDateString("en", { day: "numeric" })}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Problem letters analysis */}
            {problems.length > 0 && (
              <View style={styles.weakCard}>
                <Text style={styles.sectionTitle}>Letters You Need to Work On</Text>
                <Text style={styles.weakSubtitle}>
                  These letters keep coming up across your sessions
                </Text>
                {problems.map((p) => {
                  const guide = ARABIC_PRONUNCIATION_GUIDE[p.letter];
                  const zone = guide ? ZONE_INFO[guide.zone] : null;
                  const pct = Math.round(p.errorRate * 100);
                  return (
                    <TouchableOpacity
                      key={p.letter}
                      style={styles.problemCard}
                      onPress={() =>
                        router.push({
                          pathname: "/drill",
                          params: { letter: p.letter },
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.problemLeft}>
                        <View
                          style={[
                            styles.problemCircle,
                            { borderColor: zone?.color || "#EF4444" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.problemLetter,
                              { color: zone?.color || "#EF4444" },
                            ]}
                          >
                            {p.letter}
                          </Text>
                        </View>
                        <View style={styles.problemInfo}>
                          <Text style={styles.problemName}>
                            {guide?.name || p.letter}
                          </Text>
                          <View style={styles.problemStatsRow}>
                            <Text style={styles.problemStat}>
                              Wrong {pct}% of the time
                            </Text>
                            {p.streak >= 3 && (
                              <View style={styles.streakBadge}>
                                <Text style={styles.streakText}>
                                  {p.streak} sessions in a row
                                </Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.problemBar}>
                            <View
                              style={[
                                styles.problemBarFill,
                                {
                                  width: `${pct}%`,
                                  backgroundColor:
                                    pct >= 70
                                      ? "#EF4444"
                                      : pct >= 40
                                      ? "#F59E0B"
                                      : "#3B82F6",
                                },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                      <Text style={styles.problemArrow}>→</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Session list */}
            <Text style={styles.sectionTitle}>Session History</Text>
            {sessions.map((s) => {
              const lvl = s.level as DifficultyLevel | undefined;
              const lvlInfo = lvl ? LEVEL_INFO[lvl] : null;
              return (
              <View key={s.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.sessionDate}>{formatDate(s.date)}</Text>
                    {lvlInfo && (
                      <Text style={[styles.sessionLevel, { color: lvlInfo.color }]}>
                        {lvlInfo.label}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.sessionScore,
                      { color: getScoreColor(s.score) },
                    ]}
                  >
                    {s.score}/100
                  </Text>
                </View>
                <ScoreBar score={s.score} maxWidth={100} />
                {s.weakLetters.length > 0 && (
                  <View style={styles.sessionLetters}>
                    {s.weakLetters.slice(0, 5).map((l) => (
                      <Text key={l} style={styles.sessionLetter}>
                        {l}
                      </Text>
                    ))}
                    {s.weakLetters.length > 5 && (
                      <Text style={styles.sessionLetterMore}>
                        +{s.weakLetters.length - 5}
                      </Text>
                    )}
                  </View>
                )}
              </View>
              );
            })}

            {/* Clear */}
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
              activeOpacity={0.8}
            >
              <Text style={styles.clearBtnText}>Clear History</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  scroll: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1F1F1F",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 20, color: "#9CA3AF", fontWeight: "600" },
  title: { fontSize: 22, fontWeight: "800", color: "#E5E5E5" },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E5E5E5",
    marginBottom: 8,
  },
  emptyText: { color: "#6B7280", fontSize: 14, textAlign: "center" },
  startBtn: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3A3A3A",
    marginTop: 20,
  },
  startBtnText: { color: "#E5E5E5", fontSize: 16, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#E5E5E5",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 4,
  },
  trendCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 160,
    marginTop: 12,
  },
  chartColumn: { alignItems: "center", flex: 1 },
  chartBar: {
    width: 20,
    borderRadius: 10,
    minHeight: 8,
  },
  chartLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  chartDate: {
    fontSize: 10,
    color: "#4B5563",
    marginTop: 6,
  },
  weakCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E5E5E5",
    marginBottom: 16,
  },
  letterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  letterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
  },
  letterChipText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#EF4444",
  },
  letterChipCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  sessionCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    gap: 10,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionDate: { color: "#6B7280", fontSize: 13, fontWeight: "500" },
  sessionLevel: { fontSize: 12, fontWeight: "700" },
  sessionScore: { fontSize: 18, fontWeight: "800" },
  sessionLetters: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  sessionLetter: {
    fontSize: 18,
    color: "#F59E0B",
    fontWeight: "600",
  },
  sessionLetterMore: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
    alignSelf: "center",
  },
  clearBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A1215",
    marginTop: 12,
  },
  clearBtnText: { color: "#EF4444", fontSize: 15, fontWeight: "600" },

  weakSubtitle: { color: "#4B5563", fontSize: 13, marginTop: -8, marginBottom: 16 },
  problemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  problemLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  problemCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2A2A",
  },
  problemLetter: { fontSize: 24, fontWeight: "800" },
  problemInfo: { flex: 1 },
  problemName: { fontSize: 15, fontWeight: "700", color: "#E5E5E5", marginBottom: 4 },
  problemStatsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  problemStat: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  streakBadge: {
    backgroundColor: "#2A1215",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakText: { fontSize: 11, color: "#EF4444", fontWeight: "600" },
  problemBar: {
    height: 6,
    backgroundColor: "#1F1F1F",
    borderRadius: 3,
    overflow: "hidden",
  },
  problemBarFill: { height: "100%", borderRadius: 3 },
  problemArrow: { fontSize: 18, color: "#4B5563", fontWeight: "700", marginLeft: 8 },
});
