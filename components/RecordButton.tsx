import { useState, useRef, useCallback } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Audio } from "expo-av";

const WAVE_BAR_COUNT = 16;

// Android MediaRecorder can't actually produce PCM WAV, so we record OGG Opus
// (outputFormat 11 = OGG, audioEncoder 7 = OPUS) which Azure Speech accepts
// natively. iOS sticks with true PCM WAV.
const WAV_RECORDING_OPTIONS: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: ".ogg",
    outputFormat: 11,
    audioEncoder: 7,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 32000,
  },
  ios: {
    extension: ".wav",
    outputFormat: 1819304813,
    audioQuality: 96,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 256000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

interface RecordButtonProps {
  onRecordingComplete: (uri: string) => void;
  disabled?: boolean;
}

export default function RecordButton({
  onRecordingComplete,
  disabled = false,
}: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [waveform, setWaveform] = useState<number[]>(
    new Array(WAVE_BAR_COUNT).fill(0)
  );
  const meterInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startMetering = useCallback((recording: Audio.Recording) => {
    meterInterval.current = setInterval(async () => {
      try {
        const status = await recording.getStatusAsync();
        if (status.isRecording && status.metering != null) {
          const normalized = Math.min(
            1,
            Math.max(0, (status.metering + 50) / 50)
          );
          setWaveform((prev) => [...prev.slice(1), normalized]);
        }
      } catch {}
    }, 80);
  }, []);

  const stopMetering = useCallback(() => {
    if (meterInterval.current) {
      clearInterval(meterInterval.current);
      meterInterval.current = null;
    }
    setWaveform(new Array(WAVE_BAR_COUNT).fill(0));
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        WAV_RECORDING_OPTIONS
      );
      recordingRef.current = recording;
      setIsRecording(true);
      startMetering(recording);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      stopMetering();
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      recordingRef.current = null;
      setIsRecording(false);

      if (uri) {
        console.log("Recording saved:", uri);
        onRecordingComplete(uri);
      }
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Waveform */}
      <View style={styles.waveContainer}>
        {waveform.map((level, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              {
                height: 4 + level * 32,
                backgroundColor: isRecording
                  ? `rgba(239, 68, 68, ${0.4 + level * 0.6})`
                  : "#2A2A2A",
              },
            ]}
          />
        ))}
      </View>

      {/* Record button */}
      <TouchableOpacity
        style={[
          styles.button,
          isRecording && styles.buttonRecording,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View style={isRecording ? styles.stopIcon : styles.micIcon} />
      </TouchableOpacity>

      <Text style={styles.label}>
        {disabled
          ? "Recorded ✓"
          : isRecording
          ? "Tap to stop"
          : "Tap to record"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    gap: 3,
    marginBottom: 16,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    minHeight: 4,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#3A3A3A",
  },
  buttonRecording: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  buttonDisabled: {
    backgroundColor: "#1A1A1A",
    borderColor: "#2A2A2A",
  },
  micIcon: {
    width: 20,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  stopIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
});
