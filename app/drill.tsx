import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import RecordButton from "../components/RecordButton";
import { assessSingleWord } from "../services/assessment";
import { getWordsForLetter } from "../services/drillWords";
import { ARABIC_PRONUNCIATION_GUIDE, ZONE_INFO } from "../services/arabicGuide";
import { useTheme } from "../services/theme";

export default function DrillScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const { letter } = useLocalSearchParams<{ letter: string }>();

  const words = getWordsForLetter(letter || "");
  const guide = letter ? ARABIC_PRONUNCIATION_GUIDE[letter] : null;
  const zone = guide ? ZONE_INFO[guide.zone] : null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [results, setResults] = useState<(number | null)[]>(
    new Array(words.length).fill(null)
  );

  const currentWord = words[currentIndex] || "";

  const handleRecordingComplete = useCallback(
    async (uri: string) => {
      setRecordingUri(uri);
      setAssessing(true);
      try {
        const result = await assessSingleWord(uri, currentWord);
        const s = result.score;
        setScore(s);
        setResults((prev) => {
          const next = [...prev];
          next[currentIndex] = s;
          return next;
        });
      } catch {
        setScore(0);
      } finally {
        setAssessing(false);
      }
    },
    [currentWord, currentIndex]
  );

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setRecordingUri(null);
      setScore(null);
    }
  };

  const isComplete = results.every((r) => r !== null);
  const avgScore = isComplete
    ? Math.round(
        results.reduce((a, b) => a! + b!, 0)! / results.length
      )
    : null;

  const getColor = (s: number) => {
    if (s >= 80) return colors.success;
    if (s >= 60) return "#F59E0B";
    return colors.danger;
  };

  if (!letter || words.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No drill words for this letter yet
          </Text>
          <Text style={[styles.emptyText, { color: colors.textDim }]}>
            We haven't added drills for{letter ? ` "${letter}"` : " that letter"} yet. Try another weak letter from the Coach or Progress tab.
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={[styles.backBtnText, { color: colors.primaryText }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.closeText, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text
              style={[
                styles.headerLetter,
                { color: zone?.color || colors.text },
              ]}
            >
              {letter}
            </Text>
            <Text style={[styles.headerName, { color: colors.textDim }]}>
              {guide?.name} Practice
            </Text>
          </View>
          <Text style={[styles.counter, { color: colors.textDim }]}>
            {currentIndex + 1}/{words.length}
          </Text>
        </View>

        {/* Progress dots */}
        <View style={styles.progressRow}>
          {words.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: colors.borderStrong },
                results[i] !== null && {
                  backgroundColor: getColor(results[i]!),
                },
                i === currentIndex && results[i] === null && {
                  backgroundColor: colors.primary,
                  width: 48,
                },
              ]}
            />
          ))}
        </View>

        {/* Word card */}
        <View style={[styles.wordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.wordLabel, { color: colors.textDim }]}>
            Say this word:
          </Text>
          <Text style={[styles.word, { color: colors.text }]}>{currentWord}</Text>
          {guide?.tip && (
            <Text style={[styles.tip, { color: colors.textDim }]}>
              💡 {guide.tip}
            </Text>
          )}
        </View>

        {/* Score feedback */}
        {assessing && (
          <View style={styles.scoreRow}>
            <Text style={[styles.assessingText, { color: colors.textDim }]}>
              Analyzing...
            </Text>
          </View>
        )}
        {score !== null && !assessing && (
          <View style={styles.scoreRow}>
            <View
              style={[styles.scoreBadge, { backgroundColor: getColor(score) }]}
            >
              <Text style={styles.scoreBadgeText}>{score}/100</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: getColor(score) }]}>
              {score >= 80 ? "Great!" : score >= 60 ? "Good, try again" : "Keep practicing"}
            </Text>
          </View>
        )}

        {/* Record button */}
        <RecordButton
          onRecordingComplete={handleRecordingComplete}
          disabled={assessing}
        />

        {/* Next / Done */}
        {score !== null && !assessing && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.cardAlt, borderColor: colors.borderStrong }]}
            onPress={
              currentIndex < words.length - 1
                ? handleNext
                : () => router.back()
            }
            activeOpacity={0.8}
          >
            <Text style={[styles.nextBtnText, { color: colors.text }]}>
              {currentIndex < words.length - 1 ? "Next Word" : "Done"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Summary when complete */}
        {isComplete && avgScore !== null && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Drill Complete!
            </Text>
            <Text style={[styles.summaryScore, { color: getColor(avgScore) }]}>
              Average: {avgScore}/100
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyIcon: { fontSize: 44, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  backBtnText: { fontSize: 16, fontWeight: "700" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 18, fontWeight: "600" },
  headerCenter: { alignItems: "center" },
  headerLetter: { fontSize: 36, fontWeight: "800" },
  headerName: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  counter: { fontSize: 14, fontWeight: "600" },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 32,
    height: 6,
    borderRadius: 3,
  },
  wordCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
  },
  wordLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14,
  },
  word: {
    fontSize: 44,
    fontWeight: "700",
    textAlign: "center",
    writingDirection: "rtl",
  },
  tip: {
    fontSize: 12,
    marginTop: 14,
    textAlign: "center",
    lineHeight: 17,
    paddingHorizontal: 8,
  },
  scoreRow: {
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  assessingText: { fontSize: 14, fontWeight: "500" },
  scoreBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreBadgeText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  scoreLabel: { fontSize: 14, fontWeight: "600" },
  nextBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 12,
  },
  nextBtnText: { fontSize: 16, fontWeight: "700" },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
  },
  summaryTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  summaryScore: { fontSize: 24, fontWeight: "800" },
});
