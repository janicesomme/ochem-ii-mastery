import type {
  Answer,
  Chapter,
  Hint,
  Question,
  QuickSheet,
  Step,
  Topic,
} from "./queries-types";

export const chapters: Chapter[] = [
  {
    id: "ch-1",
    number: 1,
    title: "Substitution & Elimination",
    description: "SN1, SN2, E1, E2 — pick the right mechanism every time.",
    sort_order: 1,
  },
  {
    id: "ch-2",
    number: 2,
    title: "Alkenes & Alkynes",
    description: "Addition reactions, Markovnikov, and stereochemistry.",
    sort_order: 2,
  },
  {
    id: "ch-3",
    number: 3,
    title: "Aromatic Chemistry",
    description: "EAS, directors, and multi-step aromatic synthesis.",
    sort_order: 3,
  },
  {
    id: "ch-4",
    number: 4,
    title: "Alcohols, Ethers & Epoxides",
    description: "Oxidation, dehydration, and epoxide ring-opening.",
    sort_order: 4,
  },
];

export const topics: Topic[] = [
  { id: "t-1a", chapter_id: "ch-1", title: "SN2 vs SN1", description: null, sort_order: 1 },
  { id: "t-1b", chapter_id: "ch-1", title: "E1 vs E2", description: null, sort_order: 2 },
  { id: "t-2a", chapter_id: "ch-2", title: "Markovnikov addition", description: null, sort_order: 1 },
  { id: "t-2b", chapter_id: "ch-2", title: "Alkyne reactions", description: null, sort_order: 2 },
  { id: "t-3a", chapter_id: "ch-3", title: "EAS directors", description: null, sort_order: 1 },
  { id: "t-4a", chapter_id: "ch-4", title: "Alcohol oxidation", description: null, sort_order: 1 },
  { id: "t-4b", chapter_id: "ch-4", title: "Epoxide opening", description: null, sort_order: 2 },
];

type FullQuestion = {
  q: Question;
  hints: Hint[];
  steps: Step[];
  answer: Answer;
};

const make = (
  id: string,
  chapter_id: string,
  topic_id: string,
  title: string,
  prompt: string,
  question_type: string,
  difficulty: "easy" | "medium" | "hard",
  sort_order: number,
  hints: string[],
  checklist: string,
  steps: string[],
  answer: string,
  memory_trick: string,
  common_trap: string,
): FullQuestion => ({
  q: {
    id,
    chapter_id,
    topic_id,
    title,
    prompt,
    question_type,
    difficulty,
    memory_trick,
    common_trap,
    sort_order,
  },
  hints: [
    ...hints.map((content, i) => ({
      id: `${id}-h${i + 1}`,
      question_id: id,
      hint_level: i + 1,
      kind: "hint" as const,
      content,
    })),
    {
      id: `${id}-cl`,
      question_id: id,
      hint_level: hints.length + 1,
      kind: "checklist" as const,
      content: checklist,
    },
  ],
  steps: steps.map((content, i) => ({
    id: `${id}-s${i + 1}`,
    question_id: id,
    step_number: i + 1,
    content,
  })),
  answer: { id: `${id}-a`, question_id: id, content: answer },
});

export const fullQuestions: FullQuestion[] = [
  make(
    "q-1",
    "ch-1",
    "t-1a",
    "Predict the substitution product",
    "2-bromobutane is treated with NaCN in DMSO. Predict the major product and mechanism.",
    "mechanism",
    "easy",
    1,
    [
      "DMSO is a polar aprotic solvent — what does that favor?",
      "CN⁻ is a strong nucleophile and a weak base.",
    ],
    "✓ Substrate is 2°\n✓ Nu is strong\n✓ Solvent is polar aprotic\n✓ Inversion at carbon",
    [
      "Identify substrate class: 2° alkyl halide.",
      "Identify nucleophile: CN⁻ — strong Nu, weak base → favors SN2 over E2.",
      "Polar aprotic solvent boosts SN2.",
      "Backside attack inverts configuration at C2.",
    ],
    "2-cyanobutane via SN2 with inversion of configuration at C2.",
    "Strong Nu + polar aprotic = SN2 superhighway.",
    "Don't confuse DMSO (aprotic) with EtOH (protic) — they push to opposite mechanisms.",
  ),
  make(
    "q-2",
    "ch-1",
    "t-1b",
    "E1 vs E2 with tert-butyl bromide",
    "tert-Butyl bromide is heated in ethanol. Which elimination pathway dominates and what is the product?",
    "mechanism",
    "medium",
    2,
    [
      "3° substrate + weak base/nucleophile + protic solvent — which mechanism?",
      "Carbocation forms first; then a base removes a β-H.",
    ],
    "✓ 3° substrate\n✓ Weak base (EtOH)\n✓ Heat\n✓ Zaitsev product",
    [
      "tert-butyl bromide is 3° → SN2/E2 disfavored.",
      "EtOH is weak base/Nu and protic → SN1/E1.",
      "Heat shifts toward elimination (E1).",
      "Loss of β-H gives isobutylene.",
    ],
    "2-methylpropene (isobutylene) via E1.",
    "3° + heat + weak base = E1 every time.",
    "Don't draw E2 here — there's no strong base.",
  ),
  make(
    "q-3",
    "ch-2",
    "t-2a",
    "Markovnikov addition of HBr",
    "Propene reacts with HBr (no peroxides). Give the major product and explain regiochemistry.",
    "product",
    "easy",
    1,
    [
      "Where does H+ add first? Think carbocation stability.",
      "Markovnikov: H goes to the carbon with more H's.",
    ],
    "✓ Identify both possible carbocations\n✓ Pick the more stable one\n✓ Br adds there",
    [
      "H+ protonates the alkene to form a carbocation.",
      "Secondary cation at C2 is more stable than primary at C1.",
      "Br⁻ attacks the 2° carbocation.",
    ],
    "2-bromopropane.",
    "H to the H-rich carbon; halogen to the carbon that can hold a + charge best.",
    "Peroxides flip this to anti-Markovnikov — read the conditions carefully.",
  ),
  make(
    "q-4",
    "ch-2",
    "t-2b",
    "Hydration of a terminal alkyne",
    "1-Hexyne + H2SO4, HgSO4, H2O. Give the final product.",
    "product",
    "medium",
    2,
    [
      "Acid-catalyzed alkyne hydration gives a Markovnikov enol.",
      "Enols tautomerize to the more stable carbonyl form.",
    ],
    "✓ Markovnikov orientation\n✓ Enol intermediate\n✓ Tautomerize to ketone",
    [
      "Add H–OH across triple bond, Markovnikov.",
      "Enol forms with OH on the internal carbon.",
      "Keto-enol tautomerization gives 2-hexanone.",
    ],
    "2-hexanone.",
    "Terminal alkyne + Hg²⁺ → methyl ketone.",
    "Don't leave the answer as the enol — it tautomerizes.",
  ),
  make(
    "q-5",
    "ch-3",
    "t-3a",
    "EAS director combo",
    "Toluene is nitrated, then brominated. Where does Br end up?",
    "synthesis",
    "medium",
    1,
    [
      "Methyl is an o/p director and activator.",
      "After nitration, you have two groups directing.",
    ],
    "✓ -CH3 is o/p activator\n✓ -NO2 is m deactivator\n✓ Combined directing effect",
    [
      "Nitration of toluene → para-nitrotoluene (major).",
      "On p-nitrotoluene, -CH3 directs o/p, -NO2 directs meta.",
      "Their directing effects reinforce at positions ortho to CH3.",
      "Bromine adds ortho to the methyl group.",
    ],
    "2-bromo-4-nitrotoluene (Br ortho to CH3).",
    "Activator wins the directing fight; deactivator just reinforces.",
    "Don't put Br meta to NO2 only — check what CH3 wants too.",
  ),
  make(
    "q-6",
    "ch-4",
    "t-4a",
    "Pick the oxidation product",
    "1-Butanol + PCC in CH2Cl2. Final product?",
    "product",
    "easy",
    1,
    [
      "PCC is a mild oxidant.",
      "Mild oxidant stops at the aldehyde for 1° alcohols.",
    ],
    "✓ 1° alcohol\n✓ PCC = mild\n✓ Stops at aldehyde",
    [
      "1-butanol is a primary alcohol.",
      "PCC is mild — no water present.",
      "Oxidation stops at the aldehyde.",
    ],
    "Butanal.",
    "PCC = Partial; Jones/KMnO4 = all the way to acid.",
    "Don't go to butanoic acid — PCC won't take you there.",
  ),
  make(
    "q-7",
    "ch-4",
    "t-4b",
    "Epoxide opening under base",
    "2,2-dimethyloxirane + NaOMe / MeOH. Where does the nucleophile attack?",
    "mechanism",
    "hard",
    2,
    [
      "Base-catalyzed = SN2-like, attacks the less hindered carbon.",
      "Acid-catalyzed would attack the more substituted carbon.",
    ],
    "✓ Conditions (acid vs base)\n✓ Steric preference under base\n✓ Inversion at attacked carbon",
    [
      "Base conditions → SN2-like attack.",
      "Less hindered carbon of the epoxide is preferred.",
      "MeO⁻ attacks the unsubstituted CH2.",
      "Ring opens to give 1-methoxy-2-methylpropan-2-ol.",
    ],
    "1-methoxy-2-methylpropan-2-ol.",
    "Base = less-substituted carbon. Acid = more-substituted carbon.",
    "Don't reverse the regiochemistry — base/acid conditions flip the site.",
  ),
];

export const questions: Question[] = fullQuestions.map((f) => f.q);

export const quickSheets: QuickSheet[] = [
  {
    id: "qs-1",
    chapter_id: "ch-1",
    title: "SN1 / SN2 / E1 / E2 decision tree",
    summary: "How to pick the right mechanism in 10 seconds.",
    content: `Substrate first:
• Methyl / 1° → SN2 (or E2 with strong bulky base)
• 2° → depends on Nu/Base + solvent
• 3° → SN1 / E1 (or E2 with strong base)

Then the reagent:
• Strong Nu, weak base → SN2
• Strong, bulky base → E2
• Weak Nu/base + protic solvent → SN1/E1 (heat favors E1)

Solvent:
• Polar aprotic (DMSO, DMF, acetone) → SN2
• Polar protic (H2O, ROH) → SN1/E1`,
    sort_order: 1,
  },
  {
    id: "qs-2",
    chapter_id: "ch-2",
    title: "Alkene addition cheatsheet",
    summary: "Markovnikov vs anti-Markovnikov + stereochemistry.",
    content: `HBr alone → Markovnikov, no stereo control
HBr + peroxides → anti-Markovnikov (radical)
H2O / H+ → Markovnikov alcohol
BH3 then H2O2/OH- → anti-Markovnikov, syn addition
Br2 → anti-addition (vicinal dihalide)
Br2 / H2O → halohydrin, Markovnikov OH
OsO4 → syn diol
mCPBA → epoxide`,
    sort_order: 2,
  },
  {
    id: "qs-3",
    chapter_id: "ch-3",
    title: "EAS directors at a glance",
    summary: "Who's o/p, who's meta, who activates.",
    content: `Strong activators (o/p): -NH2, -NHR, -OH, -OR
Weak activators (o/p): -R (alkyl), -Ar
Halogens (o/p, deactivators): -F, -Cl, -Br, -I
Moderate deactivators (meta): -C=O, -COOH, -SO3H, -CN
Strong deactivators (meta): -NO2, -NR3+, -CF3`,
    sort_order: 3,
  },
  {
    id: "qs-4",
    chapter_id: "ch-4",
    title: "Alcohol oxidation map",
    summary: "How far does each oxidant take you?",
    content: `1° alcohol:
• PCC, DMP, Swern → aldehyde
• Jones (CrO3/H2SO4), KMnO4 → carboxylic acid

2° alcohol → ketone (any oxidant)
3° alcohol → no reaction (no α-H to lose)`,
    sort_order: 4,
  },
];

// simple sync helpers
export function mockChapter(id: string): Chapter | null {
  return chapters.find((c) => c.id === id) ?? null;
}
export function mockTopicsByChapter(id: string): Topic[] {
  return topics.filter((t) => t.chapter_id === id);
}
export function mockQuestionsByChapter(id: string): Question[] {
  return questions.filter((q) => q.chapter_id === id);
}
export function mockQuestion(id: string): FullQuestion | null {
  return fullQuestions.find((f) => f.q.id === id) ?? null;
}
export function mockQuickSheet(id: string): QuickSheet | null {
  return quickSheets.find((s) => s.id === id) ?? null;
}
