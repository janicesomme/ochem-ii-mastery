import { supabase } from "@/integrations/supabase/client";
import type {
  LibraryQuestionRow,
  QuestionPackRow,
} from "@/integrations/supabase/types";

function throwQueryError(context: string, error: { message: string } | null): never {
  throw new Error(`${context}: ${error?.message ?? "Unknown Supabase error"}`);
}

export async function listQuestionPacks(): Promise<QuestionPackRow[]> {
  const { data, error } = await supabase
    .from("question_packs")
    .select("pack, topic, intro, glossary, janice_chapter, question_count, id, created_at")
    .order("janice_chapter", { ascending: true, nullsFirst: false })
    .order("pack", { ascending: true });

  if (error) throwQueryError("Unable to load question packs", error);
  return data ?? [];
}

export async function listLibraryQuestions(
  pack?: string,
): Promise<LibraryQuestionRow[]> {
  let query = supabase
    .from("library_questions")
    .select("*")
    .order("pack", { ascending: true })
    .order("question_order", { ascending: true, nullsFirst: false });

  if (pack) query = query.eq("pack", pack);

  const { data, error } = await query;
  if (error) throwQueryError("Unable to load verified library questions", error);
  return data ?? [];
}

export async function getLibraryQuestion(
  qId: string,
): Promise<LibraryQuestionRow> {
  const { data, error } = await supabase
    .from("library_questions")
    .select("*")
    .eq("q_id", qId)
    .single();

  if (error) throwQueryError(`Unable to load question ${qId}`, error);
  return data;
}
