import { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION } from "./config";
import {
  type PhonemeResult,
  type LetterTip,
  getLetterTipsFromPhonemes,
} from "./arabicGuide";

export interface WordResult {
  word: string;
  accuracyScore: number;
  errorType: string;
  phonemes: PhonemeResult[];
}

export interface SentenceResult {
  sentence: string;
  score: number;
  words: WordResult[];
  mistakes: string[];
  letterTips: LetterTip[];
}

export interface AssessmentResult {
  score: number;
  sentenceResults: SentenceResult[];
  feedback: string;
  level?: string;
}

let _sentences: string[] = [];
let _recordings: string[] = [];

export function storeSentences(sentences: string[]) {
  _sentences = [...sentences];
}

export function storeRecordings(uris: string[]) {
  _recordings = [...uris];
}

export function getStoredSentences(): string[] {
  return _sentences;
}

function utf8ToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

async function assessSentence(
  audioUri: string,
  referenceText: string
): Promise<SentenceResult> {
  const pronConfig = {
    ReferenceText: referenceText,
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    Dimension: "Comprehensive",
  };

  const url = `https://${AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=ar-SA&format=detailed`;

  try {
    console.log("Assessing audio:", audioUri);

    const fileResponse = await fetch(audioUri);
    const blob = await fileResponse.blob();
    console.log("Audio blob size:", blob.size);

    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
        "Pronunciation-Assessment": utf8ToBase64(
          JSON.stringify(pronConfig)
        ),
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        Accept: "application/json",
      },
      body: blob,
    });

    console.log("Azure response status:", result.status);
    const data = await result.json();
    console.log("Azure response:", JSON.stringify(data, null, 2));

    if (data.RecognitionStatus !== "Success") {
      console.warn("Recognition failed:", data.RecognitionStatus);
      return {
        sentence: referenceText,
        score: 0,
        words: [],
        mistakes: referenceText.split(" "),
        letterTips: [],
      };
    }

    const best = data.NBest?.[0];
    const refWords = referenceText.split(" ");

    const azureWords: WordResult[] = (best?.Words || []).map((w: any) => ({
      word: w.Word,
      accuracyScore:
        w.AccuracyScore ??
        w.PronunciationAssessment?.AccuracyScore ??
        0,
      errorType:
        w.ErrorType ??
        w.PronunciationAssessment?.ErrorType ??
        "None",
      phonemes: (w.Phonemes || []).map((p: any) => ({
        phoneme: p.Phoneme,
        accuracyScore:
          p.AccuracyScore ??
          p.PronunciationAssessment?.AccuracyScore ??
          0,
      })),
    }));

    const mistakes: string[] = [];

    for (let i = 0; i < azureWords.length && i < refWords.length; i++) {
      const w = azureWords[i];
      const hasWordError = w.errorType !== "None" || w.accuracyScore < 60;
      const hasWeakPhoneme = w.phonemes.some((p) => p.accuracyScore < 80);
      if (hasWordError || hasWeakPhoneme) {
        mistakes.push(refWords[i]);
      }
    }
    for (let i = azureWords.length; i < refWords.length; i++) {
      mistakes.push(refWords[i]);
    }

    // Scan ALL words for weak phonemes, not just mistakes
    const allLetterTips: LetterTip[] = [];
    for (let i = 0; i < azureWords.length && i < refWords.length; i++) {
      const tips = getLetterTipsFromPhonemes(
        azureWords[i].phonemes,
        refWords[i],
        80
      );
      allLetterTips.push(...tips);
    }

    const uniqueTips = allLetterTips.filter(
      (tip, i, arr) => arr.findIndex((t) => t.letter === tip.letter) === i
    );

    return {
      sentence: referenceText,
      score: Math.round(
        best?.PronScore ?? best?.PronunciationAssessment?.PronScore ?? 0
      ),
      words: azureWords,
      mistakes,
      letterTips: uniqueTips,
    };
  } catch (error) {
    console.error("Assessment failed:", error);
    return {
      sentence: referenceText,
      score: 0,
      words: [],
      mistakes: [],
      letterTips: [],
    };
  }
}

export async function assessSingleWord(
  audioUri: string,
  word: string
): Promise<SentenceResult> {
  return assessSentence(audioUri, word);
}

export async function runAssessment(): Promise<AssessmentResult> {
  const sentenceResults: SentenceResult[] = [];
  const sentences = _sentences.length > 0 ? _sentences : [
    "أُحِبُّ القِرَاءَةَ كَثِيرًا",
    "الطَّقْسُ جَمِيلٌ اليَوْمَ",
    "ذَهَبْتُ إِلَى المَدْرَسَةِ صَبَاحًا",
  ];

  for (let i = 0; i < sentences.length; i++) {
    if (_recordings[i]) {
      const result = await assessSentence(_recordings[i], sentences[i]);
      sentenceResults.push(result);
    } else {
      sentenceResults.push({
        sentence: sentences[i],
        score: 0,
        words: [],
        mistakes: [],
        letterTips: [],
      });
    }
  }

  const overallScore = Math.round(
    sentenceResults.reduce((sum, r) => sum + r.score, 0) /
      sentenceResults.length
  );

  let feedback: string;
  if (overallScore >= 80) {
    feedback =
      "Excellent pronunciation! Keep practicing to maintain your skills.";
  } else if (overallScore >= 60) {
    feedback =
      "Good effort! Focus on the highlighted words and practice them individually.";
  } else if (overallScore > 0) {
    feedback =
      "Keep practicing! Try speaking more slowly and pay attention to each vowel mark (tashkeel).";
  } else {
    feedback =
      "We couldn't assess your pronunciation. Make sure to speak clearly into the microphone.";
  }

  return {
    score: overallScore,
    sentenceResults,
    feedback,
  };
}
