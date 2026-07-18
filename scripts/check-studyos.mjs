import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Missing Supabase connection settings");

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const questionResult = await client.from("library_questions").select("q_id, pack");
if (questionResult.error) throw questionResult.error;

const packResult = await client.from("question_packs").select("pack, question_count");
if (packResult.error) throw packResult.error;

const expected = {
  "Acid-Base": 29,
  "NMR Spectroscopy": 42,
  "Reactions of Alcohols": 79,
  Retrosynthesis: 23,
};

const counts = {};
for (const row of questionResult.data || []) {
  counts[row.pack] = (counts[row.pack] || 0) + 1;
}

if ((questionResult.data || []).length !== 173) {
  throw new Error(`Expected 173 questions, got ${(questionResult.data || []).length}`);
}

for (const [pack, count] of Object.entries(expected)) {
  if (counts[pack] !== count) {
    throw new Error(`${pack}: expected ${count}, got ${counts[pack] || 0}`);
  }
}

console.log("StudyOS verified", counts);
