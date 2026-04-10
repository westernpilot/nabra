import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import * as Speech from "expo-speech";
import { useCallback, useState } from "react";

interface WordWithAudioProps {
  word: string;
}

export default function WordWithAudio({ word }: WordWithAudioProps) {
  const [playing, setPlaying] = useState(false);

  const speak = useCallback(() => {
    setPlaying(true);
    Speech.speak(word, {
      language: "ar",
      rate: 0.75,
      onDone: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  }, [word]);

  return (
    <View style={styles.container}>
      <Text style={styles.word}>{word}</Text>
      <TouchableOpacity
        style={[styles.playButton, playing && styles.playButtonActive]}
        onPress={speak}
        activeOpacity={0.7}
        disabled={playing}
      >
        <Text style={styles.playIcon}>🔊</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 4,
    marginHorizontal: 4,
    gap: 8,
  },
  word: {
    fontSize: 20,
    fontWeight: "600",
    color: "#DC2626",
    writingDirection: "rtl",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playButtonActive: {
    backgroundColor: "#FECACA",
  },
  playIcon: {
    fontSize: 18,
  },
});
