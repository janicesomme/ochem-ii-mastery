// Battle map mock data. Shape is intentionally close to future Supabase fields:
//   chapter, topic, question_type, frequency_percent, wording_patterns,
//   required_moves, common_traps, practice_priority, high_yield, readiness_score.
// Once the structured question/answer tables land, this file goes away and
// the same shape is selected from Supabase.

export type FrequencySlice = {
  topic_id: string;
  label: string;
  frequency_percent: number; // 0-100, sums to ~100 per chapter
};

export type WordingGroup = {
  task: string;
  move: string;
  wording_patterns: string[];
  example_question_id?: string;
  example_label?: string;
  topic_id?: string;
};

export type TrapCard = {
  title: string;
  detail: string;
  tone: "danger" | "warn";
  topic_id?: string;
};

export type PracticePriority = {
  topic_id: string;
  label: string;
  reason: string;
  minutes?: number;
};

export type PersonalOverlay = {
  chapter_top_topic: string;
  student_weak_topic: string;
  best_next_move: string;
};

export type ChapterMap = {
  chapter_id: string;
  high_yield: boolean;
  insight: string;
  main_risk: string;
  total_questions: number;
  frequency: FrequencySlice[];
  wording_decoder: WordingGroup[];
  move_map: string[];
  common_traps: TrapCard[];
  practice_priority: PracticePriority[];
  personal_overlay?: PersonalOverlay;
  question_wording_lookup: Record<string, { task: string; move: string }>;
};

const EAS: ChapterMap = {
  chapter_id: "ch-3",
  high_yield: true,
  insight:
    "EAS is mostly directing effects + multistep synthesis. Your weakest area is electrophile generation.",
  main_risk: "Directing effects + multistep order.",
  frequency: [
    { topic_id: "t-3b", label: "Directing effects", frequency_percent: 30 },
    { topic_id: "t-3d", label: "Multistep synthesis", frequency_percent: 24 },
    { topic_id: "t-3c", label: "Friedel-Crafts", frequency_percent: 16 },
    { topic_id: "t-3a", label: "Electrophile generation", frequency_percent: 14 },
    { topic_id: "mixed-nitr", label: "Nitration / sulfonation", frequency_percent: 10 },
    { topic_id: "mixed-rev", label: "Mixed review", frequency_percent: 6 },
  ],
  wording_decoder: [
    {
      task: "Product prediction",
      move: "identify electrophile → check director → place group",
      wording_patterns: [
        "Predict the major product",
        "Draw the product after nitration",
        "What forms after EAS?",
        "Give the monosubstituted product",
      ],
    },
    {
      task: "Electrophile generation",
      move: "strong acid activates reagent → leaving group leaves → cation attacks ring",
      wording_patterns: [
        "What is the active electrophile?",
        "How is the electrophile formed?",
        "Identify the species that attacks benzene",
      ],
    },
    {
      task: "Multistep synthesis",
      move: "decide final substitution pattern → install the meta director first → then o/p director",
      wording_patterns: [
        "Synthesize X from benzene",
        "What is the correct order of steps?",
        "Show a 2-step route",
      ],
    },
    {
      task: "Reactivity / limits",
      move: "score ring activation → confirm reaction will run → otherwise: no reaction",
      wording_patterns: [
        "Predict whether the reaction proceeds",
        "Give the major product, if any",
        "Will Friedel-Crafts work on this ring?",
      ],
    },
  ],
  move_map: [
    "Identify reagent + conditions",
    "Find the active electrophile",
    "Check existing substituent(s)",
    "Choose o/p vs meta",
    "Predict product (or no reaction)",
    "Check for FC traps + reversibility",
  ],
  common_traps: [
    {
      title: "Halogens deactivate but direct o/p",
      detail:
        "F, Cl, Br, I slow EAS down — but they still send the new group to ortho/para. Don't auto-place meta.",
      tone: "warn",
    },
    {
      title: "Friedel-Crafts fails on strongly deactivated rings",
      detail:
        "Rings with -NO2, -CN, -SO3H, -NR3+, -CF3 don't undergo FC alkylation or acylation.",
      tone: "danger",
    },
    {
      title: "NO2 is a meta director",
      detail:
        "Already on the ring? The next group goes meta to it. Don't mirror it as ortho/para.",
      tone: "danger",
    },
    {
      title: "Sulfonation is reversible",
      detail:
        "Hot dilute H2SO4 can strip -SO3H off again — sometimes used as a blocking strategy.",
      tone: "warn",
    },
    {
      title: "Order matters in multistep",
      detail:
        "Putting the o/p director on first when you wanted meta gives the wrong isomer every time.",
      tone: "danger",
    },
  ],
  practice_priority: [
    {
      topic_id: "t-3a",
      label: "Electrophile generation",
      reason: "Lowest readiness — fix the foundation first.",
    },
    {
      topic_id: "t-3b",
      label: "Directing effects",
      reason: "Highest-frequency topic on the exam.",
    },
    {
      topic_id: "t-3c",
      label: "Friedel-Crafts limits",
      reason: "Trap-heavy — the 'no reaction' answers live here.",
    },
    {
      topic_id: "t-3d",
      label: "Multistep synthesis",
      reason: "Synthesizes everything above into one problem.",
    },
  ],
  question_wording_lookup: {
    "q-5": {
      task: "Product prediction",
      move: "identify electrophile → check director → place group",
    },
    "q-8": {
      task: "Electrophile generation",
      move: "strong acid activates HNO3 → water leaves → NO2⁺ attacks ring",
    },
    "q-9": {
      task: "Reactivity / limits",
      move: "score ring activation → confirm reaction will run → otherwise: no reaction",
    },
    "q-10": {
      task: "Multistep synthesis",
      move: "pick final pattern (meta) → install meta director first → then second group",
    },
  },
};

const SUB_ELIM: ChapterMap = {
  chapter_id: "ch-1",
  high_yield: true,
  insight: "Substrate class + base strength + solvent decide everything here.",
  main_risk: "Confusing SN1/E1 with SN2/E2 under polar protic conditions.",
  frequency: [
    { topic_id: "t-1a", label: "SN2 vs SN1", frequency_percent: 38 },
    { topic_id: "t-1b", label: "E1 vs E2", frequency_percent: 32 },
    { topic_id: "mix-mech", label: "Mechanism drawing", frequency_percent: 18 },
    { topic_id: "mix-stereo", label: "Stereochemistry calls", frequency_percent: 12 },
  ],
  wording_decoder: [
    {
      task: "Mechanism call",
      move: "rank substrate → check Nu/base → check solvent → pick path",
      wording_patterns: [
        "Which mechanism dominates?",
        "Predict the major product and mechanism",
        "SN1, SN2, E1, or E2?",
      ],
    },
    {
      task: "Stereochem prediction",
      move: "decide concerted vs stepwise → place inversion or racemization",
      wording_patterns: [
        "Give the stereochemistry of the product",
        "Is the product chiral?",
      ],
    },
  ],
  move_map: [
    "Classify the substrate (1°/2°/3°)",
    "Score the nucleophile / base",
    "Read the solvent (protic vs aprotic)",
    "Pick SN1 / SN2 / E1 / E2",
    "Draw the product with correct stereochem",
  ],
  common_traps: [
    { title: "Bulky base flips SN2 to E2", detail: "t-BuOK on a 2° substrate elims.", tone: "warn" },
    { title: "Polar protic kills SN2", detail: "Water/alcohols solvate the Nu — SN2 stalls.", tone: "warn" },
    { title: "3° + heat = E1", detail: "Even with a weak base, heat tips toward elim.", tone: "danger" },
  ],
  practice_priority: [
    { topic_id: "t-1a", label: "SN2 vs SN1", reason: "Foundation for every later mechanism." },
    { topic_id: "t-1b", label: "E1 vs E2", reason: "Always paired with SN questions." },
  ],
  question_wording_lookup: {
    "q-1": { task: "Mechanism call", move: "rank substrate → check Nu/base → check solvent → pick path" },
    "q-2": { task: "Mechanism call", move: "3° substrate + heat + weak base → E1" },
  },
};

const ALKENES: ChapterMap = {
  chapter_id: "ch-2",
  high_yield: true,
  insight: "Reagent choice determines regio- and stereochemistry. Memorize the table.",
  main_risk: "Forgetting peroxides flip HBr to anti-Markovnikov.",
  frequency: [
    { topic_id: "t-2a", label: "Markovnikov addition", frequency_percent: 36 },
    { topic_id: "t-2b", label: "Alkyne reactions", frequency_percent: 28 },
    { topic_id: "mix-stereo", label: "Syn vs anti addition", frequency_percent: 22 },
    { topic_id: "mix-ox", label: "Oxidative cleavage", frequency_percent: 14 },
  ],
  wording_decoder: [
    {
      task: "Product prediction",
      move: "identify reagent → call regio (Mark vs anti) → call stereo (syn vs anti)",
      wording_patterns: [
        "Give the major product",
        "Predict regio- and stereochemistry",
        "Draw the product of hydration",
      ],
    },
  ],
  move_map: [
    "Identify the reagent",
    "Set regio (Markovnikov vs anti)",
    "Set stereo (syn, anti, or none)",
    "Tautomerize if you made an enol",
  ],
  common_traps: [
    { title: "Peroxides flip HBr", detail: "Radical mechanism → anti-Markovnikov.", tone: "danger" },
    { title: "Enols tautomerize", detail: "Don't leave the answer as an enol — it becomes a ketone.", tone: "warn" },
  ],
  practice_priority: [
    { topic_id: "t-2a", label: "Markovnikov addition", reason: "Highest-frequency topic." },
    { topic_id: "t-2b", label: "Alkyne reactions", reason: "Common second question." },
  ],
  question_wording_lookup: {
    "q-3": { task: "Product prediction", move: "protonate to most stable cation → halide attacks there" },
    "q-4": { task: "Product prediction", move: "Markovnikov hydration → enol → tautomerize to ketone" },
  },
};

const ALCOHOLS: ChapterMap = {
  chapter_id: "ch-4",
  high_yield: false,
  insight: "Pick the oxidant for how far to go. Watch acid vs base on epoxides.",
  main_risk: "Over-oxidizing 1° alcohols with the wrong oxidant.",
  frequency: [
    { topic_id: "t-4a", label: "Alcohol oxidation", frequency_percent: 38 },
    { topic_id: "t-4b", label: "Epoxide opening", frequency_percent: 34 },
    { topic_id: "mix-dehyd", label: "Dehydration", frequency_percent: 18 },
    { topic_id: "mix-eth", label: "Ether synthesis", frequency_percent: 10 },
  ],
  wording_decoder: [
    {
      task: "Pick oxidation product",
      move: "classify alcohol (1°/2°/3°) → score oxidant strength → stop at the right level",
      wording_patterns: ["Give the oxidation product", "What forms with PCC?", "Final product after Jones?"],
    },
    {
      task: "Epoxide regiochemistry",
      move: "decide acid vs base → pick attack site",
      wording_patterns: [
        "Where does the Nu attack?",
        "Give the ring-opened product",
      ],
    },
  ],
  move_map: [
    "Classify the alcohol or epoxide",
    "Check conditions (acid vs base, mild vs harsh)",
    "Pick attack site or stopping point",
    "Draw the product with correct stereo",
  ],
  common_traps: [
    { title: "PCC stops at aldehyde", detail: "Jones / KMnO4 go all the way to acid.", tone: "warn" },
    { title: "Acid vs base flips epoxide site", detail: "Base → less substituted; acid → more substituted.", tone: "danger" },
  ],
  practice_priority: [
    { topic_id: "t-4b", label: "Epoxide opening", reason: "Most missed — acid/base flip trips students." },
    { topic_id: "t-4a", label: "Alcohol oxidation", reason: "Reagent-recognition reps." },
  ],
  question_wording_lookup: {
    "q-6": { task: "Pick oxidation product", move: "1° alcohol + PCC → stop at aldehyde" },
    "q-7": { task: "Epoxide regiochemistry", move: "base conditions → SN2 attack at less hindered C" },
  },
};

const CARBONYL: ChapterMap = {
  chapter_id: "ch-5",
  high_yield: true,
  insight: "Most carbonyl problems are nucleophilic addition with a workup step.",
  main_risk: "Stopping at the alkoxide instead of protonating to the alcohol.",
  frequency: [
    { topic_id: "t-5a", label: "Nucleophilic addition", frequency_percent: 42 },
    { topic_id: "t-5b", label: "Acetal formation", frequency_percent: 24 },
    { topic_id: "mix-enol", label: "Enol / enolate chemistry", frequency_percent: 20 },
    { topic_id: "mix-imine", label: "Imine / enamine", frequency_percent: 14 },
  ],
  wording_decoder: [
    {
      task: "Predict addition product",
      move: "Nu attacks C=O → alkoxide → protonate on workup",
      wording_patterns: ["Give the final product", "Draw the product after H3O+ workup"],
    },
  ],
  move_map: [
    "Identify the carbonyl + nucleophile",
    "Attack the carbonyl carbon",
    "Tetrahedral alkoxide intermediate",
    "Protonate on workup",
  ],
  common_traps: [
    { title: "Forget the workup", detail: "Alkoxide isn't the final answer — H3O+ gives the alcohol.", tone: "warn" },
    { title: "Acetal needs anhydrous", detail: "Water present? You get back the carbonyl.", tone: "warn" },
  ],
  practice_priority: [
    { topic_id: "t-5a", label: "Nucleophilic addition", reason: "Backbone of the chapter." },
    { topic_id: "t-5b", label: "Acetal formation", reason: "Frequent multistep step." },
  ],
  question_wording_lookup: {
    "q-11": { task: "Predict addition product", move: "Grignard attacks C=O → alkoxide → H3O+ workup → 3° alcohol" },
  },
};

const ACYL: ChapterMap = {
  chapter_id: "ch-6",
  high_yield: true,
  insight: "It's a reactivity ladder. Knowing the order solves most questions.",
  main_risk: "Inverting amide vs ester reactivity.",
  frequency: [
    { topic_id: "t-6a", label: "Acyl substitution reactivity", frequency_percent: 40 },
    { topic_id: "t-6b", label: "Ester / amide hydrolysis", frequency_percent: 30 },
    { topic_id: "mix-inter", label: "Interconversion", frequency_percent: 20 },
    { topic_id: "mix-mech", label: "Mechanism drawing", frequency_percent: 10 },
  ],
  wording_decoder: [
    {
      task: "Rank reactivity",
      move: "score leaving group → score resonance donation into C=O → rank",
      wording_patterns: ["Rank from most to least reactive", "Which reacts fastest with a Nu?"],
    },
  ],
  move_map: [
    "Identify the carbonyl derivative",
    "Place it on the reactivity ladder",
    "Confirm the Nu can step down the ladder",
    "Predict product (or no reaction if going up)",
  ],
  common_traps: [
    { title: "Amides are the dead end", detail: "Can't easily convert amides to other derivatives.", tone: "danger" },
    { title: "Going UP the ladder needs special reagents", detail: "SOCl2 is the usual workaround.", tone: "warn" },
  ],
  practice_priority: [
    { topic_id: "t-6a", label: "Acyl substitution reactivity", reason: "Lowest readiness, highest frequency." },
    { topic_id: "t-6b", label: "Ester / amide hydrolysis", reason: "Common in multistep questions." },
  ],
  question_wording_lookup: {
    "q-12": { task: "Rank reactivity", move: "score LG quality → score resonance donation → rank" },
  },
};

const ALL: ChapterMap[] = [SUB_ELIM, ALKENES, EAS, ALCOHOLS, CARBONYL, ACYL];

export function getChapterMap(chapterId: string): ChapterMap | null {
  return ALL.find((m) => m.chapter_id === chapterId) ?? null;
}

export function getQuestionDecoder(
  questionId: string,
): { chapter_id: string; task: string; move: string } | null {
  for (const m of ALL) {
    const hit = m.question_wording_lookup[questionId];
    if (hit) return { chapter_id: m.chapter_id, ...hit };
  }
  return null;
}

// Dashboard insight card — points at the highest-leverage chapter.
export function getTodaysChapterInsight(): {
  chapter_id: string;
  insight: string;
} {
  return { chapter_id: EAS.chapter_id, insight: EAS.insight };
}
