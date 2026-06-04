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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_role_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          id: string
          is_active: boolean
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_messages: {
        Row: {
          body: string
          case_id: string
          created_at: string
          id: string
          is_internal: boolean
          read_at: string | null
          sender_id: string | null
          sender_role: string
          updated_at: string
        }
        Insert: {
          body: string
          case_id: string
          created_at?: string
          id?: string
          is_internal?: boolean
          read_at?: string | null
          sender_id?: string | null
          sender_role: string
          updated_at?: string
        }
        Update: {
          body?: string
          case_id?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          read_at?: string | null
          sender_id?: string | null
          sender_role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_status_history: {
        Row: {
          case_id: string
          changed_by: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          to_status: string
          updated_at: string
        }
        Insert: {
          case_id: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          changed_by?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_status_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_to: string | null
          case_code: string
          closed_at: string | null
          created_at: string
          customer_id: string
          epl_profile_id: string | null
          id: string
          opened_at: string | null
          priority: string
          status: string
          summary: string | null
          title: string
          tracking_code: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_code: string
          closed_at?: string | null
          created_at?: string
          customer_id: string
          epl_profile_id?: string | null
          id?: string
          opened_at?: string | null
          priority?: string
          status?: string
          summary?: string | null
          title: string
          tracking_code: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_code?: string
          closed_at?: string | null
          created_at?: string
          customer_id?: string
          epl_profile_id?: string | null
          id?: string
          opened_at?: string | null
          priority?: string
          status?: string
          summary?: string | null
          title?: string
          tracking_code?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_epl_profile_id_fkey"
            columns: ["epl_profile_id"]
            isOneToOne: false
            referencedRelation: "epl_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          admin_notes: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          kyc_status: string
          national_id: string | null
          phone_verified: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          kyc_status?: string
          national_id?: string | null
          phone_verified?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          kyc_status?: string
          national_id?: string | null
          phone_verified?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      epl_profiles: {
        Row: {
          created_at: string
          customer_id: string
          epl_number: string
          id: string
          locked: boolean
          national_or_company_id: string | null
          notes: string | null
          owner_name: string
          phone: string | null
          updated_at: string
          usage_type: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          epl_number: string
          id?: string
          locked?: boolean
          national_or_company_id?: string | null
          notes?: string | null
          owner_name: string
          phone?: string | null
          updated_at?: string
          usage_type?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          epl_number?: string
          id?: string
          locked?: boolean
          national_or_company_id?: string | null
          notes?: string | null
          owner_name?: string
          phone?: string | null
          updated_at?: string
          usage_type?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "epl_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          source: string
          status: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          source?: string
          status?: string
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          source?: string
          status?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          car_model: string
          car_year: string | null
          created_at: string
          id: string
          notes: string | null
          origin: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          car_model: string
          car_year?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          origin?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          car_model?: string
          car_year?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          origin?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          last_seen_at: string | null
          phone: string
          terms_accepted: boolean
          terms_accepted_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          last_seen_at?: string | null
          phone: string
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          phone?: string
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_permissions: { Args: never; Returns: string[] }
      customer_id_for: { Args: { _uid: string }; Returns: string }
      generate_case_code: { Args: never; Returns: string }
      generate_tracking_code: { Args: never; Returns: string }
      has_permission: {
        Args: { _perm: string; _uid: string }
        Returns: boolean
      }
      is_active_admin: { Args: { _uid: string }; Returns: boolean }
      is_admin: { Args: { _uid: string }; Returns: boolean }
      is_owner: { Args: { _uid: string }; Returns: boolean }
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
