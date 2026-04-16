import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "../services/theme";

const BAR_FINAL_HEIGHTS = [42, 82, 112, 82, 42];
const BAR_WIDTH = 14;
const BAR_GAP = 8;
const LETTERS = ["N", "A", "B", "R", "A"];

const PULSE_STEP = 180;
const PULSE_STEPS = 5;
const BAR_STAGGER = 60;
const SETTLE_TIME = 420;

interface Props {
  onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: Props) {
  const { colors, mode } = useTheme();

  const containerOpacity = useRef(new Animated.Value(0)).current;
  const exitFade = useRef(new Animated.Value(1)).current;
  const barHeights = useRef(BAR_FINAL_HEIGHTS.map(() => new Animated.Value(18))).current;
  const sparkleScale = useRef(new Animated.Value(0)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;
  const letterAnims = useRef(LETTERS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    const pulseHeights = [110, 30, 95, 50, 110];

    const barAnimations = barHeights.map((v, i) => {
      const steps = pulseHeights.map((h) =>
        Animated.timing(v, {
          toValue: h,
          duration: PULSE_STEP,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        })
      );
      const settle = Animated.spring(v, {
        toValue: BAR_FINAL_HEIGHTS[i],
        tension: 60,
        friction: 8,
        useNativeDriver: false,
      });
      return Animated.sequence([
        Animated.delay(i * BAR_STAGGER),
        ...steps,
        settle,
      ]);
    });

    Animated.parallel(barAnimations).start();

    const PULSE_TOTAL_DURATION =
      (PULSE_STEPS - 1) * BAR_STAGGER + PULSE_STEPS * PULSE_STEP;
    const SPARKLE_START = PULSE_TOTAL_DURATION + 120;
    const TEXT_START = PULSE_TOTAL_DURATION + SETTLE_TIME;

    Animated.sequence([
      Animated.delay(SPARKLE_START),
      Animated.parallel([
        Animated.spring(sparkleScale, {
          toValue: 1,
          tension: 110,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleRotate, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.parallel(
      letterAnims.map((v, i) =>
        Animated.sequence([
          Animated.delay(TEXT_START + i * 70),
          Animated.spring(v, {
            toValue: 1,
            tension: 70,
            friction: 9,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();

    const HOLD_UNTIL = TEXT_START + 70 * LETTERS.length + 550;
    const exitTimer = setTimeout(() => {
      Animated.timing(exitFade, {
        toValue: 0,
        duration: 420,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, HOLD_UNTIL);

    return () => clearTimeout(exitTimer);
  }, []);

  const fgColor = mode === "dark" ? "#FFFFFF" : "#0A0A0A";

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.container,
        {
          backgroundColor: colors.bg,
          opacity: Animated.multiply(containerOpacity, exitFade),
        },
      ]}
    >
      <View style={styles.stage}>
        <View style={styles.logoRow}>
          <View style={styles.bars}>
            {BAR_FINAL_HEIGHTS.map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.bar,
                  {
                    height: barHeights[i],
                    width: BAR_WIDTH,
                    marginHorizontal: BAR_GAP / 2,
                    backgroundColor: fgColor,
                  },
                ]}
              />
            ))}
          </View>

          <Animated.View
            style={[
              styles.sparkle,
              {
                opacity: sparkleScale,
                transform: [
                  { scale: sparkleScale },
                  {
                    rotate: sparkleRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["-80deg", "0deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={[styles.diamond, { backgroundColor: fgColor }]} />
          </Animated.View>
        </View>

        <View style={styles.textRow}>
          {LETTERS.map((ch, i) => {
            const v = letterAnims[i];
            return (
              <Animated.Text
                key={i}
                style={[
                  styles.letter,
                  {
                    color: fgColor,
                    opacity: v,
                    transform: [
                      {
                        translateY: v.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-44, 0],
                        }),
                      },
                      {
                        scale: v.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.82, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {ch}
              </Animated.Text>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  stage: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  bars: {
    flexDirection: "row",
    alignItems: "center",
    height: 140,
  },
  bar: {
    borderRadius: 999,
  },
  sparkle: {
    marginLeft: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  diamond: {
    width: 22,
    height: 22,
    transform: [{ rotate: "45deg" }],
    borderRadius: 3,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingVertical: 6,
  },
  letter: {
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: 8,
    marginHorizontal: 1,
  },
});
