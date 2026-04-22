import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { signInWithGoogle, continueAsGuest } from "../services/auth";
import { mergeCloudToLocal } from "../services/cloudSync";
import { useTheme, getLogo } from "../services/theme";

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";

export default function AuthScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
      offlineAccess: false,
    });
  }, []);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);

      if (!GOOGLE_WEB_CLIENT_ID) {
        Alert.alert(
          "Config error",
          "Google Web Client ID is missing. Check .env and rebuild."
        );
        return;
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      try {
        await GoogleSignin.signOut();
      } catch {}

      const response: any = await GoogleSignin.signIn();

      if (response?.type === "cancelled") return;

      const idToken =
        response?.data?.idToken ??
        response?.idToken ??
        response?.user?.idToken ??
        null;

      if (!idToken) {
        console.warn("Google sign-in response:", JSON.stringify(response));
        Alert.alert(
          "Sign in failed",
          "Google did not return an ID token. (Check logs)"
        );
        return;
      }

      await signInWithGoogle(idToken);
      await mergeCloudToLocal();
      router.replace("/");
    } catch (e: any) {
      console.warn(
        "Google sign-in error:",
        e?.code,
        e?.message,
        JSON.stringify(e)
      );
      if (e?.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (e?.code === statusCodes.IN_PROGRESS) return;
      if (e?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          "Google Play Services",
          "Google Play Services is not available or out of date on this device."
        );
        return;
      }
      if (e?.code === "DEVELOPER_ERROR" || e?.code === 10) {
        Alert.alert(
          "Sign-in misconfigured",
          "SHA-1 or package name doesn't match the Android OAuth client in Google Cloud Console. Add both upload key AND Play App Signing SHA-1 to the Android client, and Firebase, then wait a few minutes."
        );
        return;
      }
      Alert.alert(
        "Sign in failed",
        `${e?.code ?? ""} ${e?.message ?? "Please try again"}`.trim()
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    await continueAsGuest();
    router.replace("/");
  }

  const googleBg = mode === "dark" ? "#FFFFFF" : "#1F2937";
  const googleFg = mode === "dark" ? "#1A1A1A" : "#FFFFFF";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image
            source={getLogo(mode)}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.text }]}>Welcome to Nabra</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            Master your Arabic pronunciation with AI-powered feedback
          </Text>
        </View>

        <View style={styles.authSection}>
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: googleBg }]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={googleFg} size="small" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={[styles.googleButtonText, { color: googleFg }]}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.benefitsTitle, { color: colors.textMuted }]}>
              Why create an account?
            </Text>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>☁️</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Sync progress across devices
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>📊</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Never lose your learning history
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>🔄</Text>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                Pick up where you left off anywhere
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textDim }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.guestButton, { borderColor: colors.borderStrong }]}
            onPress={handleGuest}
            activeOpacity={0.8}
          >
            <Text style={[styles.guestButtonText, { color: colors.textDim }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>
          <Text style={[styles.guestNote, { color: colors.textDim }]}>
            Your progress will only be saved on this device
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
  },
  hero: { alignItems: "center" },
  logo: { width: 230, height: 180, marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  authSection: { gap: 24 },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4285F4",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  benefitsCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    gap: 14,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  benefitIcon: { fontSize: 18 },
  benefitText: { fontSize: 15, color: "#D1D5DB", flex: 1 },
  bottomSection: { alignItems: "center", gap: 16 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1F1F1F" },
  dividerText: { color: "#4B5563", fontSize: 14, fontWeight: "500" },
  guestButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  guestButtonText: { color: "#6B7280", fontSize: 16, fontWeight: "600" },
  guestNote: {
    fontSize: 12,
    color: "#4B5563",
    textAlign: "center",
  },
});
