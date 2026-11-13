/**
 * Tipos generados desde la base de datos de Supabase (esquema `public`).
 *
 * No editar a mano: se regeneran con `pnpm types:gen`.
 * Archivo generado: se excluye de ESLint por su formato de salida.
 */
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      booking_events: {
        Row: {
          actor_id: string | null
          booking_id: string
          business_id: string
          created_at: string
          from_status: Database["public"]["Enums"]["booking_status"] | null
          id: number
          note: string | null
          to_status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          actor_id?: string | null
          booking_id: string
          business_id: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["booking_status"] | null
          id?: never
          note?: string | null
          to_status: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          actor_id?: string | null
          booking_id?: string
          business_id?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["booking_status"] | null
          id?: never
          note?: string | null
          to_status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_fk"
            columns: ["booking_id", "business_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      bookings: {
        Row: {
          blocked_until: string
          business_id: string
          cancelled_at: string | null
          confirmation_token: string
          created_at: string
          currency: string
          customer_id: string
          ends_at: string
          id: string
          notes: string | null
          price_cents: number
          professional_id: string
          service_id: string
          source: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          blocked_until: string
          business_id: string
          cancelled_at?: string | null
          confirmation_token?: string
          created_at?: string
          currency?: string
          customer_id: string
          ends_at: string
          id?: string
          notes?: string | null
          price_cents?: number
          professional_id: string
          service_id: string
          source?: Database["public"]["Enums"]["booking_source"]
          starts_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          blocked_until?: string
          business_id?: string
          cancelled_at?: string | null
          confirmation_token?: string
          created_at?: string
          currency?: string
          customer_id?: string
          ends_at?: string
          id?: string
          notes?: string | null
          price_cents?: number
          professional_id?: string
          service_id?: string
          source?: Database["public"]["Enums"]["booking_source"]
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_fk"
            columns: ["customer_id", "business_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "bookings_professional_fk"
            columns: ["professional_id", "business_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "bookings_service_fk"
            columns: ["service_id", "business_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      business_hours: {
        Row: {
          business_id: string
          closes_at: string | null
          is_closed: boolean
          opens_at: string | null
          weekday: number
        }
        Insert: {
          business_id: string
          closes_at?: string | null
          is_closed?: boolean
          opens_at?: string | null
          weekday: number
        }
        Update: {
          business_id?: string
          closes_at?: string | null
          is_closed?: boolean
          opens_at?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          cancellation_policy_hours: number
          created_at: string
          currency: string
          description: string | null
          id: string
          is_published: boolean
          max_advance_days: number
          min_lead_minutes: number
          name: string
          phone: string | null
          requires_confirmation: boolean
          slot_interval_minutes: number
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          cancellation_policy_hours?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_published?: boolean
          max_advance_days?: number
          min_lead_minutes?: number
          name: string
          phone?: string | null
          requires_confirmation?: boolean
          slot_interval_minutes?: number
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          cancellation_policy_hours?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_published?: boolean
          max_advance_days?: number
          min_lead_minutes?: number
          name?: string
          phone?: string | null
          requires_confirmation?: boolean
          slot_interval_minutes?: number
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          business_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          business_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_hours: {
        Row: {
          business_id: string
          closes_at: string | null
          is_closed: boolean
          opens_at: string | null
          professional_id: string
          weekday: number
        }
        Insert: {
          business_id: string
          closes_at?: string | null
          is_closed?: boolean
          opens_at?: string | null
          professional_id: string
          weekday: number
        }
        Update: {
          business_id?: string
          closes_at?: string | null
          is_closed?: boolean
          opens_at?: string | null
          professional_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "professional_hours_professional_fk"
            columns: ["professional_id", "business_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      professional_services: {
        Row: {
          business_id: string
          professional_id: string
          service_id: string
        }
        Insert: {
          business_id: string
          professional_id: string
          service_id: string
        }
        Update: {
          business_id?: string
          professional_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_services_professional_fk"
            columns: ["professional_id", "business_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id", "business_id"]
          },
          {
            foreignKeyName: "professional_services_service_fk"
            columns: ["service_id", "business_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
      professionals: {
        Row: {
          business_id: string
          color: string | null
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          business_id: string
          color?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          business_id?: string
          color?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professionals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          buffer_minutes: number
          business_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          price_cents: number
          updated_at: string
        }
        Insert: {
          buffer_minutes?: number
          business_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          price_cents?: number
          updated_at?: string
        }
        Update: {
          buffer_minutes?: number
          business_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off: {
        Row: {
          business_id: string
          created_at: string
          ends_at: string
          id: string
          professional_id: string | null
          reason: string | null
          starts_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          ends_at: string
          id?: string
          professional_id?: string | null
          reason?: string | null
          starts_at: string
        }
        Update: {
          business_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          professional_id?: string | null
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_professional_fk"
            columns: ["professional_id", "business_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id", "business_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_booking_by_token: {
        Args: { p_reason?: string; p_token: string }
        Returns: Json
      }
      create_booking: {
        Args: {
          p_business_id: string
          p_customer: Json
          p_customer_notes?: string
          p_professional_id: string
          p_service_id: string
          p_starts_at: string
        }
        Returns: Json
      }
      create_business: {
        Args: { p_name: string; p_slug: string }
        Returns: string
      }
      get_available_slots: {
        Args: {
          p_business_id: string
          p_date: string
          p_professional_id?: string
          p_service_id: string
        }
        Returns: {
          professional_id: string
          starts_at: string
        }[]
      }
      get_booking_status: { Args: { p_token: string }; Returns: Json }
    }
    Enums: {
      booking_source: "public" | "admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      member_role: "owner" | "admin" | "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      booking_source: ["public", "admin"],
      booking_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      member_role: ["owner", "admin", "staff"],
    },
  },
} as const
