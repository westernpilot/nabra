export type ArticulationZone =
  | "lips"
  | "teeth"
  | "tongue_tip"
  | "mid_tongue"
  | "back_tongue"
  | "throat";

export const ZONE_INFO: Record<
  ArticulationZone,
  { label: string; position: number; color: string; icon: string }
> = {
  lips:        { label: "Lips",        position: 0, color: "#6366F1", icon: "👄" },
  teeth:       { label: "Teeth",       position: 1, color: "#06B6D4", icon: "🦷" },
  tongue_tip:  { label: "Tongue Tip",  position: 2, color: "#14B8A6", icon: "👅" },
  mid_tongue:  { label: "Mid Tongue",  position: 3, color: "#22C55E", icon: "👅" },
  back_tongue: { label: "Back Tongue", position: 4, color: "#F59E0B", icon: "👅" },
  throat:      { label: "Throat",      position: 5, color: "#EF4444", icon: "🫁" },
};

export interface LetterTip {
  letter: string;
  name: string;
  nameAr: string;
  tip: string;
  zone: ArticulationZone;
}

export const ARABIC_PRONUNCIATION_GUIDE: Record<string, LetterTip> = {
  "\u0627": { letter: "\u0627", name: "Alef", nameAr: "\u0623\u0644\u0641", zone: "throat", tip: "A long 'aa' vowel. Open your mouth wide and sustain the sound." },
  "\u0623": { letter: "\u0623", name: "Hamza on Alef", nameAr: "\u0647\u0645\u0632\u0629", zone: "throat", tip: "A glottal stop \u2014 briefly close your throat like the pause in 'uh-oh', then release with the vowel." },
  "\u0625": { letter: "\u0625", name: "Hamza below Alef", nameAr: "\u0647\u0645\u0632\u0629", zone: "throat", tip: "A glottal stop from deep in the throat followed by an 'i' vowel." },
  "\u0621": { letter: "\u0621", name: "Hamza", nameAr: "\u0647\u0645\u0632\u0629", zone: "throat", tip: "A quick stop in your throat \u2014 briefly block the airflow and release it sharply." },
  "\u0626": { letter: "\u0626", name: "Hamza on Ya", nameAr: "\u0647\u0645\u0632\u0629", zone: "throat", tip: "A glottal stop. Briefly block the airflow in your throat and release." },
  "\u0624": { letter: "\u0624", name: "Hamza on Waw", nameAr: "\u0647\u0645\u0632\u0629", zone: "throat", tip: "A glottal stop followed by an 'u' vowel." },
  "\u0628": { letter: "\u0628", name: "Ba", nameAr: "\u0628\u0627\u0621", zone: "lips", tip: "Press both lips together and release with voice, like English 'b'." },
  "\u062A": { letter: "\u062A", name: "Ta", nameAr: "\u062A\u0627\u0621", zone: "tongue_tip", tip: "Touch your tongue tip to the ridge behind your upper teeth and release." },
  "\u0629": { letter: "\u0629", name: "Ta Marbuta", nameAr: "\u062A\u0627\u0621 \u0645\u0631\u0628\u0648\u0637\u0629", zone: "tongue_tip", tip: "Silent at the end of a word when pausing. Pronounced as a light 't' in connected speech." },
  "\u062B": { letter: "\u062B", name: "Tha", nameAr: "\u062B\u0627\u0621", zone: "teeth", tip: "Place your tongue tip between your teeth and blow air gently \u2014 like 'th' in 'think'. Keep it voiceless." },
  "\u062C": { letter: "\u062C", name: "Jim", nameAr: "\u062C\u064A\u0645", zone: "mid_tongue", tip: "Press the middle of your tongue against the hard palate \u2014 like English 'j' in 'jam'." },
  "\u062D": { letter: "\u062D", name: "Ha", nameAr: "\u062D\u0627\u0621", zone: "throat", tip: "A breathy sound from the MIDDLE of your throat. Tighten your throat muscles and push air out \u2014 deeper than English 'h'. Imagine fogging up a mirror." },
  "\u062E": { letter: "\u062E", name: "Kha", nameAr: "\u062E\u0627\u0621", zone: "back_tongue", tip: "From the back of your throat \u2014 like clearing your throat gently, or the 'ch' in Scottish 'loch'. Air scrapes the back of the mouth." },
  "\u062F": { letter: "\u062F", name: "Dal", nameAr: "\u062F\u0627\u0644", zone: "tongue_tip", tip: "Touch your tongue tip to the ridge behind upper teeth and release with voice, like English 'd'." },
  "\u0630": { letter: "\u0630", name: "Dhal", nameAr: "\u0630\u0627\u0644", zone: "teeth", tip: "Place your tongue between your teeth WITH voice \u2014 like 'th' in 'this' or 'that'. NOT like 'think'." },
  "\u0631": { letter: "\u0631", name: "Ra", nameAr: "\u0631\u0627\u0621", zone: "tongue_tip", tip: "Tap your tongue tip once against the gum ridge \u2014 a quick flap. Slightly rolled, heavier than English 'r'." },
  "\u0632": { letter: "\u0632", name: "Zay", nameAr: "\u0632\u0627\u064A", zone: "tongue_tip", tip: "Tongue near upper teeth with vibration, like English 'z' in 'zoo'." },
  "\u0633": { letter: "\u0633", name: "Sin", nameAr: "\u0633\u064A\u0646", zone: "tongue_tip", tip: "Air flows over the tongue tip near upper teeth \u2014 like English 's' in 'sun'. Keep it sharp and clear." },
  "\u0634": { letter: "\u0634", name: "Shin", nameAr: "\u0634\u064A\u0646", zone: "mid_tongue", tip: "Spread your tongue near the palate \u2014 like English 'sh' in 'ship'." },
  "\u0635": { letter: "\u0635", name: "Sad", nameAr: "\u0635\u0627\u062F", zone: "tongue_tip", tip: "An EMPHATIC 's'. Say 's' but pull the back of your tongue UP toward the roof of your mouth. Your mouth should feel full and the sound darker." },
  "\u0636": { letter: "\u0636", name: "Dad", nameAr: "\u0636\u0627\u062F", zone: "tongue_tip", tip: "Unique to Arabic! Press the sides of your tongue against your upper molars and push with force. An emphatic 'd' \u2014 the 'letter of Arabic'." },
  "\u0637": { letter: "\u0637", name: "Ta (emphatic)", nameAr: "\u0637\u0627\u0621", zone: "tongue_tip", tip: "An EMPHATIC 't'. Say 't' but raise the back of your tongue toward the roof of your mouth. Sounds heavier than regular \u062A." },
  "\u0638": { letter: "\u0638", name: "Dha (emphatic)", nameAr: "\u0638\u0627\u0621", zone: "teeth", tip: "An EMPHATIC 'th'. Tongue between teeth like \u0630, but with the back of your tongue raised. Heavier, darker sound." },
  "\u0639": { letter: "\u0639", name: "Ayn", nameAr: "\u0639\u064A\u0646", zone: "throat", tip: "A voiced SQUEEZE deep in your throat (pharynx). Constrict your throat and push air out WITH your voice." },
  "\u063A": { letter: "\u063A", name: "Ghayn", nameAr: "\u063A\u064A\u0646", zone: "back_tongue", tip: "A voiced gargling sound from the very back of your mouth \u2014 like the French 'r' in 'Paris'. Similar to \u062E but with voice." },
  "\u0641": { letter: "\u0641", name: "Fa", nameAr: "\u0641\u0627\u0621", zone: "lips", tip: "Lower lip gently touches upper teeth \u2014 like English 'f' in 'fun'." },
  "\u0642": { letter: "\u0642", name: "Qaf", nameAr: "\u0642\u0627\u0641", zone: "back_tongue", tip: "Press the VERY back of your tongue against the soft palate (uvula area). Much deeper than 'k'. A sharp pop from the back of your mouth." },
  "\u0643": { letter: "\u0643", name: "Kaf", nameAr: "\u0643\u0627\u0641", zone: "mid_tongue", tip: "Back of tongue against the palate \u2014 like English 'k' in 'kite'." },
  "\u0644": { letter: "\u0644", name: "Lam", nameAr: "\u0644\u0627\u0645", zone: "tongue_tip", tip: "Tongue tip touches the gum ridge behind upper teeth \u2014 like English 'l' in 'light'." },
  "\u0645": { letter: "\u0645", name: "Mim", nameAr: "\u0645\u064A\u0645", zone: "lips", tip: "Close both lips and hum through your nose \u2014 like English 'm'." },
  "\u0646": { letter: "\u0646", name: "Nun", nameAr: "\u0646\u0648\u0646", zone: "tongue_tip", tip: "Tongue tip at gum ridge with air flowing through your nose \u2014 like English 'n'." },
  "\u0647": { letter: "\u0647", name: "Ha", nameAr: "\u0647\u0627\u0621", zone: "throat", tip: "A light breathy sound from deep in the throat \u2014 like English 'h' in 'hello'. Lighter than \u062D." },
  "\u0648": { letter: "\u0648", name: "Waw", nameAr: "\u0648\u0627\u0648", zone: "lips", tip: "Round your lips into a small 'o' shape \u2014 like English 'w' in 'water'." },
  "\u064A": { letter: "\u064A", name: "Ya", nameAr: "\u064A\u0627\u0621", zone: "mid_tongue", tip: "Raise the middle of your tongue toward the palate \u2014 like English 'y' in 'yes'." },
  "\u0649": { letter: "\u0649", name: "Alef Maqsura", nameAr: "\u0623\u0644\u0641 \u0645\u0642\u0635\u0648\u0631\u0629", zone: "throat", tip: "Pronounced as a long 'aa' vowel at the end of a word." },
};

const IPA_TO_ARABIC: Record<string, string> = {
  "\u0294": "\u0621",
  "b": "\u0628",
  "t": "\u062A",
  "\u03B8": "\u062B",
  "d\u0292": "\u062C",
  "\u0127": "\u062D",
  "x": "\u062E",
  "d": "\u062F",
  "\u00F0": "\u0630",
  "r": "\u0631",
  "z": "\u0632",
  "s": "\u0633",
  "\u0283": "\u0634",
  "s\u02E4": "\u0635",
  "d\u02E4": "\u0636",
  "t\u02E4": "\u0637",
  "\u00F0\u02E4": "\u0638",
  "\u0295": "\u0639",
  "\u0263": "\u063A",
  "f": "\u0641",
  "q": "\u0642",
  "k": "\u0643",
  "l": "\u0644",
  "m": "\u0645",
  "n": "\u0646",
  "h": "\u0647",
  "w": "\u0648",
  "j": "\u064A",
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
  "\u062D", "\u062E", "\u0639", "\u063A", "\u0642", "\u0635", "\u0636",
  "\u0637", "\u0638", "\u062B", "\u0630", "\u0631", "\u0621", "\u0623",
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
