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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_2fa_settings: {
        Row: {
          admin_email: string
          carrier: string | null
          created_at: string
          id: string
          is_enabled: boolean
          phone_number: string | null
          preferred_method: string
          updated_at: string
        }
        Insert: {
          admin_email: string
          carrier?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          phone_number?: string | null
          preferred_method?: string
          updated_at?: string
        }
        Update: {
          admin_email?: string
          carrier?: string | null
          created_at?: string
          id?: string
          is_enabled?: boolean
          phone_number?: string | null
          preferred_method?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content: string
          created_at: string
          excerpt: string
          id: string
          image: string
          seo_description: string
          seo_keywords: string
          seo_title: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image: string
          seo_description: string
          seo_keywords: string
          seo_title: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image?: string
          seo_description?: string
          seo_keywords?: string
          seo_title?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          gradient: string | null
          id: string
          image_url: string
          name: string
          product_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          gradient?: string | null
          id?: string
          image_url: string
          name: string
          product_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          gradient?: string | null
          id?: string
          image_url?: string
          name?: string
          product_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_custom_prompts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_settings: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          image_search_enabled: boolean | null
          last_retrained: string | null
          position: string | null
          theme_color: string | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          image_search_enabled?: boolean | null
          last_retrained?: string | null
          position?: string | null
          theme_color?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          image_search_enabled?: boolean | null
          last_retrained?: string | null
          position?: string | null
          theme_color?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      chatbot_training_content: {
        Row: {
          content: string
          created_at: string | null
          id: string
          source_type: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          source_type: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          source_type?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_training_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chatbot_training_urls: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          admin_email: string
          attempt_type: string
          blocked_until: string | null
          created_at: string
          id: string
          ip_address: unknown
          success: boolean
        }
        Insert: {
          admin_email: string
          attempt_type: string
          blocked_until?: string | null
          created_at?: string
          id?: string
          ip_address: unknown
          success?: boolean
        }
        Update: {
          admin_email?: string
          attempt_type?: string
          blocked_until?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          success?: boolean
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_link: string | null
          alibaba_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          dhgate_url: string | null
          first_image: string | null
          flylink: string | null
          id: string
          media_links: string[] | null
          product_name: string | null
          slug: string
          status: string
          thumbnail: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          alibaba_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dhgate_url?: string | null
          first_image?: string | null
          flylink?: string | null
          id?: string
          media_links?: string[] | null
          product_name?: string | null
          slug: string
          status?: string
          thumbnail?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          alibaba_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          dhgate_url?: string | null
          first_image?: string | null
          flylink?: string | null
          id?: string
          media_links?: string[] | null
          product_name?: string | null
          slug?: string
          status?: string
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          admin_email: string
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          method: string
          used: boolean
        }
        Insert: {
          admin_email: string
          code_hash: string
          created_at?: string
          expires_at: string
          id?: string
          method: string
          used?: boolean
        }
        Update: {
          admin_email?: string
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          method?: string
          used?: boolean
        }
        Relationships: []
      }
      web_contents: {
        Row: {
          chat_with_us_link: string | null
          created_at: string
          how_to_buy_content: string | null
          how_to_buy_link: string | null
          id: string
          updated_at: string
        }
        Insert: {
          chat_with_us_link?: string | null
          created_at?: string
          how_to_buy_content?: string | null
          how_to_buy_link?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          chat_with_us_link?: string | null
          created_at?: string
          how_to_buy_content?: string | null
          how_to_buy_link?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      yupoo_drafts: {
        Row: {
          alibaba_url: string | null
          category_id: string | null
          created_at: string
          description: string | null
          dhgate_url: string | null
          flylink_url: string | null
          gallery_images: string[] | null
          id: string
          name: string | null
          preview_image: string | null
          status: string
          updated_at: string
          yupoo_url: string
        }
        Insert: {
          alibaba_url?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dhgate_url?: string | null
          flylink_url?: string | null
          gallery_images?: string[] | null
          id?: string
          name?: string | null
          preview_image?: string | null
          status?: string
          updated_at?: string
          yupoo_url: string
        }
        Update: {
          alibaba_url?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dhgate_url?: string | null
          flylink_url?: string | null
          gallery_images?: string[] | null
          id?: string
          name?: string | null
          preview_image?: string | null
          status?: string
          updated_at?: string
          yupoo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "yupoo_drafts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_admin_access: {
        Args: { user_email: string }
        Returns: boolean
      }
      check_if_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_unique_slug: {
        Args: { product_name: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
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

export type TablesInsert<
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

export type TablesUpdate<
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

export type Enums<
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

export type CompositeTypes<
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
    Enums: {},
  },
} as const
