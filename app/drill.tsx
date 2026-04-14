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

export default function DrillScreen() {
  const router = useRouter();
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
    if (s >= 80) return "#22C55E";
    if (s >= 60) return "#F59E0B";
    return "#EF4444";
  };

  if (!letter || words.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>No drill words available</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerLetter, zone && { color: zone.color }]}>
              {letter}
            </Text>
            <Text style={styles.headerName}>
              {guide?.name} Practice
            </Text>
          </View>
          <Text style={styles.counter}>
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
                results[i] !== null && {
                  backgroundColor: getColor(results[i]!),
                },
                i === currentIndex && results[i] === null && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Word card */}
        <View style={styles.wordCard}>
          <Text style={styles.wordLabel}>Say this word:</Text>
          <Text style={styles.word}>{currentWord}</Text>
        </View>

        {/* Score feedback */}
        {assessing && (
          <View style={styles.scoreRow}>
            <Text style={styles.assessingText}>Analyzing...</Text>
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
            style={styles.nextBtn}
            onPress={
              currentIndex < words.length - 1
                ? handleNext
                : () => router.back()
            }
            activeOpacity={0.8}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex < words.length - 1 ? "Next Word" : "Done"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Summary when complete */}
        {isComplete && avgScore !== null && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Drill Complete!</Text>
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
  safe: { flex: 1, backgroundColor: "#000000" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#6B7280", fontSize: 16, marginBottom: 20 },
  backBtn: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  backBtnText: { color: "#E5E5E5", fontSize: 16, fontWeight: "700" },
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
    backgroundColor: "#1F1F1F",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 18, color: "#9CA3AF", fontWeight: "600" },
  headerCenter: { alignItems: "center" },
  headerLetter: { fontSize: 36, fontWeight: "800", color: "#E5E5E5" },
  headerName: { fontSize: 14, color: "#6B7280", fontWeight: "600", marginTop: 2 },
  counter: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
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
    backgroundColor: "#2A2A2A",
  },
  dotActive: { backgroundColor: "#E5E5E5", width: 48 },
  wordCard: {
    backgroundColor: "#141414",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  wordLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  word: {
    fontSize: 44,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    writingDirection: "rtl",
  },
  scoreRow: {
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  assessingText: { color: "#6B7280", fontSize: 14, fontWeight: "500" },
  scoreBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreBadgeText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  scoreLabel: { fontSize: 14, fontWeight: "600" },
  nextBtn: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    marginTop: 12,
  },
  nextBtnText: { color: "#E5E5E5", fontSize: 17, fontWeight: "700" },
  summaryCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  summaryTitle: { color: "#E5E5E5", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  summaryScore: { fontSize: 24, fontWeight: "800" },
});
