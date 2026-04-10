import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>نَبْرَة</Text>
          <Text style={styles.logoSub}>Nabra</Text>
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
    backgroundColor: "#F8FAFC",
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
    fontSize: 56,
    fontWeight: "700",
    color: "#1E293B",
    writingDirection: "rtl",
  },
  logoSub: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  tagline: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    elevation: 4,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    marginBottom: 16,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  startButton: {
    backgroundColor: "#1E293B",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
