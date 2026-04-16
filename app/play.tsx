import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import RecordButton from "../components/RecordButton";
import {
  storeSentences,
  storeRecordings,
} from "../services/assessment";
import {
  getGameLevel,
  saveGameLevelResult,
  getTierForLevel,
} from "../services/levels";
import { recordActivity } from "../services/streak";
import { useTheme } from "../services/theme";

export default function PlayScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { level: levelParam } = useLocalSearchParams<{ level: string }>();
  const levelNum = parseInt(levelParam || "1", 10);

  const gameLevel = getGameLevel(levelNum);
  const tierInfo = getTierForLevel(levelNum);
  const sentences = gameLevel.sentences;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [currentRecordingUri, setCurrentRecordingUri] = useState<string | null>(null);

  useEffect(() => {
    storeSentences(sentences);
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
      router.replace({
        pathname: "/result",
        params: { gameLevel: String(levelNum) },
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setCurrentRecordingUri(null);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.backText, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            {sentences.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  { backgroundColor: colors.borderStrong },
                  i < currentIndex && styles.progressDotDone,
                  i === currentIndex && [
                    styles.progressDotActive,
                    { backgroundColor: tierInfo.tierColor },
                  ],
                ]}
              />
            ))}
          </View>
          <Text style={[styles.counter, { color: colors.textDim }]}>
            {currentIndex + 1}/{sentences.length}
          </Text>
        </View>

        {/* Level badge */}
        <View style={styles.levelRow}>
          <View style={[
            styles.levelBadge,
            { borderColor: tierInfo.tierColor, backgroundColor: colors.card },
          ]}>
            <Text style={[styles.levelLabel, { color: tierInfo.tierColor }]}>
              Level {levelNum}
            </Text>
            <Text style={[styles.tierName, { color: colors.textDim }]}>{tierInfo.tierLabel}</Text>
          </View>
        </View>

        {/* Sentence Display */}
        <View style={[styles.sentenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.instruction, { color: colors.textDim }]}>Read aloud:</Text>
          <Text style={[styles.sentence, { color: colors.text }]}>{sentences[currentIndex]}</Text>
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
            {
              backgroundColor: hasRecorded ? tierInfo.tierColor + "30" : colors.cardAlt,
              borderColor: hasRecorded ? tierInfo.tierColor : colors.border,
            },
          ]}
          onPress={handleNext}
          disabled={!hasRecorded}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.nextButtonText,
              { color: hasRecorded ? tierInfo.tierColor : colors.textDim },
            ]}
          >
            {isLastSentence ? "See Results" : "Next Sentence"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
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
  progressContainer: { flexDirection: "row", gap: 6 },
  progressDot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2A2A2A",
  },
  progressDotActive: { width: 40 },
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
  levelLabel: { fontSize: 15, fontWeight: "800" },
  tierName: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
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
    fontSize: 30,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 50,
    writingDirection: "rtl",
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  nextButtonText: { color: "#4B5563", fontSize: 17, fontWeight: "700" },
});
