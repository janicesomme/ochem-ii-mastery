export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      question_packs: {
        Row: {
          created_at: string | null;
          glossary: Json | null;
          id: string;
          intro: string | null;
          janice_chapter: number | null;
          pack: string;
          question_count: number | null;
          topic: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      library_questions: {
        Row: {
          answer_image_url: string | null;
          answer_key: string | null;
          confusable_with: string[] | null;
          difficulty: string | null;
          exam_number: number | null;
          image_url: string | null;
          pack: string | null;
          pattern: string | null;
          q_id: string | null;
          question_order: number | null;
          question_type: string | null;
          raw_text: string | null;
          source_doc: string | null;
          struggle_point: string | null;
          student_visible_trigger: string | null;
          topics: string[] | null;
          what_student_does: string | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type QuestionPackRow = Database["public"]["Tables"]["question_packs"]["Row"];
export type LibraryQuestionRow = Database["public"]["Views"]["library_questions"]["Row"];
