export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      products: {
        Row: {
          alibaba_url: string | null
          category_id: string | null
          created_at: string
          description: string | null
          dhgate_url: string | null
          display_id: number
          flylink_url: string | null
          gallery_images: string[] | null
          id: string
          name: string
          preview_image: string | null
          related_products: string[] | null
          updated_at: string
          video_urls: string[] | null
        }
        Insert: {
          alibaba_url?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dhgate_url?: string | null
          display_id?: number
          flylink_url?: string | null
          gallery_images?: string[] | null
          id?: string
          name: string
          preview_image?: string | null
          related_products?: string[] | null
          updated_at?: string
          video_urls?: string[] | null
        }
        Update: {
          alibaba_url?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          dhgate_url?: string | null
          display_id?: number
          flylink_url?: string | null
          gallery_images?: string[] | null
          id?: string
          name?: string
          preview_image?: string | null
          related_products?: string[] | null
          updated_at?: string
          video_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      check_if_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
