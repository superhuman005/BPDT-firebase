export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_user_invites: {
        Row: {
          admin_id: string
          business_industry: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          location: string | null
          role: string
          status: string | null
        }
        Insert: {
          admin_id: string
          business_industry?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          location?: string | null
          role?: string
          status?: string | null
        }
        Update: {
          admin_id?: string
          business_industry?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          role?: string
          status?: string | null
        }
        Relationships: []
      }
      bulk_user_invites: {
        Row: {
          admin_id: string
          completed_at: string | null
          email: string
          id: string
          invited_at: string | null
          status: string | null
        }
        Insert: {
          admin_id: string
          completed_at?: string | null
          email: string
          id?: string
          invited_at?: string | null
          status?: string | null
        }
        Update: {
          admin_id?: string
          completed_at?: string | null
          email?: string
          id?: string
          invited_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      business_plans: {
        Row: {
          business_model: string | null
          company_name: string | null
          competitive_advantage: string | null
          completion_percentage: number | null
          created_at: string | null
          download_count: number | null
          executive_summary: string | null
          financial_projections: string | null
          funding_request: string | null
          id: string
          industry: string | null
          management_team: string | null
          market_size: string | null
          marketing_strategy: string | null
          name: string
          operational_plan: string | null
          problem_statement: string | null
          revenue_streams: string | null
          risk_analysis: string | null
          solution: string | null
          status: string | null
          target_market: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_model?: string | null
          company_name?: string | null
          competitive_advantage?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          download_count?: number | null
          executive_summary?: string | null
          financial_projections?: string | null
          funding_request?: string | null
          id?: string
          industry?: string | null
          management_team?: string | null
          market_size?: string | null
          marketing_strategy?: string | null
          name: string
          operational_plan?: string | null
          problem_statement?: string | null
          revenue_streams?: string | null
          risk_analysis?: string | null
          solution?: string | null
          status?: string | null
          target_market?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_model?: string | null
          company_name?: string | null
          competitive_advantage?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          download_count?: number | null
          executive_summary?: string | null
          financial_projections?: string | null
          funding_request?: string | null
          id?: string
          industry?: string | null
          management_team?: string | null
          market_size?: string | null
          marketing_strategy?: string | null
          name?: string
          operational_plan?: string | null
          problem_statement?: string | null
          revenue_streams?: string | null
          risk_analysis?: string | null
          solution?: string | null
          status?: string | null
          target_market?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          created_at: string
          id: string
          notification_type: string
          sent_at: string
          status: string
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_type: string
          sent_at?: string
          status?: string
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_type?: string
          sent_at?: string
          status?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      plan_downloads: {
        Row: {
          created_at: string
          downloaded_at: string
          id: string
          plan_id: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          downloaded_at?: string
          id?: string
          plan_id: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          downloaded_at?: string
          id?: string
          plan_id?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_downloads_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_industry: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          payment_status: string | null
          region: string | null
          subscription_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          business_industry?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          payment_status?: string | null
          region?: string | null
          subscription_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          business_industry?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          payment_status?: string | null
          region?: string | null
          subscription_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_download_limits: {
        Row: {
          created_at: string
          downloads_remaining: number
          downloads_used: number
          id: string
          last_reset_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          downloads_remaining?: number
          downloads_used?: number
          id?: string
          last_reset_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          downloads_remaining?: number
          downloads_used?: number
          id?: string
          last_reset_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          business_industry: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          location: string | null
          profile_completed: boolean | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          business_industry?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          profile_completed?: boolean | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          business_industry?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          location?: string | null
          profile_completed?: boolean | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          expires_at: string | null
          id: string
          payment_reference: string | null
          status: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_reference?: string | null
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_reference?: string | null
          status?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          downloads: number | null
          email: string
          email_verified_at: string | null
          firstname: string | null
          gender: string | null
          id: number
          is_alumni: string | null
          lastname: string | null
          location: string | null
          password: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          downloads?: number | null
          email: string
          email_verified_at?: string | null
          firstname?: string | null
          gender?: string | null
          id?: number
          is_alumni?: string | null
          lastname?: string | null
          location?: string | null
          password?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          downloads?: number | null
          email?: string
          email_verified_at?: string | null
          firstname?: string | null
          gender?: string | null
          id?: number
          is_alumni?: string | null
          lastname?: string | null
          location?: string | null
          password?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      analytics_summary: {
        Row: {
          completed_plans: number | null
          total_downloads: number | null
          total_industries: number | null
          total_locations: number | null
          total_plans: number | null
          total_regions: number | null
          total_users: number | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          business_industry: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          last_plan_activity: string | null
          location: string | null
          region: string | null
          total_downloads: number | null
          total_plans: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_users_with_incomplete_plans: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          user_email: string
          last_plan_activity: string
        }[]
      }
      has_active_subscription: {
        Args: { user_id: string }
        Returns: boolean
      }
      has_role: {
        Args:
          | { _user_id: string; _role: Database["public"]["Enums"]["app_role"] }
          | { role_name: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
