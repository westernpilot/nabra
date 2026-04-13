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
    backgroundColor: "#0A0A0A",
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
    backgroundColor: "#1F1F1F",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 18,
    color: "#9CA3AF",
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
    backgroundColor: "#2A2A2A",
  },
  progressDotActive: {
    backgroundColor: "#E5E5E5",
    width: 48,
  },
  progressDotDone: {
    backgroundColor: "#22C55E",
  },
  counter: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  sentenceCard: {
    backgroundColor: "#141414",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginTop: 24,
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
  nextButtonDisabled: {
    backgroundColor: "#1A1A1A",
    borderColor: "#1F1F1F",
  },
  nextButtonText: {
    color: "#E5E5E5",
    fontSize: 17,
    fontWeight: "700",
  },
});
