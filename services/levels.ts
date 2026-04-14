import AsyncStorage from "@react-native-async-storage/async-storage";

const LEVEL_KEY = "nabra_user_level";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export const LEVEL_ORDER: DifficultyLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

export const LEVEL_INFO: Record<
  DifficultyLevel,
  { label: string; labelAr: string; color: string; description: string }
> = {
  beginner: {
    label: "Beginner",
    labelAr: "مبتدئ",
    color: "#22C55E",
    description: "Simple everyday words and short phrases",
  },
  intermediate: {
    label: "Intermediate",
    labelAr: "متوسط",
    color: "#3B82F6",
    description: "Common sentences with basic grammar",
  },
  advanced: {
    label: "Advanced",
    labelAr: "متقدم",
    color: "#F59E0B",
    description: "Complex sentences with difficult letters",
  },
  expert: {
    label: "Expert",
    labelAr: "خبير",
    color: "#EF4444",
    description: "Literary Arabic, tongue twisters, and rare sounds",
  },
};

export const SENTENCE_BANK: Record<DifficultyLevel, string[][]> = {
  beginner: [
    [
      "أُحِبُّ القِرَاءَةَ كَثِيرًا",
      "الطَّقْسُ جَمِيلٌ اليَوْمَ",
      "ذَهَبْتُ إِلَى المَدْرَسَةِ صَبَاحًا",
    ],
    [
      "أَنَا طَالِبٌ جَدِيدٌ",
      "هَذَا كِتَابٌ كَبِيرٌ",
      "أُرِيدُ مَاءً بَارِدًا",
    ],
    [
      "السَّلَامُ عَلَيْكُمْ",
      "كَيْفَ حَالُكَ اليَوْمَ",
      "شُكْرًا جَزِيلًا لَكَ",
    ],
  ],
  intermediate: [
    [
      "سَافَرْتُ إِلَى مِصْرَ فِي الصَّيْفِ المَاضِي",
      "يَجِبُ أَنْ نَحْتَرِمَ الكِبَارَ وَنُسَاعِدَهُمْ",
      "المُعَلِّمُ يَشْرَحُ الدَّرْسَ بِوُضُوحٍ",
    ],
    [
      "تَعَلَّمْتُ اللُّغَةَ العَرَبِيَّةَ فِي الجَامِعَةِ",
      "الرِّيَاضَةُ مُفِيدَةٌ لِلصِّحَّةِ وَالجِسْمِ",
      "قَرَأْتُ قِصَّةً مُمْتِعَةً قَبْلَ النَّوْمِ",
    ],
    [
      "يَعْمَلُ أَبِي فِي المُسْتَشْفَى كُلَّ يَوْمٍ",
      "الحَدِيقَةُ مَلِيئَةٌ بِالأَزْهَارِ الجَمِيلَةِ",
      "نَحْنُ نُحِبُّ السَّفَرَ وَاكْتِشَافَ أَمَاكِنَ جَدِيدَةٍ",
    ],
  ],
  advanced: [
    [
      "اسْتَطَاعَ الطَّبِيبُ تَشْخِيصَ المَرَضِ بِدِقَّةٍ مُتَنَاهِيَةٍ",
      "يَتَطَلَّبُ النَّجَاحُ صَبْرًا وَاجْتِهَادًا مُسْتَمِرًّا",
      "الثَّقَافَةُ العَرَبِيَّةُ غَنِيَّةٌ بِالتُّرَاثِ وَالتَّارِيخِ",
    ],
    [
      "يَنْبَغِي لِلْإِنْسَانِ أَنْ يَسْعَى لِتَطْوِيرِ ذَاتِهِ",
      "تُعَدُّ الخُطَبُ البَلِيغَةُ مِنْ أَرْقَى فُنُونِ الأَدَبِ",
      "الاقْتِصَادُ العَالَمِيُّ يَمُرُّ بِتَحَوُّلَاتٍ جَذْرِيَّةٍ",
    ],
    [
      "الضَّمِيرُ الحَيُّ يَمْنَعُ صَاحِبَهُ مِنَ الظُّلْمِ",
      "أَعْطَتْنَا الحَضَارَةُ العَرَبِيَّةُ عُلُومًا عَظِيمَةً",
      "يُسْهِمُ التَّعْلِيمُ فِي بِنَاءِ مُجْتَمَعٍ مُتَحَضِّرٍ",
    ],
  ],
  expert: [
    [
      "خَيْرُ الكَلَامِ مَا قَلَّ وَدَلَّ وَلَمْ يُطِلْ فَيُمَلَّ",
      "أَصْعَبُ شَيْءٍ فِي الحَيَاةِ أَنْ تَعْرِفَ نَفْسَكَ وَأَسْهَلُ شَيْءٍ أَنْ تَنْصَحَ غَيْرَكَ",
      "لِكُلِّ دَاءٍ دَوَاءٌ يُسْتَطَبُّ بِهِ إِلَّا الحَمَاقَةَ أَعْيَتْ مَنْ يُدَاوِيهَا",
    ],
    [
      "ظَلَّ الخَطِيبُ يَتَحَدَّثُ بِفَصَاحَةٍ عَنِ الضَّرُورَةِ القُصْوَى",
      "يَسْتَخْدِمُ العُلَمَاءُ التِّقْنِيَّاتِ الحَدِيثَةَ لِاسْتِكْشَافِ الفَضَاءِ",
      "تَتَمَيَّزُ المُدُنُ السَّاحِلِيَّةُ بِجَمَالِ الطَّبِيعَةِ وَاعْتِدَالِ المُنَاخِ",
    ],
    [
      "أَثْبَتَتِ الدِّرَاسَاتُ أَنَّ القِرَاءَةَ تُقَوِّي الذَّاكِرَةَ وَالتَّرْكِيزَ",
      "يُعَدُّ الشِّعْرُ العَرَبِيُّ مِنْ أَعْرَقِ الفُنُونِ الأَدَبِيَّةِ فِي التَّارِيخِ",
      "يَحْتَاجُ المُخْتَرِعُ إِلَى خَيَالٍ وَاسِعٍ وَصَبْرٍ طَوِيلٍ لِتَحْقِيقِ أَهْدَافِهِ",
    ],
  ],
};

// Get a random set of 3 sentences for the given level
export function getSentencesForLevel(level: DifficultyLevel): string[] {
  const sets = SENTENCE_BANK[level];
  const randomIndex = Math.floor(Math.random() * sets.length);
  return sets[randomIndex];
}

export function calculateNewLevel(
  currentLevel: DifficultyLevel,
  score: number
): { newLevel: DifficultyLevel; changed: boolean; direction: "up" | "down" | "same" } {
  const currentIndex = LEVEL_ORDER.indexOf(currentLevel);

  if (score >= 80 && currentIndex < LEVEL_ORDER.length - 1) {
    return {
      newLevel: LEVEL_ORDER[currentIndex + 1],
      changed: true,
      direction: "up",
    };
  }

  if (score < 40 && currentIndex > 0) {
    return {
      newLevel: LEVEL_ORDER[currentIndex - 1],
      changed: true,
      direction: "down",
    };
  }

  return { newLevel: currentLevel, changed: false, direction: "same" };
}

export async function getUserLevel(): Promise<DifficultyLevel> {
  const raw = await AsyncStorage.getItem(LEVEL_KEY);
  if (raw && LEVEL_ORDER.includes(raw as DifficultyLevel)) {
    return raw as DifficultyLevel;
  }
  return "beginner";
}

export async function setUserLevel(level: DifficultyLevel): Promise<void> {
  await AsyncStorage.setItem(LEVEL_KEY, level);
}
