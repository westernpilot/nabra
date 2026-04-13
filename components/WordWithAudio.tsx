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
    backgroundColor: "#2A1215",
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
    color: "#EF4444",
    writingDirection: "rtl",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1F1F1F",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonActive: {
    backgroundColor: "#3A1519",
  },
  playIcon: {
    fontSize: 18,
  },
});
