import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Image
            source={require("../assets/logo-white.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>
            Master your Arabic pronunciation
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pronunciation Test</Text>
          <Text style={styles.cardDescription}>
            Read 3 short Arabic sentences aloud. We'll analyze your
            pronunciation and highlight areas to improve.
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3 sentences</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>~2 min</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push("/language")}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Test</Text>
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
    justifyContent: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 220,
    height: 160,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "#141414",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 16,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  startButton: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  startButtonText: {
    color: "#E5E5E5",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
