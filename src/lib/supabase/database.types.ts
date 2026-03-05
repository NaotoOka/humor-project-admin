export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      allowed_signup_domains: {
        Row: {
          id: number;
          created_datetime_utc: string;
          apex_domain: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          apex_domain: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          apex_domain?: string;
        };
      };
      bug_reports: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          subject: string | null;
          message: string | null;
          profile_id: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          subject?: string | null;
          message?: string | null;
          profile_id?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          subject?: string | null;
          message?: string | null;
          profile_id?: string | null;
        };
      };
      caption_examples: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          image_description: string;
          caption: string;
          explanation: string;
          priority: number;
          image_id: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          image_description: string;
          caption: string;
          explanation: string;
          priority?: number;
          image_id?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          image_description?: string;
          caption?: string;
          explanation?: string;
          priority?: number;
          image_id?: string | null;
        };
      };
      caption_likes: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          profile_id: string;
          caption_id: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          profile_id: string;
          caption_id: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          profile_id?: string;
          caption_id?: string;
        };
      };
      caption_requests: {
        Row: {
          id: number;
          created_datetime_utc: string;
          profile_id: string;
          image_id: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          profile_id: string;
          image_id: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          profile_id?: string;
          image_id?: string;
        };
      };
      caption_saved: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          profile_id: string;
          caption_id: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          profile_id: string;
          caption_id: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          profile_id?: string;
          caption_id?: string;
        };
      };
      caption_votes: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          vote_value: number;
          profile_id: string;
          caption_id: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc: string;
          modified_datetime_utc?: string | null;
          vote_value: number;
          profile_id: string;
          caption_id: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          vote_value?: number;
          profile_id?: string;
          caption_id?: string;
        };
      };
      captions: {
        Row: {
          id: string;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          content: string | null;
          is_public: boolean;
          profile_id: string;
          image_id: string;
          humor_flavor_id: number | null;
          is_featured: boolean;
          caption_request_id: number | null;
          like_count: number;
          llm_prompt_chain_id: number | null;
        };
        Insert: {
          id?: string;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          content?: string | null;
          is_public: boolean;
          profile_id: string;
          image_id: string;
          humor_flavor_id?: number | null;
          is_featured?: boolean;
          caption_request_id?: number | null;
          like_count?: number;
          llm_prompt_chain_id?: number | null;
        };
        Update: {
          id?: string;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          content?: string | null;
          is_public?: boolean;
          profile_id?: string;
          image_id?: string;
          humor_flavor_id?: number | null;
          is_featured?: boolean;
          caption_request_id?: number | null;
          like_count?: number;
          llm_prompt_chain_id?: number | null;
        };
      };
      common_use_categories: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          name: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          name?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          name?: string | null;
        };
      };
      common_use_category_image_mappings: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          image_id: string | null;
          common_use_category_id: number | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          image_id?: string | null;
          common_use_category_id?: number | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          image_id?: string | null;
          common_use_category_id?: number | null;
        };
      };
      communities: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          name: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          name?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          name?: string | null;
        };
      };
      community_context_tag_mappings: {
        Row: {
          id: number;
          created_datetime_utc: string;
          community_context_id: number;
          community_context_tag_id: number;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          community_context_id: number;
          community_context_tag_id: number;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          community_context_id?: number;
          community_context_tag_id?: number;
        };
      };
      community_context_tags: {
        Row: {
          id: number;
          created_datetime_utc: string;
          name: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          name: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          name?: string;
        };
      };
      community_contexts: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          content: string | null;
          community_id: number | null;
          start_datetime_utc: string | null;
          end_datetime_utc: string | null;
          priority: number | null;
          embedding: unknown | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          content?: string | null;
          community_id?: number | null;
          start_datetime_utc?: string | null;
          end_datetime_utc?: string | null;
          priority?: number | null;
          embedding?: unknown | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          content?: string | null;
          community_id?: number | null;
          start_datetime_utc?: string | null;
          end_datetime_utc?: string | null;
          priority?: number | null;
          embedding?: unknown | null;
        };
      };
      dorms: {
        Row: {
          id: number;
          university_id: number;
          short_name: string;
          full_name: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          university_id: number;
          short_name: string;
          full_name: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          university_id?: number;
          short_name?: string;
          full_name?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      humor_flavor_mix: {
        Row: {
          id: number;
          created_datetime_utc: string;
          humor_flavor_id: number;
          caption_count: number;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          humor_flavor_id: number;
          caption_count: number;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          humor_flavor_id?: number;
          caption_count?: number;
        };
      };
      humor_flavor_step_types: {
        Row: {
          id: number;
          created_at: string;
          slug: string;
          description: string;
        };
        Insert: {
          id?: never;
          created_at?: string;
          slug: string;
          description: string;
        };
        Update: {
          id?: never;
          created_at?: string;
          slug?: string;
          description?: string;
        };
      };
      humor_flavor_steps: {
        Row: {
          id: number;
          created_datetime_utc: string;
          humor_flavor_id: number;
          llm_temperature: number | null;
          order_by: number;
          llm_input_type_id: number;
          llm_output_type_id: number;
          llm_model_id: number;
          humor_flavor_step_type_id: number;
          llm_system_prompt: string | null;
          llm_user_prompt: string | null;
          description: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          humor_flavor_id: number;
          llm_temperature?: number | null;
          order_by: number;
          llm_input_type_id: number;
          llm_output_type_id: number;
          llm_model_id: number;
          humor_flavor_step_type_id: number;
          llm_system_prompt?: string | null;
          llm_user_prompt?: string | null;
          description?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          humor_flavor_id?: number;
          llm_temperature?: number | null;
          order_by?: number;
          llm_input_type_id?: number;
          llm_output_type_id?: number;
          llm_model_id?: number;
          humor_flavor_step_type_id?: number;
          llm_system_prompt?: string | null;
          llm_user_prompt?: string | null;
          description?: string | null;
        };
      };
      humor_flavor_theme_mappings: {
        Row: {
          id: number;
          created_datetime_utc: string;
          humor_flavor_id: number | null;
          humor_theme_id: number | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          humor_flavor_id?: number | null;
          humor_theme_id?: number | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          humor_flavor_id?: number | null;
          humor_theme_id?: number | null;
        };
      };
      humor_flavors: {
        Row: {
          id: number;
          created_datetime_utc: string;
          description: string | null;
          slug: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          description?: string | null;
          slug: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          description?: string | null;
          slug?: string;
        };
      };
      humor_themes: {
        Row: {
          id: number;
          created_datetime_utc: string;
          name: string | null;
          description: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          name?: string | null;
          description?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          name?: string | null;
          description?: string | null;
        };
      };
      images: {
        Row: {
          id: string;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          url: string | null;
          is_common_use: boolean | null;
          profile_id: string | null;
          additional_context: string | null;
          is_public: boolean | null;
          image_description: string | null;
          celebrity_recognition: string | null;
          embedding: unknown | null;
        };
        Insert: {
          id?: string;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          url?: string | null;
          is_common_use?: boolean | null;
          profile_id?: string | null;
          additional_context?: string | null;
          is_public?: boolean | null;
          image_description?: string | null;
          celebrity_recognition?: string | null;
          embedding?: unknown | null;
        };
        Update: {
          id?: string;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          url?: string | null;
          is_common_use?: boolean | null;
          profile_id?: string | null;
          additional_context?: string | null;
          is_public?: boolean | null;
          image_description?: string | null;
          celebrity_recognition?: string | null;
          embedding?: unknown | null;
        };
      };
      invitations: {
        Row: {
          id: number;
          invitee_email: string;
          inviter_id: string | null;
          invitation_token: string;
          is_accepted: boolean | null;
          expires_datetime_utc: string | null;
          created_datetime_utc: string | null;
        };
        Insert: {
          id?: number;
          invitee_email: string;
          inviter_id?: string | null;
          invitation_token: string;
          is_accepted?: boolean | null;
          expires_datetime_utc?: string | null;
          created_datetime_utc?: string | null;
        };
        Update: {
          id?: number;
          invitee_email?: string;
          inviter_id?: string | null;
          invitation_token?: string;
          is_accepted?: boolean | null;
          expires_datetime_utc?: string | null;
          created_datetime_utc?: string | null;
        };
      };
      link_redirects: {
        Row: {
          id: number;
          name: string;
          slug: string;
          destination_url: string;
          visit_count: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          folder_path: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          destination_url: string;
          visit_count?: number;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          folder_path?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          destination_url?: string;
          visit_count?: number;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          folder_path?: string | null;
        };
      };
      llm_input_types: {
        Row: {
          id: number;
          created_datetime_utc: string;
          description: string;
          slug: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          description: string;
          slug: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          description?: string;
          slug?: string;
        };
      };
      llm_model_responses: {
        Row: {
          id: string;
          created_datetime_utc: string;
          llm_model_response: string | null;
          processing_time_seconds: number;
          llm_model_id: number;
          profile_id: string;
          caption_request_id: number;
          llm_system_prompt: string;
          llm_user_prompt: string;
          llm_temperature: number | null;
          humor_flavor_id: number;
          llm_prompt_chain_id: number | null;
          humor_flavor_step_id: number | null;
        };
        Insert: {
          id?: string;
          created_datetime_utc?: string;
          llm_model_response?: string | null;
          processing_time_seconds: number;
          llm_model_id: number;
          profile_id: string;
          caption_request_id: number;
          llm_system_prompt: string;
          llm_user_prompt: string;
          llm_temperature?: number | null;
          humor_flavor_id: number;
          llm_prompt_chain_id?: number | null;
          humor_flavor_step_id?: number | null;
        };
        Update: {
          id?: string;
          created_datetime_utc?: string;
          llm_model_response?: string | null;
          processing_time_seconds?: number;
          llm_model_id?: number;
          profile_id?: string;
          caption_request_id?: number;
          llm_system_prompt?: string;
          llm_user_prompt?: string;
          llm_temperature?: number | null;
          humor_flavor_id?: number;
          llm_prompt_chain_id?: number | null;
          humor_flavor_step_id?: number | null;
        };
      };
      llm_models: {
        Row: {
          id: number;
          created_datetime_utc: string;
          name: string;
          llm_provider_id: number;
          provider_model_id: string;
          is_temperature_supported: boolean;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          name: string;
          llm_provider_id: number;
          provider_model_id: string;
          is_temperature_supported?: boolean;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          name?: string;
          llm_provider_id?: number;
          provider_model_id?: string;
          is_temperature_supported?: boolean;
        };
      };
      llm_output_types: {
        Row: {
          id: number;
          created_datetime_utc: string;
          description: string;
          slug: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          description: string;
          slug: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          description?: string;
          slug?: string;
        };
      };
      llm_prompt_chains: {
        Row: {
          id: number;
          created_datetime_utc: string;
          caption_request_id: number;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          caption_request_id: number;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          caption_request_id?: number;
        };
      };
      llm_providers: {
        Row: {
          id: number;
          created_datetime_utc: string;
          name: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          name: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          name?: string;
        };
      };
      news_entities: {
        Row: {
          id: number;
          news_id: number | null;
          entity: string;
          entity_type: string;
        };
        Insert: {
          id?: number;
          news_id?: number | null;
          entity: string;
          entity_type: string;
        };
        Update: {
          id?: number;
          news_id?: number | null;
          entity?: string;
          entity_type?: string;
        };
      };
      news_snippets: {
        Row: {
          id: number;
          headline: string;
          category: string;
          source_url: string | null;
          priority: number | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          headline: string;
          category: string;
          source_url?: string | null;
          priority?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          headline?: string;
          category?: string;
          source_url?: string | null;
          priority?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
        };
      };
      personalities: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          name: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          name: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          name?: string;
        };
      };
      profile_dorm_mappings: {
        Row: {
          id: number;
          profile_id: string;
          dorm_id: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          profile_id: string;
          dorm_id: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          profile_id?: string;
          dorm_id?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      profile_university_major_mappings: {
        Row: {
          id: string;
          profile_id: string;
          university_major_id: number | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          university_major_id?: number | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          university_major_id?: number | null;
        };
      };
      profile_university_mappings: {
        Row: {
          id: number;
          profile_id: string;
          university_id: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          profile_id: string;
          university_id: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          profile_id?: string;
          university_id?: number;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_datetime_utc: string | null;
          modified_datetime_utc: string | null;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          is_superadmin: boolean;
          is_in_study: boolean;
          is_matrix_admin: boolean;
        };
        Insert: {
          id: string;
          created_datetime_utc?: string | null;
          modified_datetime_utc?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          is_superadmin?: boolean;
          is_in_study?: boolean;
          is_matrix_admin?: boolean;
        };
        Update: {
          id?: string;
          created_datetime_utc?: string | null;
          modified_datetime_utc?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          is_superadmin?: boolean;
          is_in_study?: boolean;
          is_matrix_admin?: boolean;
        };
      };
      reported_captions: {
        Row: {
          id: number;
          created_datetime_utc: string;
          caption_id: string | null;
          profile_id: string | null;
          reason: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          caption_id?: string | null;
          profile_id?: string | null;
          reason?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          caption_id?: string | null;
          profile_id?: string | null;
          reason?: string | null;
        };
      };
      reported_images: {
        Row: {
          id: number;
          created_datetime_utc: string;
          image_id: string | null;
          profile_id: string | null;
          reason: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          image_id?: string | null;
          profile_id?: string | null;
          reason?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          image_id?: string | null;
          profile_id?: string | null;
          reason?: string | null;
        };
      };
      screenshots: {
        Row: {
          id: number;
          created_datetime_utc: string;
          caption_id: string | null;
          profile_id: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          caption_id?: string | null;
          profile_id?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          caption_id?: string | null;
          profile_id?: string | null;
        };
      };
      share_to_destinations: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          name: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          name?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          name?: string | null;
        };
      };
      shares: {
        Row: {
          id: number;
          created_datetime_utc: string;
          profile_id: string | null;
          share_to_destination_id: number | null;
          proper_destination: string | null;
          caption_id: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          profile_id?: string | null;
          share_to_destination_id?: number | null;
          proper_destination?: string | null;
          caption_id?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          profile_id?: string | null;
          share_to_destination_id?: number | null;
          proper_destination?: string | null;
          caption_id?: string | null;
        };
      };
      studies: {
        Row: {
          id: number;
          created_datetime_utc: string;
          slug: string | null;
          description: string | null;
          start_datetime_utc: string | null;
          end_datetime_utc: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          slug?: string | null;
          description?: string | null;
          start_datetime_utc?: string | null;
          end_datetime_utc?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          slug?: string | null;
          description?: string | null;
          start_datetime_utc?: string | null;
          end_datetime_utc?: string | null;
        };
      };
      study_caption_mappings: {
        Row: {
          id: number;
          created_datetime_utc: string;
          study_id: number;
          caption_id: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          study_id: number;
          caption_id: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          study_id?: number;
          caption_id?: string;
        };
      };
      study_image_set_image_mappings: {
        Row: {
          id: number;
          created_datetime_utc: string;
          study_image_set_id: number;
          image_id: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          study_image_set_id: number;
          image_id: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          study_image_set_id?: number;
          image_id?: string;
        };
      };
      study_image_sets: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string;
          slug: string;
          description: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string;
          slug: string;
          description?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string;
          slug?: string;
          description?: string | null;
        };
      };
      term_types: {
        Row: {
          id: number;
          created_datetime_utc: string;
          name: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          name: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          name?: string;
        };
      };
      terms: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          term: string;
          definition: string;
          example: string;
          priority: number;
          term_type_id: number | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          term: string;
          definition: string;
          example: string;
          priority?: number;
          term_type_id?: number | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          term?: string;
          definition?: string;
          example?: string;
          priority?: number;
          term_type_id?: number | null;
        };
      };
      testflight_errors: {
        Row: {
          id: number;
          created_datetime_utc: string;
          error: string | null;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          error?: string | null;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          error?: string | null;
        };
      };
      transcript_personality_mappings: {
        Row: {
          id: number;
          created_datetime_utc: string;
          personality_id: number;
          transcript_id: number;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          personality_id: number;
          transcript_id: number;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          personality_id?: number;
          transcript_id?: number;
        };
      };
      transcripts: {
        Row: {
          id: number;
          created_datetime_utc: string;
          modified_datetime_utc: string | null;
          content: string;
        };
        Insert: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          content: string;
        };
        Update: {
          id?: never;
          created_datetime_utc?: string;
          modified_datetime_utc?: string | null;
          content?: string;
        };
      };
      universities: {
        Row: {
          id: number;
          name: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      university_major_mappings: {
        Row: {
          university_id: number;
          id: number;
          major_id: number | null;
        };
        Insert: {
          university_id: number;
          id: number;
          major_id?: number | null;
        };
        Update: {
          university_id?: number;
          id?: number;
          major_id?: number | null;
        };
      };
      university_majors: {
        Row: {
          name: string;
          id: number;
        };
        Insert: {
          name: string;
          id: number;
        };
        Update: {
          name?: string;
          id?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
