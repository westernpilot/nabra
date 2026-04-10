export interface LetterTip {
  letter: string;
  name: string;
  nameAr: string;
  tip: string;
}

export const ARABIC_PRONUNCIATION_GUIDE: Record<string, LetterTip> = {
  "ا": { letter: "ا", name: "Alef", nameAr: "ألف", tip: "A long 'aa' vowel. Open your mouth wide and sustain the sound." },
  "أ": { letter: "أ", name: "Hamza on Alef", nameAr: "همزة", tip: "A glottal stop — briefly close your throat like the pause in 'uh-oh', then release with the vowel." },
  "إ": { letter: "إ", name: "Hamza below Alef", nameAr: "همزة", tip: "A glottal stop from deep in the throat followed by an 'i' vowel." },
  "ء": { letter: "ء", name: "Hamza", nameAr: "همزة", tip: "A quick stop in your throat — briefly block the airflow and release it sharply." },
  "ئ": { letter: "ئ", name: "Hamza on Ya", nameAr: "همزة", tip: "A glottal stop. Briefly block the airflow in your throat and release." },
  "ؤ": { letter: "ؤ", name: "Hamza on Waw", nameAr: "همزة", tip: "A glottal stop followed by an 'u' vowel." },
  "ب": { letter: "ب", name: "Ba", nameAr: "باء", tip: "Press both lips together and release with voice, like English 'b'." },
  "ت": { letter: "ت", name: "Ta", nameAr: "تاء", tip: "Touch your tongue tip to the ridge behind your upper teeth and release." },
  "ة": { letter: "ة", name: "Ta Marbuta", nameAr: "تاء مربوطة", tip: "Silent at the end of a word when pausing. Pronounced as a light 't' in connected speech." },
  "ث": { letter: "ث", name: "Tha", nameAr: "ثاء", tip: "Place your tongue tip between your teeth and blow air gently — like 'th' in 'think'. Keep it voiceless." },
  "ج": { letter: "ج", name: "Jim", nameAr: "جيم", tip: "Press the middle of your tongue against the hard palate — like English 'j' in 'jam'." },
  "ح": { letter: "ح", name: "Ha", nameAr: "حاء", tip: "A breathy sound from the MIDDLE of your throat. Tighten your throat muscles and push air out — deeper than English 'h'. Imagine fogging up a mirror." },
  "خ": { letter: "خ", name: "Kha", nameAr: "خاء", tip: "From the back of your throat — like clearing your throat gently, or the 'ch' in Scottish 'loch'. Air scrapes the back of the mouth." },
  "د": { letter: "د", name: "Dal", nameAr: "دال", tip: "Touch your tongue tip to the ridge behind upper teeth and release with voice, like English 'd'." },
  "ذ": { letter: "ذ", name: "Dhal", nameAr: "ذال", tip: "Place your tongue between your teeth WITH voice — like 'th' in 'this' or 'that'. NOT like 'think'." },
  "ر": { letter: "ر", name: "Ra", nameAr: "راء", tip: "Tap your tongue tip once against the gum ridge — a quick flap. Slightly rolled, heavier than English 'r'." },
  "ز": { letter: "ز", name: "Zay", nameAr: "زاي", tip: "Tongue near upper teeth with vibration, like English 'z' in 'zoo'." },
  "س": { letter: "س", name: "Sin", nameAr: "سين", tip: "Air flows over the tongue tip near upper teeth — like English 's' in 'sun'. Keep it sharp and clear." },
  "ش": { letter: "ش", name: "Shin", nameAr: "شين", tip: "Spread your tongue near the palate — like English 'sh' in 'ship'." },
  "ص": { letter: "ص", name: "Sad", nameAr: "صاد", tip: "An EMPHATIC 's'. Say 's' but pull the back of your tongue UP toward the roof of your mouth. Your mouth should feel full and the sound darker." },
  "ض": { letter: "ض", name: "Dad", nameAr: "ضاد", tip: "Unique to Arabic! Press the sides of your tongue against your upper molars and push with force. An emphatic 'd' — the 'letter of Arabic' (حرف الضاد)." },
  "ط": { letter: "ط", name: "Ta (emphatic)", nameAr: "طاء", tip: "An EMPHATIC 't'. Say 't' but raise the back of your tongue toward the roof of your mouth. Sounds heavier than regular ت." },
  "ظ": { letter: "ظ", name: "Dha (emphatic)", nameAr: "ظاء", tip: "An EMPHATIC 'th'. Tongue between teeth like ذ, but with the back of your tongue raised. Heavier, darker sound." },
  "ع": { letter: "ع", name: "Ayn", nameAr: "عين", tip: "A voiced SQUEEZE deep in your throat (pharynx). Constrict your throat and push air out WITH your voice. Like saying 'aah' while someone gently presses your throat." },
  "غ": { letter: "غ", name: "Ghayn", nameAr: "غين", tip: "A voiced gargling sound from the very back of your mouth — like the French 'r' in 'Paris'. Similar to خ but with voice." },
  "ف": { letter: "ف", name: "Fa", nameAr: "فاء", tip: "Lower lip gently touches upper teeth — like English 'f' in 'fun'." },
  "ق": { letter: "ق", name: "Qaf", nameAr: "قاف", tip: "Press the VERY back of your tongue against the soft palate (uvula area). Much deeper than 'k'. A sharp pop from the back of your mouth." },
  "ك": { letter: "ك", name: "Kaf", nameAr: "كاف", tip: "Back of tongue against the palate — like English 'k' in 'kite'." },
  "ل": { letter: "ل", name: "Lam", nameAr: "لام", tip: "Tongue tip touches the gum ridge behind upper teeth — like English 'l' in 'light'." },
  "م": { letter: "م", name: "Mim", nameAr: "ميم", tip: "Close both lips and hum through your nose — like English 'm'." },
  "ن": { letter: "ن", name: "Nun", nameAr: "نون", tip: "Tongue tip at gum ridge with air flowing through your nose — like English 'n'." },
  "ه": { letter: "ه", name: "Ha", nameAr: "هاء", tip: "A light breathy sound from deep in the throat — like English 'h' in 'hello'. Lighter than ح." },
  "و": { letter: "و", name: "Waw", nameAr: "واو", tip: "Round your lips into a small 'o' shape — like English 'w' in 'water'." },
  "ي": { letter: "ي", name: "Ya", nameAr: "ياء", tip: "Raise the middle of your tongue toward the palate — like English 'y' in 'yes'." },
  "ى": { letter: "ى", name: "Alef Maqsura", nameAr: "ألف مقصورة", tip: "Pronounced as a long 'aa' vowel at the end of a word." },
};

const IPA_TO_ARABIC: Record<string, string> = {
  "ʔ": "ء",
  "b": "ب",
  "t": "ت",
  "θ": "ث",
  "dʒ": "ج",
  "ħ": "ح",
  "x": "خ",
  "d": "د",
  "ð": "ذ",
  "r": "ر",
  "z": "ز",
  "s": "س",
  "ʃ": "ش",
  "sˤ": "ص",
  "dˤ": "ض",
  "tˤ": "ط",
  "ðˤ": "ظ",
  "ʕ": "ع",
  "ɣ": "غ",
  "f": "ف",
  "q": "ق",
  "k": "ك",
  "l": "ل",
  "m": "م",
  "n": "ن",
  "h": "ه",
  "w": "و",
  "j": "ي",
};

function stripTashkeel(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670\u0640]/g, "");
}

export function mapPhonemeToLetter(phoneme: string): string | null {
  if (ARABIC_PRONUNCIATION_GUIDE[phoneme]) return phoneme;
  if (IPA_TO_ARABIC[phoneme]) return IPA_TO_ARABIC[phoneme];
  for (const [ipa, letter] of Object.entries(IPA_TO_ARABIC)) {
    if (phoneme.includes(ipa)) return letter;
  }
  return null;
}

export interface PhonemeResult {
  phoneme: string;
  accuracyScore: number;
}

const DIFFICULT_LETTERS = new Set([
  "ح", "خ", "ع", "غ", "ق", "ص", "ض", "ط", "ظ", "ث", "ذ", "ر", "ء", "أ",
]);

export function getLetterTips(
  phonemes: PhonemeResult[],
  refWord: string
): LetterTip[] {
  const seen = new Set<string>();
  const tips: LetterTip[] = [];

  if (phonemes.length > 0) {
    for (const p of phonemes) {
      if (p.accuracyScore < 60) {
        const letter = mapPhonemeToLetter(p.phoneme);
        if (letter && !seen.has(letter) && ARABIC_PRONUNCIATION_GUIDE[letter]) {
          seen.add(letter);
          tips.push(ARABIC_PRONUNCIATION_GUIDE[letter]);
        }
      }
    }
  }

  if (tips.length === 0) {
    const letters = [...new Set(stripTashkeel(refWord))];
    for (const l of letters) {
      if (DIFFICULT_LETTERS.has(l) && ARABIC_PRONUNCIATION_GUIDE[l] && !seen.has(l)) {
        seen.add(l);
        tips.push(ARABIC_PRONUNCIATION_GUIDE[l]);
      }
    }
  }

  return tips;
}

/**
 * Maps phonemes to letters by position (phoneme index → base letter index).
 * Azure returns one phoneme per base letter for Arabic.
 */
export function getLetterTipsFromPhonemes(
  phonemes: PhonemeResult[],
  refWord: string,
  threshold: number = 80
): LetterTip[] {
  const baseLetters = [...stripTashkeel(refWord)];
  const seen = new Set<string>();
  const tips: LetterTip[] = [];

  for (let i = 0; i < phonemes.length && i < baseLetters.length; i++) {
    if (phonemes[i].accuracyScore < threshold) {
      const letter = baseLetters[i];
      if (!seen.has(letter) && ARABIC_PRONUNCIATION_GUIDE[letter]) {
        seen.add(letter);
        tips.push(ARABIC_PRONUNCIATION_GUIDE[letter]);
      }
    }
  }

  return tips;
}
