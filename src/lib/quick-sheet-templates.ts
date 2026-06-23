// Extended quick-sheet templates and deep-review content (local mock only).

export type QuickSheetTemplate = {
  id: string; // matches QuickSheet.id when applicable
  chapter_id: string;
  topic_id?: string;
  topic_label: string;
  title: string;
  purpose: string;
  reviewBeforeSprint: boolean;
  rules: string[];
  traps: string[];
  example: { setup: string; answer: string };
  relatedQuestionTypes: string[];
  links: {
    fullExplanation?: string; // placeholder
    sourceNotes?: string; // placeholder
    sourceReactionSummary?: string; // placeholder
  };
};

export const quickSheetTemplates: QuickSheetTemplate[] = [
  {
    id: "qst-eas-at-a-glance",
    chapter_id: "ch-3",
    topic_label: "Aromatic Chemistry / EAS",
    title: "EAS Reactions at a Glance",
    purpose:
      "The 2-page cheat sheet — every EAS reaction, what it adds, and the conditions that make it run.",
    reviewBeforeSprint: true,
    rules: [
      "Every EAS follows the same shape: generate electrophile → arenium ion → lose H+.",
      "Halogenation: Br2 or Cl2 + FeBr3/FeCl3 → adds –Br or –Cl.",
      "Nitration: HNO3 + H2SO4 → adds –NO2 (via NO2⁺).",
      "Sulfonation: SO3 / H2SO4 → adds –SO3H (reversible — useful as a blocker).",
      "FC alkylation: R–Cl + AlCl3 → adds –R (watch rearrangements + polyalkylation).",
      "FC acylation: RCOCl + AlCl3 → adds –COR (clean, no rearrangement).",
    ],
    traps: [
      "FC fails on strongly deactivated rings (–NO2, –CN, –NR3+) and on anilines.",
      "FC alkylation rearranges 1° carbocations to 2°/3° — use acylation + reduction instead.",
      "Forgetting that sulfonation is reversible — you can install and remove –SO3H on purpose.",
    ],
    example: {
      setup: "Benzene + Br2 / FeBr3",
      answer: "Bromobenzene. FeBr3 polarizes Br2 → Br⁺ attacks ring.",
    },
    relatedQuestionTypes: [
      "Pick the EAS product",
      "Name the active electrophile",
      "Choose the right Lewis acid catalyst",
    ],
    links: {
      fullExplanation: "https://easyorganicchemistry.com/eas-overview",
      sourceReactionSummary: "https://easyorganicchemistry.com/notes/eas-2page.pdf",
    },
  },
  {
    id: "qst-eas-electrophile",
    chapter_id: "ch-3",
    topic_id: "t-3a",
    topic_label: "Electrophile generation",
    title: "EAS Electrophile Generation",
    purpose:
      "The first move of every EAS question — make the electrophile, then attack the ring.",
    reviewBeforeSprint: true,
    rules: [
      "Halogenation: X2 + FeX3 → X⁺ (or X–FeX4 complex).",
      "Nitration: HNO3 + H2SO4 → NO2⁺ + H2O.",
      "Sulfonation: H2SO4 ⇌ SO3 + H3O+ → SO3 is the electrophile.",
      "FC alkylation: R–Cl + AlCl3 → R⁺ (rearranges to most stable cation).",
      "FC acylation: RCOCl + AlCl3 → RC≡O⁺ (acylium, resonance-stabilized, no rearrangement).",
    ],
    traps: [
      "Drawing HNO3 itself attacking the ring — it isn't electrophilic enough.",
      "Skipping the Lewis acid step — without FeBr3/AlCl3 the halogen or alkyl halide just sits there.",
      "Forgetting acylium is resonance-stabilized → it does NOT rearrange.",
    ],
    example: {
      setup: "HNO3 / H2SO4 — what is the electrophile?",
      answer: "NO2⁺ (nitronium). H2SO4 protonates HNO3, water leaves.",
    },
    relatedQuestionTypes: [
      "Name the active electrophile",
      "Draw the electrophile-generation step",
      "Pick the correct Lewis acid",
    ],
    links: {
      fullExplanation: "https://easyorganicchemistry.com/eas-electrophiles",
      sourceNotes: "https://easyorganicchemistry.com/notes/eas-electrophile.pdf",
    },
  },
  {
    id: "qst-directors",
    chapter_id: "ch-3",
    topic_id: "t-3b",
    topic_label: "Directing effects (o/p/m)",
    title: "Directing Effects: Ortho/Para/Meta",
    purpose:
      "Predict where the next group lands — by knowing what's already on the ring.",
    reviewBeforeSprint: true,
    rules: [
      "Lone pair on the atom touching the ring → o/p director, activator (NH2, OH, OR).",
      "Alkyl/aryl → o/p, weak activator.",
      "Halogens → o/p, but deactivators (induction beats resonance for rate).",
      "π bond / + charge on atom touching the ring → meta director, deactivator (NO2, CN, C=O, SO3H).",
      "When two groups disagree, the stronger activator wins the directing fight.",
    ],
    traps: [
      "Calling halogens meta directors — they're o/p but slow the ring down.",
      "Forgetting steric blocking: very bulky o/p groups push the new group to para.",
      "Ignoring the second group when you already have a disubstituted ring.",
    ],
    example: {
      setup: "Toluene + HNO3/H2SO4",
      answer: "para-nitrotoluene (major) + small ortho. CH3 is o/p activator.",
    },
    relatedQuestionTypes: [
      "Pick the major product position",
      "Compare two competing directors",
      "Choose substrate that gives a target isomer",
    ],
    links: {
      fullExplanation: "https://easyorganicchemistry.com/eas-directors",
      sourceNotes: "https://easyorganicchemistry.com/notes/directors.pdf",
    },
  },
  {
    id: "qst-fc-limits",
    chapter_id: "ch-3",
    topic_id: "t-3c",
    topic_label: "Friedel-Crafts reactions",
    title: "Friedel-Crafts Limits",
    purpose:
      "When FC won't run, and what to do instead. Most FC mistakes are limit mistakes.",
    reviewBeforeSprint: true,
    rules: [
      "FC fails on rings with strong deactivators: –NO2, –CN, –SO3H, –NR3+, –CF3.",
      "FC fails on aniline-type rings — Lewis acid binds the N.",
      "FC alkylation: carbocation rearrangements + polyalkylation.",
      "Workaround: FC acylation, then Clemmensen (Zn(Hg)/HCl) or Wolff-Kishner reduces C=O → CH2.",
    ],
    traps: [
      "Trying FC on nitrobenzene — answer is 'no reaction.'",
      "Drawing a clean 1° alkyl product from FC alkylation when it actually rearranges.",
      "Drawing one alkyl group when polyalkylation gives multiple.",
    ],
    example: {
      setup: "Nitrobenzene + CH3Cl / AlCl3",
      answer: "No reaction — ring is too deactivated.",
    },
    relatedQuestionTypes: [
      "Pick 'no reaction' vs product",
      "Choose acylation + reduction over alkylation",
      "Spot rearrangement in FC alkylation",
    ],
    links: {
      fullExplanation: "https://easyorganicchemistry.com/fc-limits",
      sourceNotes: "https://easyorganicchemistry.com/notes/fc-limits.pdf",
    },
  },
  {
    id: "qst-sulfonation-block",
    chapter_id: "ch-3",
    topic_label: "Sulfonation as blocking group",
    title: "Sulfonation as a Blocking Group",
    purpose:
      "Use –SO3H as a temporary blocker to force the product you actually want.",
    reviewBeforeSprint: false,
    rules: [
      "Sulfonation (SO3/H2SO4) is reversible — desulfonate with dilute H2SO4 + heat + H2O.",
      "–SO3H is bulky → installs para to an existing o/p director and blocks that spot.",
      "After running the next EAS at the ortho spot, remove –SO3H.",
      "Net result: force ortho product on a substrate that would prefer para.",
    ],
    traps: [
      "Forgetting the final desulfonation step — your answer still has –SO3H on it.",
      "Trying to block a meta position — sulfonation goes o/p of activators.",
    ],
    example: {
      setup: "You need o-bromotoluene, not p-bromotoluene.",
      answer: "Sulfonate (blocks para) → brominate (ortho) → desulfonate.",
    },
    relatedQuestionTypes: [
      "Force-ortho synthesis problems",
      "Choose blocking-group strategy",
    ],
    links: {
      fullExplanation: "https://easyorganicchemistry.com/sulfonation-block",
    },
  },
  {
    id: "qst-multistep-order",
    chapter_id: "ch-3",
    topic_id: "t-3d",
    topic_label: "Multistep aromatic synthesis",
    title: "Multistep Aromatic Synthesis Order",
    purpose:
      "Decide what goes on the ring first — order is the whole question.",
    reviewBeforeSprint: true,
    rules: [
      "Want a meta product? Install the meta director FIRST.",
      "Want an o/p product? Install the o/p director FIRST.",
      "Need a clean 1° alkyl chain? FC acylate, then reduce — never FC alkylate.",
      "Need to convert –NO2 to –NH2? Use Sn/HCl or H2/Pd after all EAS steps (–NH2 ruins FC).",
      "Need to force ortho on an o/p-directed ring? Block para with –SO3H first.",
    ],
    traps: [
      "Putting the o/p director on first when you wanted a meta product.",
      "Reducing NO2 to NH2 too early — then FC fails on the aniline.",
      "Forgetting that aniline needs to be protected (acetylate) before EAS at all.",
    ],
    example: {
      setup: "Make m-bromonitrobenzene from benzene.",
      answer: "Nitrate first (NO2 is meta director), then brominate.",
    },
    relatedQuestionTypes: [
      "Order-of-steps synthesis",
      "Pick the meta director for step 1",
      "Spot the failed-FC step in a sequence",
    ],
    links: {
      fullExplanation: "https://easyorganicchemistry.com/multistep-aromatic",
      sourceNotes: "https://easyorganicchemistry.com/notes/multistep.pdf",
    },
  },
];

export function templateById(id: string) {
  return quickSheetTemplates.find((t) => t.id === id) ?? null;
}
export function templatesByChapter(chapterId: string) {
  return quickSheetTemplates.filter((t) => t.chapter_id === chapterId);
}

// ---------------- Deep Review ----------------

export type DeepReviewSection = {
  id: string;
  title: string;
  summary: string;
  body: string;
  practiceTopicId?: string;
};

export type DeepReview = {
  id: string;
  chapter_id: string;
  title: string;
  intro: string; // tutor-voice intro
  sourceLink?: string; // placeholder full-notes link
  sections: DeepReviewSection[];
};

export const deepReviews: DeepReview[] = [
  {
    id: "dr-eas",
    chapter_id: "ch-3",
    title: "Aromatic Chemistry / EAS — Deep Review",
    intro:
      "Review this first, then come back and try the sprint. This is fixable — most EAS mistakes come from skipping the first move or the directing logic, not the mechanism itself.",
    sourceLink: "https://easyorganicchemistry.com/notes/eas-full.pdf",
    sections: [
      {
        id: "eas-big-idea",
        title: "EAS big idea",
        summary: "Aromatic ring trades one H for one new group, ring stays aromatic.",
        body: "Benzene is special: very stable, but its π electrons can still act as a nucleophile. In EAS, an electrophile attacks the ring, breaks aromaticity briefly (arenium ion), and then loses an H+ to restore aromaticity. Net change: one H is swapped for the new group.",
      },
      {
        id: "eas-mechanism",
        title: "General EAS mechanism",
        summary: "Generate electrophile → addition → loss of H+ → aromatic product.",
        body: "Step 1: Activate the electrophile (Lewis acid or strong acid). Step 2: Ring attacks E+ to form the arenium (sigma complex) — this is the slow, rate-limiting step. Step 3: A base removes the H from the sp3 carbon, restoring aromaticity. Every EAS reaction has this shape — only step 1 changes.",
        practiceTopicId: "t-3a",
      },
      {
        id: "eas-halogenation",
        title: "Halogenation",
        summary: "Br2 / FeBr3 or Cl2 / FeCl3 → aryl halide.",
        body: "FeBr3 polarizes Br–Br, making one bromine electrophilic enough to attack the ring. Iodination needs an extra oxidant (e.g. HNO3); fluorination is too violent for direct EAS.",
      },
      {
        id: "eas-nitration",
        title: "Nitration",
        summary: "HNO3 / H2SO4 → Ar–NO2 via NO2⁺ (nitronium).",
        body: "H2SO4 protonates HNO3 on its OH; water leaves, generating NO2⁺. NO2⁺ is a strong electrophile that even halobenzenes and slightly deactivated rings will accept. You can later reduce –NO2 to –NH2 (Sn/HCl, H2/Pd) — but only AFTER all FC steps are done.",
        practiceTopicId: "t-3a",
      },
      {
        id: "eas-sulfonation",
        title: "Sulfonation",
        summary: "SO3 / H2SO4 → Ar–SO3H. Reversible.",
        body: "SO3 is the active electrophile. Because the reaction is reversible (heat + dilute H2SO4 + H2O removes –SO3H), sulfonation is the standard blocking-group trick: install it to block a para position, run the next EAS at ortho, then strip it off.",
      },
      {
        id: "fc-alkylation",
        title: "Friedel-Crafts alkylation",
        summary: "R–Cl + AlCl3 → Ar–R. Beware rearrangements + polyalkylation.",
        body: "AlCl3 generates R+. The carbocation rearranges to the most stable form — so 1-chloropropane gives mostly isopropyl benzene, not n-propyl benzene. The product is more activated than starting material, so the reaction often runs again (polyalkylation). Skip FC alkylation when you need a clean 1° chain — do FC acylation then reduce.",
        practiceTopicId: "t-3c",
      },
      {
        id: "fc-acylation",
        title: "Friedel-Crafts acylation",
        summary: "RCOCl + AlCl3 → aryl ketone. No rearrangement.",
        body: "Acylium ion (RC≡O+) is resonance-stabilized → no rearrangement. The ketone product is slightly deactivated → no polyacylation. Reduce C=O to CH2 with Clemmensen (Zn(Hg)/HCl) or Wolff-Kishner (N2H4/KOH/heat) to get the clean alkyl chain you couldn't get from FC alkylation.",
        practiceTopicId: "t-3c",
      },
      {
        id: "act-deact",
        title: "Activating vs deactivating groups",
        summary: "Lone pair donors activate; π/+ pull deactivate.",
        body: "Strong activators: –NH2, –OH, –OR. Weak activators: alkyl, aryl. Weak deactivators: halogens (still o/p). Moderate deactivators: –C=O, –COOH, –SO3H, –CN. Strong deactivators: –NO2, –NR3+, –CF3. Activation/deactivation = rate; direction is a separate question.",
      },
      {
        id: "directors",
        title: "Ortho/para vs meta directors",
        summary: "Donors → o/p. Withdrawers → meta. Halogens are the odd ones.",
        body: "If the atom touching the ring has a lone pair → o/p director (activator). If alkyl/aryl → o/p (weak activator). If the atom touching the ring has a π bond or + charge → meta director (deactivator). Halogens are o/p directors but deactivators (induction wins for rate, resonance wins for position).",
        practiceTopicId: "t-3b",
      },
      {
        id: "multistep",
        title: "Multistep synthesis strategy",
        summary: "Order is the question. Pick the director first, then add the rest.",
        body: "Decide the target relationship (o/p vs meta) first. Install the group whose directing effect produces that relationship FIRST. Use sulfonation as a blocker when an o/p director would default to para but you need ortho. Save reduction of –NO2 to –NH2 for the very end (NH2 kills FC).",
        practiceTopicId: "t-3d",
      },
      {
        id: "traps",
        title: "Common exam traps",
        summary: "The mistakes professors love to test.",
        body: "Trap 1: FC on a deactivated ring → 'no reaction', not a meta product. Trap 2: FC alkylation with a 1° alkyl halide → expect rearrangement. Trap 3: Wrong order of steps → wrong isomer. Trap 4: Reducing NO2 to NH2 too early → next FC step fails. Trap 5: Forgetting halogens are o/p directors even though they deactivate.",
      },
    ],
  },
];

export function deepReviewById(id: string) {
  return deepReviews.find((d) => d.id === id) ?? null;
}
