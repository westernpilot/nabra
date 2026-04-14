import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { getUserLevel, LEVEL_INFO, type DifficultyLevel } from "../services/levels";

export default function HomeScreen() {
  const router = useRouter();
  const [level, setLevel] = useState<DifficultyLevel>("beginner_1");

  useEffect(() => {
    getUserLevel().then(setLevel);
  }, []);

  const info = LEVEL_INFO[level];

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
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pronunciation Test</Text>
            <View style={[styles.levelBadge, { borderColor: info.color }]}>
              <Text style={[styles.levelText, { color: info.color }]}>
                {info.label}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            {info.description}. Read 3 sentences aloud and we'll score your pronunciation.
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3 sentences</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>~2 min</Text>
            </View>
            <View style={[styles.badge, { borderWidth: 1, borderColor: info.color + "40" }]}>
              <Text style={[styles.badgeText, { color: info.color }]}>
                {info.labelAr}
              </Text>
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

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/history")}
          activeOpacity={0.8}
        >
          <Text style={styles.historyButtonText}>View Progress</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000000" },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  hero: { alignItems: "center", marginBottom: 48 },
  logo: { width: 220, height: 160, marginBottom: 12 },
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: "700", color: "#FFFFFF" },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#1A1A1A",
  },
  levelText: { fontSize: 13, fontWeight: "700" },
  cardDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 16,
  },
  cardMeta: { flexDirection: "row", gap: 8 },
  badge: {
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },
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
  historyButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  historyButtonText: { color: "#6B7280", fontSize: 16, fontWeight: "600" },
});
