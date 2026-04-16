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
  PanResponder,
  Dimensions,
} from "react-native";
import { getCoachFeedback } from "../services/ai";
import { getProblemLetters } from "../services/progress";
import { getSelectedLanguage } from "../services/languages";
import type { AssessmentResult } from "../services/assessment";
import type { DifficultyLevel } from "../services/levels";
import { useTheme } from "../services/theme";

interface Props {
  result: AssessmentResult;
  level: DifficultyLevel;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_SMALL = SCREEN_HEIGHT * 0.55;
const SHEET_LARGE = SCREEN_HEIGHT * 0.92;
const SNAP_CLOSE = 0;

export default function AICoach({ result, level }: Props) {
  const { colors, mode } = useTheme();
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  const sheetHeight = useRef(new Animated.Value(SHEET_SMALL)).current;
  const lastHeight = useRef(SHEET_SMALL);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderGrant: () => {
        sheetHeight.stopAnimation((v) => {
          lastHeight.current = v;
        });
      },
      onPanResponderMove: (_, gesture) => {
        const next = Math.max(
          100,
          Math.min(SHEET_LARGE, lastHeight.current - gesture.dy)
        );
        sheetHeight.setValue(next);
      },
      onPanResponderRelease: (_, gesture) => {
        const projected = lastHeight.current - gesture.dy;
        const velocity = -gesture.vy;

        let target: number;
        if (projected < SHEET_SMALL * 0.6 && velocity < 0.5) {
          target = SNAP_CLOSE;
        } else if (velocity > 0.5 || projected > (SHEET_SMALL + SHEET_LARGE) / 2) {
          target = SHEET_LARGE;
        } else if (velocity < -0.5) {
          target = SHEET_SMALL;
        } else {
          target = projected > SHEET_SMALL * 1.2 ? SHEET_LARGE : SHEET_SMALL;
        }

        Animated.spring(sheetHeight, {
          toValue: target,
          useNativeDriver: false,
          tension: 60,
          friction: 10,
        }).start(() => {
          lastHeight.current = target;
          if (target === SNAP_CLOSE) {
            setOpen(false);
            sheetHeight.setValue(SHEET_SMALL);
            lastHeight.current = SHEET_SMALL;
          }
        });
      },
    })
  ).current;

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
      sheetHeight.setValue(SHEET_SMALL);
      lastHeight.current = SHEET_SMALL;
      return;
    }

    setOpen(true);
    sheetHeight.setValue(SHEET_SMALL);
    lastHeight.current = SHEET_SMALL;
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

  function closeSheet() {
    Animated.timing(sheetHeight, {
      toValue: SNAP_CLOSE,
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      setOpen(false);
      sheetHeight.setValue(SHEET_SMALL);
      lastHeight.current = SHEET_SMALL;
    });
  }

  const accent = "#8B5CF6";

  return (
    <>
      {/* Floating button */}
      <View style={styles.fabContainer}>
        <Animated.View style={[styles.fabGlow, { opacity: glowAnim, backgroundColor: accent }]} />
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: accent }]}
            onPress={fetchCoaching}
            activeOpacity={0.8}
          >
            <Text style={styles.fabIcon}>✦</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={[styles.fabLabel, { color: accent }]}>AI Coach</Text>
      </View>

      {/* Coach modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeSheet}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeSheet}
          />
          <Animated.View
            style={[
              styles.sheet,
              {
                height: sheetHeight,
                backgroundColor: colors.bgElevated,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Drag handle area */}
            <View style={styles.dragArea} {...panResponder.panHandlers}>
              <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />

              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                  <View style={[styles.coachAvatar, { backgroundColor: accent }]}>
                    <Text style={styles.coachAvatarText}>✦</Text>
                  </View>
                  <View>
                    <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>Nabra AI Coach</Text>
                    <Text style={[styles.headerSub, { color: colors.textDim }]}>
                      Swipe up to expand · tap ✕ to close
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={closeSheet}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={[styles.closeBtn, { color: colors.textDim }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
              {loading && (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color={accent} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Analyzing your pronunciation...
                  </Text>
                  <Text style={[styles.loadingSub, { color: colors.textDim }]}>
                    Your AI coach is preparing personalized tips
                  </Text>
                </View>
              )}

              {error && !loading && (
                <View style={styles.errorState}>
                  <Text style={styles.errorIcon}>⚠</Text>
                  <Text style={styles.errorTitle}>Couldn't reach AI Coach</Text>
                  <Text style={[styles.errorSub, { color: colors.textDim }]}>
                    Check your internet connection or API key
                  </Text>
                  <TouchableOpacity
                    style={[styles.retryBtn, { backgroundColor: colors.card }]}
                    onPress={() => {
                      setFeedback(null);
                      setError(false);
                      fetchCoaching();
                    }}
                  >
                    <Text style={[styles.retryBtnText, { color: colors.textSecondary }]}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}

              {feedback && !loading && (
                <View style={styles.feedbackContainer}>
                  <View
                    style={[
                      styles.aiBadge,
                      {
                        backgroundColor: accent + "20",
                        borderColor: accent + "40",
                      },
                    ]}
                  >
                    <Text style={[styles.aiBadgeText, { color: mode === "dark" ? "#A78BFA" : "#7C3AED" }]}>
                      ✦ AI-Powered
                    </Text>
                  </View>
                  <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>
                    {feedback}
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
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
    top: -8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  fabIcon: { fontSize: 28, color: "#FFFFFF", fontWeight: "800" },
  fabLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
    letterSpacing: 0.3,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    overflow: "hidden",
  },
  dragArea: {
    paddingBottom: 0,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
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
    justifyContent: "center",
    alignItems: "center",
  },
  coachAvatarText: { fontSize: 20, color: "#FFFFFF", fontWeight: "800" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerSub: { fontSize: 11, marginTop: 2 },
  closeBtn: { fontSize: 22, fontWeight: "600", padding: 4 },
  body: { flex: 1 },
  bodyContent: { padding: 24, paddingBottom: 40 },
  loadingState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 16,
  },
  loadingText: { fontSize: 16, fontWeight: "600" },
  loadingSub: { fontSize: 13 },
  errorState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  errorIcon: { fontSize: 36 },
  errorTitle: { fontSize: 18, fontWeight: "700", color: "#EF4444" },
  errorSub: { fontSize: 14, textAlign: "center" },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: { fontSize: 15, fontWeight: "600" },
  feedbackContainer: { gap: 16 },
  aiBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  aiBadgeText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  feedbackText: { fontSize: 16, lineHeight: 26, fontWeight: "400" },
});
