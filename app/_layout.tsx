import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initAuth, onAuthChange, type AuthState } from "../services/auth";
import { initTheme, useTheme } from "../services/theme";
import {
  isOnboardingComplete,
  isOnboardingCompleteSync,
} from "../services/onboarding";
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
    Promise.all([initAuth(), initTheme(), loadSelectedLanguage()]).then(() =>
      setReady(true)
    );
    const unsub = onAuthChange(setAuthState);
    return unsub;
  }, []);

  useEffect(() => {
    if (!ready) return;

    const route = segments[0];
    const onAuthScreen = route === "auth";
    const onOnboarding = route === "language" || route === "reminder";
    const isAuthed = authState.status !== "loading";

    const applyGuard = (done: boolean) => {
      setOnboardingDone(done);

      if (!isAuthed && !onAuthScreen) {
        router.replace("/auth");
        return;
      }
      if (isAuthed && onAuthScreen) {
        router.replace(done ? "/" : "/language");
        return;
      }
      if (isAuthed && !done && !onOnboarding && !onAuthScreen) {
        router.replace("/language");
      }
    };

    const sync = isOnboardingCompleteSync();
    if (sync !== null) {
      applyGuard(sync);
      return;
    }

    let cancelled = false;
    isOnboardingComplete().then((done) => {
      if (cancelled) return;
      applyGuard(done);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, authState, segments]);

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
