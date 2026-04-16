import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "../../services/theme";
import {
  getProblemLetters,
  getHistory,
  getLetterStats,
  type ProblemLetter,
  type SessionRecord,
} from "../../services/progress";
import { getStreak } from "../../services/streak";
import { getSelectedLanguage } from "../../services/languages";
import { ARABIC_PRONUNCIATION_GUIDE, ZONE_INFO } from "../../services/arabicGuide";
import { getProgressAnalysis } from "../../services/ai";

export default function CoachScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const [problems, setProblems] = useState<ProblemLetter[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, totalDays: 0 });
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [improvedLetters, setImprovedLetters] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, h, s, stats] = await Promise.all([
        getProblemLetters(),
        getHistory(),
        getStreak(),
        getLetterStats(),
      ]);
      setProblems(p);
      setSessions(h);
      setStreak(s);

      const improved: string[] = [];
      for (const [letter, st] of Object.entries(stats)) {
        if (st.totalSeen >= 4 && st.streak === 0 && st.totalWeak / st.totalSeen < 0.3) {
          improved.push(letter);
        }
      }
      setImprovedLetters(improved.slice(0, 6));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function runAnalysis() {
    if (sessions.length === 0) {
      Alert.alert(
        "Not enough data yet",
        "Complete at least one practice session before getting a coach analysis."
      );
      return;
    }
    const lang = getSelectedLanguage();
    if (!lang) {
      Alert.alert("Language needed", "Please set your native language first.");
      return;
    }

    setAnalyzing(true);
    setAnalysis(null);
    try {
      const recentScores = sessions.slice(-8).map((s) => s.score);
      const avg = Math.round(
        sessions.reduce((a, b) => a + b.score, 0) / sessions.length
      );
      const best = Math.max(...sessions.map((s) => s.score));

      const text = await getProgressAnalysis({
        nativeLanguage: lang.name,
        problemLetters: problems,
        totalSessions: sessions.length,
        currentStreak: streak.currentStreak,
        averageScore: avg,
        bestScore: best,
        recentScores,
      });
      setAnalysis(text);
    } catch (e) {
      Alert.alert(
        "Coach unavailable",
        "Couldn't get AI analysis right now. Check your connection and try again."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const hasData = sessions.length > 0;
  const topThree = problems.slice(0, 3);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>AI Coach</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            Personalized guidance based on your practice history
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : !hasData ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Practice first, then meet your coach
            </Text>
            <Text style={[styles.emptyText, { color: colors.textDim }]}>
              Finish one level or quick test so the AI has something to analyze.
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
            {/* Get Analysis CTA */}
            <TouchableOpacity
              style={[
                styles.analyzeCard,
                {
                  backgroundColor: colors.card,
                  borderColor: mode === "dark" ? "#8B5CF640" : "#7C3AED50",
                },
              ]}
              onPress={runAnalysis}
              disabled={analyzing}
              activeOpacity={0.85}
            >
              <View style={styles.analyzeInner}>
                <Text style={styles.analyzeIcon}>✨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.analyzeTitle, { color: colors.text }]}>
                    {analysis ? "Refresh Analysis" : "Get AI Analysis"}
                  </Text>
                  <Text style={[styles.analyzeSub, { color: colors.textDim }]}>
                    {analyzing
                      ? "Coach is reviewing your history..."
                      : `Based on ${sessions.length} session${sessions.length === 1 ? "" : "s"} and ${problems.length} weak letter${problems.length === 1 ? "" : "s"}`}
                  </Text>
                </View>
                {analyzing ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <Text style={[styles.analyzeArrow, { color: colors.accent }]}>→</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Analysis output */}
            {analysis && (
              <View
                style={[
                  styles.analysisCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.analysisLabel, { color: colors.accent }]}>
                  COACH SAYS
                </Text>
                <Text style={[styles.analysisText, { color: colors.textSecondary }]}>
                  {analysis}
                </Text>
              </View>
            )}

            {/* Top 3 focus letters — hero treatment */}
            {topThree.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Focus on these {topThree.length === 1 ? "letter" : "letters"}
                </Text>
                <Text style={[styles.sectionSub, { color: colors.textDim }]}>
                  You've missed them consistently across sessions
                </Text>
                {topThree.map((p, idx) => {
                  const guide = ARABIC_PRONUNCIATION_GUIDE[p.letter];
                  const zone = guide ? ZONE_INFO[guide.zone] : null;
                  const pct = Math.round(p.errorRate * 100);
                  return (
                    <View
                      key={p.letter}
                      style={[
                        styles.focusCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.focusHeader}>
                        <View
                          style={[
                            styles.focusCircle,
                            { borderColor: zone?.color || colors.danger },
                          ]}
                        >
                          <Text
                            style={[
                              styles.focusLetter,
                              { color: zone?.color || colors.danger },
                            ]}
                          >
                            {p.letter}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.focusName, { color: colors.text }]}>
                            {guide?.name || p.letter}
                          </Text>
                          <Text style={[styles.focusStat, { color: colors.textDim }]}>
                            Wrong {pct}% of the time · {p.totalWeak}/{p.totalSeen} attempts
                          </Text>
                          {zone && (
                            <View style={styles.zoneBadge}>
                              <Text style={styles.zoneIcon}>{zone.icon}</Text>
                              <Text style={[styles.zoneText, { color: zone.color }]}>
                                {zone.label}
                              </Text>
                            </View>
                          )}
                        </View>
                        {idx === 0 && (
                          <View style={[styles.priorityBadge, { backgroundColor: colors.danger + "20" }]}>
                            <Text style={[styles.priorityText, { color: colors.danger }]}>TOP</Text>
                          </View>
                        )}
                      </View>
                      {guide?.tip && (
                        <View style={[styles.tipBox, { backgroundColor: colors.cardAlt }]}>
                          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                            {guide.tip}
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={[styles.practiceBtn, { backgroundColor: colors.primary }]}
                        onPress={() =>
                          router.push({
                            pathname: "/drill",
                            params: { letter: p.letter },
                          })
                        }
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.practiceBtnText, { color: colors.primaryText }]}>
                          Drill {p.letter} →
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Other problem letters */}
            {problems.length > 3 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Also watch
                </Text>
                <View style={styles.chipWrap}>
                  {problems.slice(3).map((p) => {
                    const guide = ARABIC_PRONUNCIATION_GUIDE[p.letter];
                    const zone = guide ? ZONE_INFO[guide.zone] : null;
                    return (
                      <TouchableOpacity
                        key={p.letter}
                        style={[
                          styles.chip,
                          { backgroundColor: colors.card, borderColor: colors.border },
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: "/drill",
                            params: { letter: p.letter },
                          })
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.chipLetter,
                            { color: zone?.color || colors.danger },
                          ]}
                        >
                          {p.letter}
                        </Text>
                        <Text style={[styles.chipStat, { color: colors.textDim }]}>
                          {Math.round(p.errorRate * 100)}%
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Improved letters */}
            {improvedLetters.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Letters you've improved on 🎉
                </Text>
                <View style={styles.chipWrap}>
                  {improvedLetters.map((letter) => (
                    <View
                      key={letter}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: mode === "dark" ? "#0D2818" : "#DCFCE7",
                          borderColor: mode === "dark" ? "#22C55E40" : "#86EFAC",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipLetter,
                          { color: colors.success },
                        ]}
                      >
                        {letter}
                      </Text>
                      <Text style={[styles.chipStat, { color: colors.success }]}>✓</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Empty problem state (no weak letters yet but has sessions) */}
            {problems.length === 0 && (
              <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={styles.emptyIcon}>👏</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No consistent problem letters yet
                </Text>
                <Text style={[styles.emptyText, { color: colors.textDim }]}>
                  Keep practicing — the coach needs a few sessions to spot patterns in what's tripping you up.
                </Text>
              </View>
            )}
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
  emptyCard: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
  },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  ctaBtn: {
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaBtnText: { fontSize: 15, fontWeight: "700" },

  analyzeCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  analyzeInner: { flexDirection: "row", alignItems: "center", gap: 14 },
  analyzeIcon: { fontSize: 26 },
  analyzeTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  analyzeSub: { fontSize: 12 },
  analyzeArrow: { fontSize: 22, fontWeight: "800" },

  analysisCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  analysisLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  analysisText: { fontSize: 14, lineHeight: 22 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  sectionSub: { fontSize: 13, marginBottom: 14 },

  focusCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  focusHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  focusCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  focusLetter: { fontSize: 28, fontWeight: "800" },
  focusName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  focusStat: { fontSize: 12, marginBottom: 6 },
  zoneBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  zoneIcon: { fontSize: 12 },
  zoneText: { fontSize: 11, fontWeight: "700" },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },

  tipBox: { padding: 12, borderRadius: 12, marginBottom: 12 },
  tipText: { fontSize: 13, lineHeight: 19 },

  practiceBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  practiceBtnText: { fontSize: 15, fontWeight: "700" },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipLetter: { fontSize: 20, fontWeight: "800" },
  chipStat: { fontSize: 12, fontWeight: "600" },
});
