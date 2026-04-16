import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initAuth, onAuthChange, type AuthState } from "../services/auth";
import { initTheme, useTheme } from "../services/theme";
import { isOnboardingComplete } from "../services/onboarding";
import { loadSelectedLanguage } from "../services/languages";
import SplashAnimation from "../components/SplashAnimation";

export default function RootLayout() {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [ready, setReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const { mode, colors } = useTheme();

  useEffect(() => {
    Promise.all([
      initAuth(),
      initTheme(),
      loadSelectedLanguage(),
      isOnboardingComplete().then((v) => setOnboardingDone(v)),
    ]).then(() => setReady(true));
    const unsub = onAuthChange(setAuthState);
    return unsub;
  }, []);

  useEffect(() => {
    if (!ready) return;
    isOnboardingComplete().then((v) => setOnboardingDone(v));
  }, [segments, ready]);

  useEffect(() => {
    if (!ready || onboardingDone === null) return;

    const route = segments[0];
    const onAuthScreen = route === "auth";
    const onOnboarding = route === "language" || route === "reminder";
    const isAuthed = authState.status !== "loading";

    if (!isAuthed && !onAuthScreen) {
      router.replace("/auth");
      return;
    }
    if (isAuthed && onAuthScreen) {
      if (!onboardingDone) {
        router.replace("/language");
      } else {
        router.replace("/");
      }
      return;
    }
    if (isAuthed && !onboardingDone && !onOnboarding && !onAuthScreen) {
      router.replace("/language");
    }
  }, [ready, authState, segments, onboardingDone]);

  const showSplash = !splashDone;

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        {ready && (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: "slide_from_right",
            }}
          />
        )}
        {showSplash && <SplashAnimation onFinish={() => setSplashDone(true)} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
