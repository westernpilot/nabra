import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import RecordButton from "../components/RecordButton";
import { TEST_SENTENCES, storeRecordings } from "../services/assessment";

export default function TestScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [currentRecordingUri, setCurrentRecordingUri] = useState<
    string | null
  >(null);

  const isLastSentence = currentIndex === TEST_SENTENCES.length - 1;
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Progress */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            {TEST_SENTENCES.map((_, i) => (
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
            {currentIndex + 1}/{TEST_SENTENCES.length}
          </Text>
        </View>

        {/* Sentence Display */}
        <View style={styles.sentenceCard}>
          <Text style={styles.instruction}>Read aloud:</Text>
          <Text style={styles.sentence}>
            {TEST_SENTENCES[currentIndex]}
          </Text>
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
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 18,
    color: "#64748B",
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
  },
  progressDotActive: {
    backgroundColor: "#1E293B",
    width: 48,
  },
  progressDotDone: {
    backgroundColor: "#22C55E",
  },
  counter: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
  },
  sentenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginTop: 24,
    elevation: 4,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  instruction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 20,
  },
  sentence: {
    fontSize: 32,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
    lineHeight: 52,
    writingDirection: "rtl",
  },
  nextButton: {
    backgroundColor: "#1E293B",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  nextButtonDisabled: {
    backgroundColor: "#CBD5E1",
    elevation: 0,
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
