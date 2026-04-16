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
import { useTheme } from "../services/theme";

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
  const { colors } = useTheme();
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
        style={[
          styles.langCard,
          {
            backgroundColor: selected ? colors.cardAlt : colors.card,
            borderColor: selected ? colors.primary : colors.border,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.langFlag}>{lang.flag}</Text>
        <View style={styles.langInfo}>
          <Text style={[styles.langName, { color: colors.textSecondary }]}>
            {lang.name}
          </Text>
          <Text style={[styles.langNative, { color: colors.textDim }]}>
            {lang.nativeName}
          </Text>
        </View>
        {selected && (
          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
            <Text style={[styles.checkMark, { color: colors.primaryText }]}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LanguageScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Language | null>(null);
  const [search, setSearch] = useState("");

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  const handleContinue = async () => {
    if (!selected) return;
    setSelectedLanguage(selected);
    router.replace("/reminder");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.arabicTitle, { color: colors.text }]}>ما لغتك الأم؟</Text>
          <Text style={[styles.title, { color: colors.textSecondary }]}>What's your native language?</Text>
          <Text style={[styles.subtitle, { color: colors.textDim }]}>
            This helps us tailor lessons to your background
          </Text>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.inputText }]}
            placeholder="Search languages..."
            placeholderTextColor={colors.placeholder}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={[styles.clearButton, { color: colors.textDim }]}>✕</Text>
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
            {
              backgroundColor: selected ? colors.borderStrong : colors.cardAlt,
              borderColor: selected ? colors.borderStrong : colors.border,
            },
          ]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.8}
        >
          <Text style={[styles.continueButtonText, { color: colors.textSecondary }]}>
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
    backgroundColor: "#000000",
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
    color: "#FFFFFF",
    writingDirection: "rtl",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E5E5E5",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1F1F1F",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#E5E5E5",
    padding: 0,
  },
  clearButton: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
    paddingLeft: 8,
  },
  list: {
    paddingBottom: 8,
  },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#1F1F1F",
  },
  langCardSelected: {
    borderColor: "#E5E5E5",
    backgroundColor: "#1A1A1A",
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
    color: "#E5E5E5",
  },
  langNameSelected: {
    color: "#FFFFFF",
  },
  langNative: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
  },
  langNativeSelected: {
    color: "#9CA3AF",
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#0A0A0A",
    fontSize: 14,
    fontWeight: "700",
  },
  continueButton: {
    backgroundColor: "#2A2A2A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  continueButtonDisabled: {
    backgroundColor: "#1A1A1A",
    borderColor: "#1F1F1F",
  },
  continueButtonText: {
    color: "#E5E5E5",
    fontSize: 16,
    fontWeight: "700",
  },
});
