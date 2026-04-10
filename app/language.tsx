import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import {
  LANGUAGES,
  setSelectedLanguage,
  type Language,
} from "../services/languages";

function LanguageCard({
  lang,
  selected,
  onPress,
  index,
}: {
  lang: Language;
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 40,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, index]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
    >
      <TouchableOpacity
        style={[styles.langCard, selected && styles.langCardSelected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.langFlag}>{lang.flag}</Text>
        <View style={styles.langInfo}>
          <Text
            style={[styles.langName, selected && styles.langNameSelected]}
          >
            {lang.name}
          </Text>
          <Text
            style={[
              styles.langNative,
              selected && styles.langNativeSelected,
            ]}
          >
            {lang.nativeName}
          </Text>
        </View>
        {selected && (
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Language | null>(null);
  const [search, setSearch] = useState("");

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  const handleContinue = () => {
    if (!selected) return;
    setSelectedLanguage(selected);
    router.replace("/test");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.arabicTitle}>ما لغتك الأم؟</Text>
          <Text style={styles.title}>What's your native language?</Text>
          <Text style={styles.subtitle}>
            This helps us tailor lessons to your background
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search languages..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          renderItem={({ item, index }) => (
            <LanguageCard
              lang={item}
              selected={selected?.code === item.code}
              onPress={() => setSelected(item)}
              index={index}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selected && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {selected
              ? `Continue as ${selected.name} speaker`
              : "Select your language"}
          </Text>
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  arabicTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E293B",
    writingDirection: "rtl",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    padding: 0,
  },
  clearButton: {
    fontSize: 16,
    color: "#94A3B8",
    fontWeight: "600",
    paddingLeft: 8,
  },
  list: {
    paddingBottom: 8,
  },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#F1F5F9",
    elevation: 1,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  langCardSelected: {
    borderColor: "#1E293B",
    backgroundColor: "#F8FAFC",
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  langFlag: {
    fontSize: 30,
    marginRight: 14,
  },
  langInfo: {
    flex: 1,
  },
  langName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
  langNameSelected: {
    color: "#1E293B",
  },
  langNative: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },
  langNativeSelected: {
    color: "#64748B",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  continueButton: {
    backgroundColor: "#1E293B",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueButtonDisabled: {
    backgroundColor: "#CBD5E1",
    elevation: 0,
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
