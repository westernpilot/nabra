import { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initAuth, onAuthChange, type AuthState } from "../services/auth";

export default function RootLayout() {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initAuth().then(() => setReady(true));
    const unsub = onAuthChange(setAuthState);
    return unsub;
  }, []);

  useEffect(() => {
    if (!ready) return;

    const onAuthScreen = segments[0] === "auth";
    const needsAuth = authState.status === "loading";

    if (needsAuth && !onAuthScreen) {
      router.replace("/auth");
    } else if (!needsAuth && onAuthScreen) {
      router.replace("/");
    }
  }, [ready, authState, segments]);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#E5E5E5" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000000" },
          animation: "slide_from_right",
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
});
