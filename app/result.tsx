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
import WordWithAudio from "../components/WordWithAudio";
import {
  runAssessment,
  type AssessmentResult,
  type SentenceResult,
} from "../services/assessment";
import { ZONE_INFO, type LetterTip } from "../services/arabicGuide";

function getScoreColor(score: number): string {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Great";
  if (score >= 60) return "Good";
  return "Needs Work";
}

function highlightSentence(sentence: string, mistakes: string[]) {
  const words = sentence.split(" ");
  return words.map((word, i) => {
    const isMistake = mistakes.includes(word);
    return (
      <Text
        key={i}
        style={isMistake ? styles.mistakeWord : styles.correctWord}
      >
        {word}{" "}
      </Text>
    );
  });
}

export default function ResultScreen() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAssessment()
      .then(setResult)
      .catch((err) => console.error("Assessment error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E293B" />
          <Text style={styles.loadingText}>Analyzing your pronunciation…</Text>
          <Text style={styles.loadingSub}>This may take a few seconds</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.loadingSub}>
            Could not reach the assessment service
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace("/test")}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const scoreColor = getScoreColor(result.score);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>
              {result.score}
            </Text>
            <Text style={[styles.scoreOutOf, { color: scoreColor }]}>
              / 100
            </Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
            <Text style={styles.scoreBadgeText}>
              {getScoreLabel(result.score)}
            </Text>
          </View>
        </View>

        {/* Sentence Results */}
        <Text style={styles.sectionTitle}>Sentence Breakdown</Text>
        {result.sentenceResults.map((sr: SentenceResult, index: number) => (
          <View key={index} style={styles.sentenceCard}>
            <View style={styles.sentenceHeader}>
              <Text style={styles.sentenceIndex}>#{index + 1}</Text>
              <View style={styles.sentenceScoreRow}>
                {sr.score > 0 && (
                  <Text
                    style={[
                      styles.sentenceScore,
                      { color: getScoreColor(sr.score) },
                    ]}
                  >
                    {sr.score}
                  </Text>
                )}
                {sr.mistakes.length === 0 ? (
                  <View style={styles.perfectBadge}>
                    <Text style={styles.perfectText}>Perfect ✓</Text>
                  </View>
                ) : (
                  <View style={styles.errorBadge}>
                    <Text style={styles.errorText}>
                      {sr.mistakes.length} error
                      {sr.mistakes.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.sentenceText}>
              {highlightSentence(sr.sentence, sr.mistakes)}
            </Text>

            {sr.mistakes.length > 0 && (
              <View style={styles.mistakesSection}>
                <Text style={styles.mistakesTitle}>
                  Tap to hear correct pronunciation:
                </Text>
                <View style={styles.mistakesList}>
                  {sr.mistakes.map((word, i) => (
                    <WordWithAudio key={i} word={word} />
                  ))}
                </View>
              </View>
            )}

            {sr.letterTips.length > 0 && (
              <View style={styles.letterTipsSection}>
                <Text style={styles.letterTipsTitle}>
                  Letters to practice:
                </Text>
                {sr.letterTips.map((tip: LetterTip, i: number) => {
                  const zone = ZONE_INFO[tip.zone];
                  return (
                    <View key={i} style={styles.letterTipCard}>
                      <View style={styles.letterTipTop}>
                        <View style={[styles.letterCircle, { borderColor: zone.color }]}>
                          <Text style={[styles.letterTipLetter, { color: zone.color }]}>
                            {tip.letter}
                          </Text>
                        </View>
                        <View style={styles.letterTipInfo}>
                          <Text style={styles.letterTipName}>{tip.name}</Text>
                          <Text style={styles.letterTipNameAr}>{tip.nameAr}</Text>
                        </View>
                      </View>

                      {/* Articulation zone bar */}
                      <View style={styles.zoneBarContainer}>
                        <Text style={styles.zoneBarLabel}>Lips</Text>
                        <View style={styles.zoneBar}>
                          {[0, 1, 2, 3, 4, 5].map((pos) => (
                            <View
                              key={pos}
                              style={[
                                styles.zoneSegment,
                                pos === zone.position && {
                                  backgroundColor: zone.color,
                                  transform: [{ scaleY: 1.4 }],
                                  borderRadius: 4,
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <Text style={styles.zoneBarLabel}>Throat</Text>
                      </View>
                      <View style={styles.zoneBadgeRow}>
                        <View style={[styles.zoneBadge, { backgroundColor: zone.color + "18" }]}>
                          <Text style={[styles.zoneBadgeText, { color: zone.color }]}>
                            {zone.icon} {zone.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.letterTipText}>{tip.tip}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}

        {/* Feedback */}
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Feedback</Text>
          <Text style={styles.feedbackText}>{result.feedback}</Text>
        </View>

        {/* Retry */}
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/test")}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace("/")}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 24,
  },
  loadingSub: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 8,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  scoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    marginBottom: 32,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "800",
  },
  scoreOutOf: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: -4,
  },
  scoreBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreBadgeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  sentenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sentenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sentenceScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sentenceScore: {
    fontSize: 16,
    fontWeight: "800",
  },
  sentenceIndex: {
    fontSize: 14,
    fontWeight: "700",
    color: "#94A3B8",
  },
  perfectBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  perfectText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#22C55E",
  },
  errorBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#EF4444",
  },
  sentenceText: {
    fontSize: 24,
    lineHeight: 44,
    textAlign: "right",
    writingDirection: "rtl",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  correctWord: {
    color: "#1E293B",
    fontWeight: "500",
  },
  mistakeWord: {
    color: "#EF4444",
    fontWeight: "700",
    textDecorationLine: "underline",
    textDecorationColor: "#EF4444",
  },
  mistakesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  mistakesTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 8,
  },
  mistakesList: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  letterTipsSection: {
    marginTop: 16,
  },
  letterTipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  letterTipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 1,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  letterTipTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  letterCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  letterTipLetter: {
    fontSize: 28,
    fontWeight: "800",
  },
  letterTipInfo: {
    flex: 1,
  },
  letterTipName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  letterTipNameAr: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  zoneBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  zoneBarLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    width: 36,
    textAlign: "center",
  },
  zoneBar: {
    flex: 1,
    flexDirection: "row",
    gap: 3,
    height: 10,
    alignItems: "center",
  },
  zoneSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
  },
  zoneBadgeRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  zoneBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  zoneBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  letterTipText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
  feedbackCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#78350F",
  },
  retryButton: {
    backgroundColor: "#1E293B",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    elevation: 6,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  homeButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  homeButtonText: {
    color: "#64748B",
    fontSize: 17,
    fontWeight: "700",
  },
});
