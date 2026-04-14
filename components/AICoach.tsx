import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  ActivityIndicator,
  Easing,
} from "react-native";
import { getCoachFeedback } from "../services/ai";
import { getProblemLetters } from "../services/progress";
import { getSelectedLanguage } from "../services/languages";
import type { AssessmentResult } from "../services/assessment";
import type { DifficultyLevel } from "../services/levels";

interface Props {
  result: AssessmentResult;
  level: DifficultyLevel;
}

export default function AICoach({ result, level }: Props) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, []);

  async function fetchCoaching() {
    if (feedback) {
      setOpen(true);
      return;
    }

    setOpen(true);
    setLoading(true);
    setError(false);

    try {
      const lang = getSelectedLanguage();
      const problems = await getProblemLetters();

      const text = await getCoachFeedback({
        result,
        nativeLanguage: lang?.name || "English",
        level,
        problemLetters: problems,
      });

      setFeedback(text);
    } catch (e) {
      console.error("AI Coach error:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <View style={styles.fabContainer}>
        <Animated.View style={[styles.fabGlow, { opacity: glowAnim }]} />
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.fab}
            onPress={fetchCoaching}
            activeOpacity={0.8}
          >
            <Text style={styles.fabIcon}>✦</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.fabLabel}>AI Coach</Text>
      </View>

      {/* Coach modal */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.coachAvatar}>
                  <Text style={styles.coachAvatarText}>✦</Text>
                </View>
                <View>
                  <Text style={styles.headerTitle}>Nabra AI Coach</Text>
                  <Text style={styles.headerSub}>
                    Personalized feedback for you
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
              {loading && (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text style={styles.loadingText}>
                    Analyzing your pronunciation...
                  </Text>
                  <Text style={styles.loadingSub}>
                    Your AI coach is preparing personalized tips
                  </Text>
                </View>
              )}

              {error && !loading && (
                <View style={styles.errorState}>
                  <Text style={styles.errorIcon}>⚠</Text>
                  <Text style={styles.errorTitle}>
                    Couldn't reach AI Coach
                  </Text>
                  <Text style={styles.errorSub}>
                    Check your internet connection or API key
                  </Text>
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => {
                      setFeedback(null);
                      setError(false);
                      fetchCoaching();
                    }}
                  >
                    <Text style={styles.retryBtnText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {feedback && !loading && (
                <View style={styles.feedbackContainer}>
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>✦ AI-Powered</Text>
                  </View>
                  <Text style={styles.feedbackText}>{feedback}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 24,
    alignItems: "center",
    zIndex: 100,
  },
  fabGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8B5CF6",
    top: -8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  fabLabel: {
    color: "#8B5CF6",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
    letterSpacing: 0.3,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    minHeight: 300,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2A2A2A",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coachAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  coachAvatarText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#E5E5E5",
  },
  headerSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  closeBtn: {
    fontSize: 22,
    color: "#6B7280",
    fontWeight: "600",
    padding: 4,
  },
  body: { flex: 1 },
  bodyContent: { padding: 24, paddingBottom: 40 },
  loadingState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E5E5E5",
  },
  loadingSub: {
    fontSize: 13,
    color: "#6B7280",
  },
  errorState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  errorIcon: { fontSize: 36 },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EF4444",
  },
  errorSub: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    color: "#E5E5E5",
    fontSize: 15,
    fontWeight: "600",
  },
  feedbackContainer: { gap: 16 },
  aiBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#8B5CF620",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#8B5CF640",
  },
  aiBadgeText: {
    color: "#A78BFA",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 26,
    color: "#D1D5DB",
    fontWeight: "400",
  },
});
