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
import { getProblemLetters } from "../services/progress";
import { generateTargetedSentences } from "../services/ai";

export default function TestScreen() {
  const router = useRouter();
  const [level, setLevel] = useState<DifficultyLevel | null>(null);
  const [sentences, setSentences] = useState<string[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [currentRecordingUri, setCurrentRecordingUri] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState("Loading...");

  useEffect(() => {
    (async () => {
      const l = await getUserLevel();
      setLevel(l);

      try {
        const problems = await getProblemLetters();
        if (problems.length >= 2) {
          setLoadingText("AI is creating sentences for your weak letters...");
          const weakLetters = problems.slice(0, 4).map((p) => p.letter);
          const aiSentences = await generateTargetedSentences({
            weakLetters,
            level: l,
            count: 3,
          });

          if (aiSentences.length === 3) {
            setSentences(aiSentences);
            storeSentences(aiSentences);
            setAiGenerated(true);
            return;
          }
        }
      } catch (e) {
        console.warn("AI sentence generation failed, using bank:", e);
      }

      const s = getSentencesForLevel(l);
      setSentences(s);
      storeSentences(s);
    })();
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
          <Text style={styles.loadingLabel}>{loadingText}</Text>
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
          {aiGenerated && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>✦ AI Targeted</Text>
            </View>
          )}
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
  safe: { flex: 1, backgroundColor: "#000000" },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingLabel: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 40,
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
  levelRow: { alignItems: "center", marginBottom: 8, gap: 8 },
  aiBadge: {
    backgroundColor: "#8B5CF620",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#8B5CF640",
  },
  aiBadgeText: {
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
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
