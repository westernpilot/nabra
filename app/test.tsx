import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import RecordButton from "../components/RecordButton";
import {
  storeSentences,
  storeRecordings,
} from "../services/assessment";
import {
  getSentencesForLevel,
  getUserLevel,
  LEVEL_INFO,
  type DifficultyLevel,
} from "../services/levels";

export default function TestScreen() {
  const router = useRouter();
  const [level, setLevel] = useState<DifficultyLevel | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [currentRecordingUri, setCurrentRecordingUri] = useState<string | null>(null);

  useEffect(() => {
    getUserLevel().then((l) => {
      setLevel(l);
      const s = getSentencesForLevel(l);
      setSentences(s);
      storeSentences(s);
    });
  }, []);

  const isLastSentence = currentIndex === sentences.length - 1;
  const hasRecorded = currentRecordingUri !== null;

  const handleRecordingComplete = useCallback((uri: string) => {
    setCurrentRecordingUri(uri);
  }, []);

  const handleNext = () => {
    if (!currentRecordingUri) return;

    const updatedRecordings = [...recordings, currentRecordingUri];
    setRecordings(updatedRecordings);

    if (isLastSentence) {
      storeRecordings(updatedRecordings);
      router.replace("/result");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setCurrentRecordingUri(null);
    }
  };

  if (!level || sentences.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E5E5E5" />
        </View>
      </SafeAreaView>
    );
  }

  const info = LEVEL_INFO[level];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            {sentences.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i < currentIndex && styles.progressDotDone,
                  i === currentIndex && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          <Text style={styles.counter}>
            {currentIndex + 1}/{sentences.length}
          </Text>
        </View>

        {/* Level badge */}
        <View style={styles.levelRow}>
          <View style={[styles.levelBadge, { borderColor: info.color }]}>
            <Text style={[styles.levelText, { color: info.color }]}>
              {info.label}
            </Text>
            <Text style={styles.levelAr}>{info.labelAr}</Text>
          </View>
        </View>

        {/* Sentence Display */}
        <View style={styles.sentenceCard}>
          <Text style={styles.instruction}>Read aloud:</Text>
          <Text style={styles.sentence}>{sentences[currentIndex]}</Text>
        </View>

        {/* Record Button */}
        <RecordButton
          onRecordingComplete={handleRecordingComplete}
          disabled={hasRecorded}
        />

        {/* Next / Submit */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            !hasRecorded && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!hasRecorded}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {isLastSentence ? "See Results" : "Next Sentence"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0A0A" },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1F1F1F",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 18, color: "#9CA3AF", fontWeight: "600" },
  progressContainer: { flexDirection: "row", gap: 8 },
  progressDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2A2A2A",
  },
  progressDotActive: { backgroundColor: "#E5E5E5", width: 48 },
  progressDotDone: { backgroundColor: "#22C55E" },
  counter: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  levelRow: { alignItems: "center", marginBottom: 8 },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#141414",
  },
  levelText: { fontSize: 14, fontWeight: "700" },
  levelAr: { fontSize: 14, color: "#6B7280", fontWeight: "600" },
  sentenceCard: {
    backgroundColor: "#141414",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  instruction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 20,
  },
  sentence: {
    fontSize: 32,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 52,
    writingDirection: "rtl",
  },
  nextButton: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  nextButtonDisabled: { backgroundColor: "#1A1A1A", borderColor: "#1F1F1F" },
  nextButtonText: { color: "#E5E5E5", fontSize: 17, fontWeight: "700" },
});
