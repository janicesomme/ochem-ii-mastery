export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          created_at: string | null
          exam_date: string | null
          id: string
          institution: string | null
          name: string
          question_source: string
          semester: string | null
          student_id: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          exam_date?: string | null
          id?: string
          institution?: string | null
          name: string
          question_source?: string
          semester?: string | null
          student_id: string
          subject: string
        }
        Update: {
          created_at?: string | null
          exam_date?: string | null
          id?: string
          institution?: string | null
          name?: string
          question_source?: string
          semester?: string | null
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          ai_tagged: boolean
          answer_image_url: string | null
          answer_key: string | null
          concept_canonical: string[] | null
          confusable_concepts: string[] | null
          confusable_with: string[] | null
          course_id: string
          created_at: string | null
          difficulty: string
          exam_number: number | null
          exam_year: number | null
          has_structure: boolean | null
          hint: string | null
          id: string
          image_url: string | null
          janice_shortcut: string | null
          pack: string | null
          pattern: string | null
          point_value: number | null
          pre_lesson_needed: string | null
          q_id: string
          question_order: number | null
          question_type: string
          raw_text: string | null
          reagents_involved: string[] | null
          related_knowledge_unit_ids: string[] | null
          source_doc: string
          source_exam_id: string | null
          source_page: string | null
          struggle_point: string | null
          student_id: string
          student_visible_trigger: string | null
          sub_parts: string[] | null
          suitable_use: string | null
          topics: string[] | null
          verified: boolean | null
          vocab_needed: string[] | null
          what_student_does: string | null
          why_easy_in_system: string | null
        }
        Insert: {
          ai_tagged?: boolean
          answer_image_url?: string | null
          answer_key?: string | null
          concept_canonical?: string[] | null
          confusable_concepts?: string[] | null
          confusable_with?: string[] | null
          course_id: string
          created_at?: string | null
          difficulty: string
          exam_number?: number | null
          exam_year?: number | null
          has_structure?: boolean | null
          hint?: string | null
          id?: string
          image_url?: string | null
          janice_shortcut?: string | null
          pack?: string | null
          pattern?: string | null
          point_value?: number | null
          pre_lesson_needed?: string | null
          q_id: string
          question_order?: number | null
          question_type: string
          raw_text?: string | null
          reagents_involved?: string[] | null
          related_knowledge_unit_ids?: string[] | null
          source_doc: string
          source_exam_id?: string | null
          source_page?: string | null
          struggle_point?: string | null
          student_id: string
          student_visible_trigger?: string | null
          sub_parts?: string[] | null
          suitable_use?: string | null
          topics?: string[] | null
          verified?: boolean | null
          vocab_needed?: string[] | null
          what_student_does?: string | null
          why_easy_in_system?: string | null
        }
        Update: {
          ai_tagged?: boolean
          answer_image_url?: string | null
          answer_key?: string | null
          concept_canonical?: string[] | null
          confusable_concepts?: string[] | null
          confusable_with?: string[] | null
          course_id?: string
          created_at?: string | null
          difficulty?: string
          exam_number?: number | null
          exam_year?: number | null
          has_structure?: boolean | null
          hint?: string | null
          id?: string
          image_url?: string | null
          janice_shortcut?: string | null
          pack?: string | null
          pattern?: string | null
          point_value?: number | null
          pre_lesson_needed?: string | null
          q_id?: string
          question_order?: number | null
          question_type?: string
          raw_text?: string | null
          reagents_involved?: string[] | null
          related_knowledge_unit_ids?: string[] | null
          source_doc?: string
          source_exam_id?: string | null
          source_page?: string | null
          struggle_point?: string | null
          student_id?: string
          student_visible_trigger?: string | null
          sub_parts?: string[] | null
          suitable_use?: string | null
          topics?: string[] | null
          verified?: boolean | null
          vocab_needed?: string[] | null
          what_student_does?: string | null
          why_easy_in_system?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_source_exam_id_fkey"
            columns: ["source_exam_id"]
            isOneToOne: false
            referencedRelation: "source_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      md_attempts: {
        Row: {
          ask: string | null
          concept: string | null
          created_at: string
          disguise: string
          id: string
          is_correct: boolean
          mode: string | null
          qid: string
          user_id: string
        }
        Insert: {
          ask?: string | null
          concept?: string | null
          created_at?: string
          disguise: string
          id?: string
          is_correct: boolean
          mode?: string | null
          qid: string
          user_id: string
        }
        Update: {
          ask?: string | null
          concept?: string | null
          created_at?: string
          disguise?: string
          id?: string
          is_correct?: boolean
          mode?: string | null
          qid?: string
          user_id?: string
        }
        Relationships: []
      }
      o2_eas_images: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_type: string
          problem_id: string
          storage_url: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_type: string
          problem_id: string
          storage_url?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_type?: string
          problem_id?: string
          storage_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "o2_eas_images_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "o2_eas_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      o2_eas_problems: {
        Row: {
          chapter: number
          checklist_hint: string | null
          common_trap: string | null
          created_at: string
          decomposition_type: string | null
          difficulty: number | null
          expected_image_types: Json | null
          has_missing_structure: boolean
          high_yield: boolean | null
          hint_1: string | null
          hint_2: string | null
          id: string
          memory_trick: string | null
          needs_image: boolean | null
          prior_knowledge_needed: Json | null
          problem_number: string
          question_analysis: Json | null
          question_text_raw: string
          question_type: string | null
          readiness_category: string | null
          solution_status: string
          solution_text_raw: string
          source: string
          topic: string | null
        }
        Insert: {
          chapter: number
          checklist_hint?: string | null
          common_trap?: string | null
          created_at?: string
          decomposition_type?: string | null
          difficulty?: number | null
          expected_image_types?: Json | null
          has_missing_structure?: boolean
          high_yield?: boolean | null
          hint_1?: string | null
          hint_2?: string | null
          id: string
          memory_trick?: string | null
          needs_image?: boolean | null
          prior_knowledge_needed?: Json | null
          problem_number: string
          question_analysis?: Json | null
          question_text_raw: string
          question_type?: string | null
          readiness_category?: string | null
          solution_status: string
          solution_text_raw: string
          source: string
          topic?: string | null
        }
        Update: {
          chapter?: number
          checklist_hint?: string | null
          common_trap?: string | null
          created_at?: string
          decomposition_type?: string | null
          difficulty?: number | null
          expected_image_types?: Json | null
          has_missing_structure?: boolean
          high_yield?: boolean | null
          hint_1?: string | null
          hint_2?: string | null
          id?: string
          memory_trick?: string | null
          needs_image?: boolean | null
          prior_knowledge_needed?: Json | null
          problem_number?: string
          question_analysis?: Json | null
          question_text_raw?: string
          question_type?: string | null
          readiness_category?: string | null
          solution_status?: string
          solution_text_raw?: string
          source?: string
          topic?: string | null
        }
        Relationships: []
      }
      o2_eas_solution_steps: {
        Row: {
          created_at: string
          do_this: string
          id: string
          problem_id: string
          step_order: number
          vocab: Json | null
          why: string
        }
        Insert: {
          created_at?: string
          do_this: string
          id?: string
          problem_id: string
          step_order: number
          vocab?: Json | null
          why: string
        }
        Update: {
          created_at?: string
          do_this?: string
          id?: string
          problem_id?: string
          step_order?: number
          vocab?: Json | null
          why?: string
        }
        Relationships: [
          {
            foreignKeyName: "o2_eas_solution_steps_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "o2_eas_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_activities: {
        Row: {
          category: string
          competencies: string[] | null
          description: string | null
          end_date: string | null
          hours_completed: number
          hours_planned: number
          id: string
          narrative_theme: string | null
          profile_id: string
          start_date: string | null
        }
        Insert: {
          category: string
          competencies?: string[] | null
          description?: string | null
          end_date?: string | null
          hours_completed?: number
          hours_planned?: number
          id?: string
          narrative_theme?: string | null
          profile_id: string
          start_date?: string | null
        }
        Update: {
          category?: string
          competencies?: string[] | null
          description?: string | null
          end_date?: string | null
          hours_completed?: number
          hours_planned?: number
          id?: string
          narrative_theme?: string | null
          profile_id?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_activities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_essay_reviews: {
        Row: {
          created_at: string
          essay_sha256: string
          id: string
          model: string
          profile_id: string
          review: Json
          rubric_version: string
          scores: Json
        }
        Insert: {
          created_at?: string
          essay_sha256: string
          id?: string
          model: string
          profile_id: string
          review: Json
          rubric_version: string
          scores: Json
        }
        Update: {
          created_at?: string
          essay_sha256?: string
          id?: string
          model?: string
          profile_id?: string
          review?: Json
          rubric_version?: string
          scores?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pm_essay_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_facts_grid: {
        Row: {
          acceptees: number | null
          acceptees_suppressed: boolean
          applicants: number | null
          applicants_suppressed: boolean
          cycle_year: number
          gpa_band: string
          id: string
          imported_at: string
          mcat_band: string
          source_file: string
          source_sha256: string
          source_sheet: string
        }
        Insert: {
          acceptees?: number | null
          acceptees_suppressed?: boolean
          applicants?: number | null
          applicants_suppressed?: boolean
          cycle_year: number
          gpa_band: string
          id?: string
          imported_at?: string
          mcat_band: string
          source_file: string
          source_sha256: string
          source_sheet: string
        }
        Update: {
          acceptees?: number | null
          acceptees_suppressed?: boolean
          applicants?: number | null
          applicants_suppressed?: boolean
          cycle_year?: number
          gpa_band?: string
          id?: string
          imported_at?: string
          mcat_band?: string
          source_file?: string
          source_sha256?: string
          source_sheet?: string
        }
        Relationships: []
      }
      pm_narratives: {
        Row: {
          id: string
          mission_fit_school_ids: string[] | null
          profile_id: string
          strength_score: number | null
          supporting_activity_ids: string[] | null
          theme: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          mission_fit_school_ids?: string[] | null
          profile_id: string
          strength_score?: number | null
          supporting_activity_ids?: string[] | null
          theme: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          mission_fit_school_ids?: string[] | null
          profile_id?: string
          strength_score?: number | null
          supporting_activity_ids?: string[] | null
          theme?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_narratives_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "pm_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_outcomes_corpus: {
        Row: {
          acceptances: number | null
          clinical_hours: number | null
          consent_to_store: boolean
          cycle_year: number | null
          gap_years: number | null
          gpa: number | null
          has_publication: boolean | null
          id: string
          interviews: number | null
          matriculated_school_id: string | null
          mcat: number | null
          raw_source_url: string | null
          research_hours: number | null
          schools_applied: number | null
          state: string | null
          user_id: string
          volunteer_hours: number | null
        }
        Insert: {
          acceptances?: number | null
          clinical_hours?: number | null
          consent_to_store?: boolean
          cycle_year?: number | null
          gap_years?: number | null
          gpa?: number | null
          has_publication?: boolean | null
          id?: string
          interviews?: number | null
          matriculated_school_id?: string | null
          mcat?: number | null
          raw_source_url?: string | null
          research_hours?: number | null
          schools_applied?: number | null
          state?: string | null
          user_id: string
          volunteer_hours?: number | null
        }
        Update: {
          acceptances?: number | null
          clinical_hours?: number | null
          consent_to_store?: boolean
          cycle_year?: number | null
          gap_years?: number | null
          gpa?: number | null
          has_publication?: boolean | null
          id?: string
          interviews?: number | null
          matriculated_school_id?: string | null
          mcat?: number | null
          raw_source_url?: string | null
          research_hours?: number | null
          schools_applied?: number | null
          state?: string | null
          user_id?: string
          volunteer_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_outcomes_corpus_matriculated_school_id_fkey"
            columns: ["matriculated_school_id"]
            isOneToOne: false
            referencedRelation: "pm_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_profiles: {
        Row: {
          gap_years: number
          gpa_cum: number | null
          gpa_science: number | null
          grad_year: number | null
          id: string
          mcat_date: string | null
          mcat_total: number | null
          state
