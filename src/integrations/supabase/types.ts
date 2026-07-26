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
          state_residence: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          gap_years?: number
          gpa_cum?: number | null
          gpa_science?: number | null
          grad_year?: number | null
          id?: string
          mcat_date?: string | null
          mcat_total?: number | null
          state_residence?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          gap_years?: number
          gpa_cum?: number | null
          gpa_science?: number | null
          grad_year?: number | null
          id?: string
          mcat_date?: string | null
          mcat_total?: number | null
          state_residence?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pm_school_stats: {
        Row: {
          cycle_year: number
          id: string
          median_clinical_hours: number | null
          median_gpa: number | null
          median_mcat: number | null
          median_research_hours: number | null
          pct_gap_year: number | null
          pct_instate: number | null
          pct_with_publications: number | null
          school_id: string
          source: string | null
        }
        Insert: {
          cycle_year: number
          id?: string
          median_clinical_hours?: number | null
          median_gpa?: number | null
          median_mcat?: number | null
          median_research_hours?: number | null
          pct_gap_year?: number | null
          pct_instate?: number | null
          pct_with_publications?: number | null
          school_id: string
          source?: string | null
        }
        Update: {
          cycle_year?: number
          id?: string
          median_clinical_hours?: number | null
          median_gpa?: number | null
          median_mcat?: number | null
          median_research_hours?: number | null
          pct_gap_year?: number | null
          pct_instate?: number | null
          pct_with_publications?: number | null
          school_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_school_stats_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "pm_schools"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_schools: {
        Row: {
          class_size: number | null
          id: string
          mission_keywords: string[] | null
          name: string
          public_private: string | null
          state: string | null
        }
        Insert: {
          class_size?: number | null
          id?: string
          mission_keywords?: string[] | null
          name: string
          public_private?: string | null
          state?: string | null
        }
        Update: {
          class_size?: number | null
          id?: string
          mission_keywords?: string[] | null
          name?: string
          public_private?: string | null
          state?: string | null
        }
        Relationships: []
      }
      question_packs: {
        Row: {
          created_at: string | null
          glossary: Json | null
          id: string
          intro: string | null
          janice_chapter: number | null
          pack: string
          question_count: number | null
          topic: string | null
        }
        Insert: {
          created_at?: string | null
          glossary?: Json | null
          id?: string
          intro?: string | null
          janice_chapter?: number | null
          pack: string
          question_count?: number | null
          topic?: string | null
        }
        Update: {
          created_at?: string | null
          glossary?: Json | null
          id?: string
          intro?: string | null
          janice_chapter?: number | null
          pack?: string
          question_count?: number | null
          topic?: string | null
        }
        Relationships: []
      }
      reagents: {
        Row: {
          abbreviation: string | null
          conditions: string | null
          created_at: string | null
          full_name: string
          id: string
          mechanism_type: string | null
          pka_relevance: string | null
          reaction_types: string[] | null
          similar_reagents: string[] | null
          smiles: string | null
          stereochemistry_notes: string | null
          verified_source: string
          what_it_does: string
        }
        Insert: {
          abbreviation?: string | null
          conditions?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          mechanism_type?: string | null
          pka_relevance?: string | null
          reaction_types?: string[] | null
          similar_reagents?: string[] | null
          smiles?: string | null
          stereochemistry_notes?: string | null
          verified_source: string
          what_it_does: string
        }
        Update: {
          abbreviation?: string | null
          conditions?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          mechanism_type?: string | null
          pka_relevance?: string | null
          reaction_types?: string[] | null
          similar_reagents?: string[] | null
          smiles?: string | null
          stereochemistry_notes?: string | null
          verified_source?: string
          what_it_does?: string
        }
        Relationships: []
      }
      source_exams: {
        Row: {
          course_code: string
          course_id: string
          created_at: string | null
          exam_number: number
          id: string
          original_filename: string
          question_count: number | null
          student_id: string
          year: number
        }
        Insert: {
          course_code: string
          course_id: string
          created_at?: string | null
          exam_number: number
          id?: string
          original_filename: string
          question_count?: number | null
          student_id: string
          year: number
        }
        Update: {
          course_code?: string
          course_id?: string
          created_at?: string | null
          exam_number?: number
          id?: string
          original_filename?: string
          question_count?: number | null
          student_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "source_exams_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_exams_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      source_materials: {
        Row: {
          course_id: string
          created_at: string | null
          error_message: string | null
          extraction_confidence: number | null
          file_type: string
          file_url: string
          id: string
          needs_review: boolean | null
          processing_status: string
          student_id: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          error_message?: string | null
          extraction_confidence?: number | null
          file_type: string
          file_url: string
          id?: string
          needs_review?: boolean | null
          processing_status?: string
          student_id: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          error_message?: string | null
          extraction_confidence?: number | null
          file_type?: string
          file_url?: string
          id?: string
          needs_review?: boolean | null
          processing_status?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_materials_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profile: {
        Row: {
          academic_level: string | null
          attention_span_minutes: number | null
          goals: string | null
          id: string
          learning_style: string | null
          preferred_explanation_styles: Json | null
          pressure_context: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_level?: string | null
          attention_span_minutes?: number | null
          goals?: string | null
          id?: string
          learning_style?: string | null
          preferred_explanation_styles?: Json | null
          pressure_context?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_level?: string | null
          attention_span_minutes?: number | null
          goals?: string | null
          id?: string
          learning_style?: string | null
          preferred_explanation_styles?: Json | null
          pressure_context?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profile_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          onboarding_complete: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          onboarding_complete?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          onboarding_complete?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      library_questions: {
        Row: {
          answer_image_url: string | null
          answer_key: string | null
          concept_canonical: string[] | null
          confusable_concepts: string[] | null
          confusable_with: string[] | null
          difficulty: string | null
          exam_number: number | null
          hint: string | null
          image_url: string | null
          janice_shortcut: string | null
          pack: string | null
          pattern: string | null
          q_id: string | null
          question_order: number | null
          question_type: string | null
          raw_text: string | null
          reagents_involved: string[] | null
          source_doc: string | null
          struggle_point: string | null
          student_visible_trigger: string | null
          topics: string[] | null
          vocab_needed: string[] | null
          what_student_does: string | null
        }
        Insert: {
          answer_image_url?: string | null
          answer_key?: string | null
          concept_canonical?: string[] | null
          confusable_concepts?: string[] | null
          confusable_with?: string[] | null
          difficulty?: string | null
          exam_number?: number | null
          hint?: string | null
          image_url?: string | null
          janice_shortcut?: string | null
          pack?: string | null
          pattern?: string | null
          q_id?: string | null
          question_order?: number | null
          question_type?: string | null
          raw_text?: string | null
          reagents_involved?: string[] | null
          source_doc?: string | null
          struggle_point?: string | null
          student_visible_trigger?: string | null
          topics?: string[] | null
          vocab_needed?: string[] | null
          what_student_does?: string | null
        }
        Update: {
          answer_image_url?: string | null
          answer_key?: string | null
          concept_canonical?: string[] | null
          confusable_concepts?: string[] | null
          confusable_with?: string[] | null
          difficulty?: string | null
          exam_number?: number | null
          hint?: string | null
          image_url?: string | null
          janice_shortcut?: string | null
          pack?: string | null
          pattern?: string | null
          q_id?: string | null
          question_order?: number | null
          question_type?: string | null
          raw_text?: string | null
          reagents_involved?: string[] | null
          source_doc?: string | null
          struggle_point?: string | null
          student_visible_trigger?: string | null
          topics?: string[] | null
          vocab_needed?: string[] | null
          what_student_does?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_batch: { Args: { p_batch: string }; Returns: undefined }
      log_event: {
        Args: {
          p_action: string
          p_details: Json
          p_entity: string
          p_kind: string
          p_org: string
        }
        Returns: undefined
      }
      update_user_streak: {
        Args: { p_activity_date?: string; p_app_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      batch_status: "pending" | "approved" | "held" | "sent" | "failed"
      channel: "email" | "sms"
      intensity_level: "all_in" | "moderate" | "light"
      invite_status: "queued" | "sent" | "clicked" | "opted_out" | "failed"
      notification_status: "pending" | "sent" | "read" | "dismissed"
      reply_status: "pending" | "approved" | "edited" | "held"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      batch_status: ["pending", "approved", "held", "sent", "failed"],
      channel: ["email", "sms"],
      intensity_level: ["all_in", "moderate", "light"],
      invite_status: ["queued", "sent", "clicked", "opted_out", "failed"],
      notification_status: ["pending", "sent", "read", "dismissed"],
      reply_status: ["pending", "approved", "edited", "held"],
    },
  },
} as const
