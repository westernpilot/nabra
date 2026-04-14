import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import WordWithAudio from "../components/WordWithAudio";
import RecordButton from "../components/RecordButton";
import {
  runAssessment,
  assessSingleWord,
  type AssessmentResult,
  type SentenceResult,
} from "../services/assessment";
import {
  ZONE_INFO,
  getLanguageNote,
  type LetterTip,
} from "../services/arabicGuide";
import { saveSession } from "../services/progress";
import { getSelectedLanguage } from "../services/languages";
import {
  getUserLevel,
  setUserLevel,
  calculateNewLevel,
  LEVEL_INFO,
  type DifficultyLevel,
} from "../services/levels";
import AICoach from "../components/AICoach";

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

export default function ResultScreen() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryWord, setRetryWord] = useState<string | null>(null);
  const [retryLoading, setRetryLoading] = useState(false);
  const [retryScore, setRetryScore] = useState<number | null>(null);
  const [levelChange, setLevelChange] = useState<{
    oldLevel: DifficultyLevel;
    newLevel: DifficultyLevel;
    direction: "up" | "down" | "same";
  } | null>(null);

  const langCode = getSelectedLanguage()?.code || "en";

  useEffect(() => {
    (async () => {
      try {
        const oldLevel = await getUserLevel();
        const r = await runAssessment();
        setResult(r);
        await saveSession(r);

        const { newLevel, direction } = calculateNewLevel(oldLevel, r.score);
        setLevelChange({ oldLevel, newLevel, direction });
        if (newLevel !== oldLevel) {
          await setUserLevel(newLevel);
        }
      } catch (err) {
        console.error("Assessment error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRetryRecord = useCallback(
    async (uri: string) => {
      if (!retryWord) return;
      setRetryLoading(true);
      try {
        const wordResult = await assessSingleWord(uri, retryWord);
        setRetryScore(wordResult.score);
      } catch {
        setRetryScore(0);
      } finally {
        setRetryLoading(false);
      }
    },
    [retryWord]
  );

  const closeRetryModal = () => {
    setRetryWord(null);
    setRetryScore(null);
    setRetryLoading(false);
  };

  function highlightSentence(sr: SentenceResult) {
    const refWords = sr.sentence.split(" ");
    return refWords.map((word, wi) => {
      const isMistake = sr.mistakes.includes(word);
      const wordData = sr.words[wi];
      const weakSet = new Set(wordData?.weakLetterIndices || []);
      const hasWeakLetters = weakSet.size > 0;

      if (hasWeakLetters) {
        return (
          <Text
            key={wi}
            onPress={() => setRetryWord(word)}
          >
            {[...word].map((ch, ci) => (
              <Text
                key={ci}
                style={
                  weakSet.has(ci)
                    ? styles.weakLetter
                    : styles.correctWord
                }
              >
                {ch}
              </Text>
            ))}
            <Text style={styles.correctWord}>{" "}</Text>
          </Text>
        );
      }

      return (
        <Text
          key={wi}
          style={isMistake ? styles.mistakeWord : styles.correctWord}
          onPress={isMistake ? () => setRetryWord(word) : undefined}
        >
          {word}{" "}
        </Text>
      );
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E5E5E5" />
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

  const currentLevel = levelChange?.newLevel || "beginner_1";

  return (
    <SafeAreaView style={styles.safe}>
      {result && (
        <AICoach result={result} level={currentLevel} />
      )}

      {/* Retry word modal */}
      <Modal
        visible={retryWord !== null}
        transparent
        animationType="slide"
        onRequestClose={closeRetryModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Practice Word</Text>
              <TouchableOpacity onPress={closeRetryModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalWord}>{retryWord}</Text>

            {retryLoading && (
              <Text style={styles.modalAssessing}>Analyzing...</Text>
            )}
            {retryScore !== null && !retryLoading && (
              <View style={styles.modalScoreRow}>
                <View
                  style={[
                    styles.modalScoreBadge,
                    { backgroundColor: getScoreColor(retryScore) },
                  ]}
                >
                  <Text style={styles.modalScoreText}>
                    {retryScore}/100
                  </Text>
                </View>
                <Text
                  style={[
                    styles.modalScoreLabel,
                    { color: getScoreColor(retryScore) },
                  ]}
                >
                  {retryScore >= 80
                    ? "Excellent!"
                    : retryScore >= 60
                    ? "Getting better!"
                    : "Keep trying!"}
                </Text>
              </View>
            )}

            <RecordButton
              onRecordingComplete={handleRetryRecord}
              disabled={retryLoading}
            />

            <Text style={styles.modalHint}>
              Tap the mic and say "{retryWord}" clearly
            </Text>
          </View>
        </View>
      </Modal>

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

        {/* Level change */}
        {levelChange && levelChange.direction !== "same" && (
          <View
            style={[
              styles.levelChangeCard,
              {
                borderColor:
                  levelChange.direction === "up" ? "#22C55E" : "#F59E0B",
              },
            ]}
          >
            <Text style={styles.levelChangeIcon}>
              {levelChange.direction === "up" ? "⬆" : "⬇"}
            </Text>
            <View style={styles.levelChangeInfo}>
              <Text style={styles.levelChangeTitle}>
                {levelChange.direction === "up"
                  ? "Level Up!"
                  : "Level Adjusted"}
              </Text>
              <Text style={styles.levelChangeDesc}>
                <Text style={{ color: LEVEL_INFO[levelChange.oldLevel].color }}>
                  {LEVEL_INFO[levelChange.oldLevel].label}
                </Text>
                {"  →  "}
                <Text style={{ color: LEVEL_INFO[levelChange.newLevel].color, fontWeight: "800" }}>
                  {LEVEL_INFO[levelChange.newLevel].label}
                </Text>
              </Text>
              <Text style={styles.levelChangeHint}>
                {levelChange.direction === "up"
                  ? "Your next test will have harder sentences!"
                  : "We'll give you easier sentences to build confidence."}
              </Text>
            </View>
          </View>
        )}

        {levelChange && levelChange.direction === "same" && (
          <View style={styles.levelSameCard}>
            <Text style={[styles.levelSameText, { color: LEVEL_INFO[levelChange.newLevel].color }]}>
              Level: {LEVEL_INFO[levelChange.newLevel].label} {LEVEL_INFO[levelChange.newLevel].labelAr}
            </Text>
            <Text style={styles.levelSameHint}>
              {result!.score >= 60
                ? "Score 80+ to advance to the next level"
                : "Keep practicing to improve your score"}
            </Text>
          </View>
        )}

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
                    <Text style={styles.errorBadgeText}>
                      {sr.mistakes.length} error
                      {sr.mistakes.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={styles.sentenceText}>
              {highlightSentence(sr)}
            </Text>

            {sr.mistakes.length > 0 && (
              <View style={styles.mistakesSection}>
                <Text style={styles.mistakesTitle}>
                  Tap red words to practice, or hear correct pronunciation:
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
                  const langNote = getLanguageNote(langCode, tip.letter);
                  return (
                    <TouchableOpacity
                      key={i}
                      style={styles.letterTipCard}
                      onPress={() =>
                        router.push({
                          pathname: "/drill",
                          params: { letter: tip.letter },
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.letterTipTop}>
                        <View
                          style={[
                            styles.letterCircle,
                            { borderColor: zone.color },
                          ]}
                        >
                          <Text
                            style={[
                              styles.letterTipLetter,
                              { color: zone.color },
                            ]}
                          >
                            {tip.letter}
                          </Text>
                        </View>
                        <View style={styles.letterTipInfo}>
                          <Text style={styles.letterTipName}>{tip.name}</Text>
                          <Text style={styles.letterTipNameAr}>
                            {tip.nameAr}
                          </Text>
                        </View>
                        <Text style={styles.drillArrow}>→</Text>
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
                        <View
                          style={[
                            styles.zoneBadge,
                            { backgroundColor: zone.color + "18" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.zoneBadgeText,
                              { color: zone.color },
                            ]}
                          >
                            {zone.icon} {zone.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.letterTipText}>{tip.tip}</Text>

                      {langNote && (
                        <View style={styles.langNoteBox}>
                          <Text style={styles.langNoteText}>{langNote}</Text>
                        </View>
                      )}

                      <View style={styles.drillPrompt}>
                        <Text style={styles.drillPromptText}>
                          Tap to practice this letter →
                        </Text>
                      </View>
                    </TouchableOpacity>
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

        {/* Buttons */}
        {levelChange?.direction === "up" && (
          <TouchableOpacity
            style={styles.nextChallengeButton}
            onPress={() => router.replace("/test")}
            activeOpacity={0.8}
          >
            <Text style={styles.nextChallengeText}>
              Next Challenge: {LEVEL_INFO[levelChange.newLevel].label} →
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/test")}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>
            {levelChange?.direction === "up" ? "Retry This Level" : "Try Again"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/history")}
          activeOpacity={0.8}
        >
          <Text style={styles.historyButtonText}>View Progress</Text>
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
  safe: { flex: 1, backgroundColor: "#000000" },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E5E5E5",
    marginTop: 24,
  },
  loadingSub: { fontSize: 14, color: "#6B7280", marginTop: 8 },
  errorText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 8,
  },
  scroll: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  scoreCard: {
    backgroundColor: "#141414",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F1F1F",
    marginBottom: 32,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
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
  scoreNumber: { fontSize: 48, fontWeight: "800" },
  scoreOutOf: { fontSize: 16, fontWeight: "600", marginTop: -4 },
  scoreBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  scoreBadgeText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E5E5E5",
    marginBottom: 16,
  },
  sentenceCard: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  sentenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sentenceScoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sentenceScore: { fontSize: 16, fontWeight: "800" },
  sentenceIndex: { fontSize: 14, fontWeight: "700", color: "#6B7280" },
  perfectBadge: {
    backgroundColor: "#0D2818",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  perfectText: { fontSize: 13, fontWeight: "600", color: "#22C55E" },
  errorBadge: {
    backgroundColor: "#2A1215",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  errorBadgeText: { fontSize: 13, fontWeight: "600", color: "#EF4444" },
  sentenceText: {
    fontSize: 24,
    lineHeight: 44,
    textAlign: "right",
    writingDirection: "rtl",
  },
  correctWord: { color: "#E5E5E5", fontWeight: "500" },
  mistakeWord: {
    color: "#EF4444",
    fontWeight: "700",
    textDecorationLine: "underline",
    textDecorationColor: "#EF4444",
  },
  weakLetter: {
    color: "#EF4444",
    fontWeight: "800",
    backgroundColor: "#2A1215",
    borderRadius: 2,
  },
  mistakesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#1F1F1F",
  },
  mistakesTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },
  mistakesList: { flexDirection: "row-reverse", flexWrap: "wrap" },
  letterTipsSection: { marginTop: 16 },
  letterTipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E5E5E5",
    marginBottom: 10,
  },
  letterTipCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1F1F1F",
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
    backgroundColor: "#2A2A2A",
  },
  letterTipLetter: { fontSize: 28, fontWeight: "800" },
  letterTipInfo: { flex: 1 },
  letterTipName: { fontSize: 16, fontWeight: "700", color: "#E5E5E5" },
  letterTipNameAr: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  drillArrow: { fontSize: 20, color: "#4B5563", fontWeight: "700" },
  zoneBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  zoneBarLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4B5563",
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
    backgroundColor: "#2A2A2A",
  },
  zoneBadgeRow: { flexDirection: "row", marginBottom: 10 },
  zoneBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  zoneBadgeText: { fontSize: 13, fontWeight: "700" },
  letterTipText: { fontSize: 14, lineHeight: 21, color: "#6B7280" },
  langNoteBox: {
    backgroundColor: "#1A1A2A",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#2A2A3A",
  },
  langNoteText: {
    fontSize: 13,
    lineHeight: 19,
    color: "#8B8BFF",
    fontWeight: "500",
  },
  drillPrompt: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#1F1F1F",
  },
  drillPromptText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },
  feedbackCard: {
    backgroundColor: "#1A1A0A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#3A3A1A",
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#D4A017",
    marginBottom: 8,
  },
  feedbackText: { fontSize: 15, lineHeight: 24, color: "#B8960F" },
  retryButton: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  retryButtonText: { color: "#E5E5E5", fontSize: 17, fontWeight: "700" },
  historyButton: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#1F1F1F",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  historyButtonText: { color: "#9CA3AF", fontSize: 17, fontWeight: "700" },
  homeButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1F1F1F",
  },
  homeButtonText: { color: "#6B7280", fontSize: 17, fontWeight: "700" },

  // Retry modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#E5E5E5" },
  modalClose: { fontSize: 22, color: "#6B7280", fontWeight: "600" },
  modalWord: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    writingDirection: "rtl",
    marginBottom: 8,
  },
  modalAssessing: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 8,
  },
  modalScoreRow: { alignItems: "center", marginBottom: 8, gap: 8 },
  modalScoreBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalScoreText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  modalScoreLabel: { fontSize: 15, fontWeight: "600" },
  modalHint: {
    textAlign: "center",
    color: "#4B5563",
    fontSize: 13,
    marginTop: 8,
  },

  // Level change
  levelChangeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    gap: 16,
  },
  levelChangeIcon: { fontSize: 32 },
  levelChangeInfo: { flex: 1 },
  levelChangeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#E5E5E5",
    marginBottom: 4,
  },
  levelChangeDesc: { fontSize: 16, color: "#6B7280", marginBottom: 6 },
  levelChangeHint: { fontSize: 13, color: "#4B5563", lineHeight: 18 },
  levelSameCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  levelSameText: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  levelSameHint: { fontSize: 13, color: "#4B5563" },
  nextChallengeButton: {
    backgroundColor: "#0D2818",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  nextChallengeText: {
    color: "#22C55E",
    fontSize: 17,
    fontWeight: "700",
  },
});
