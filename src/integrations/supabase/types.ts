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
      ambassador_profiles: {
        Row: {
          availability_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          phone_number: string | null
          speciality: string | null
          updated_at: string | null
        }
        Insert: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          phone_number?: string | null
          speciality?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          phone_number?: string | null
          speciality?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          ambassador_id: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          id: string
          meeting_link: string | null
          patient_id: string | null
          start_time: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          ambassador_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          meeting_link?: string | null
          patient_id?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          ambassador_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          meeting_link?: string | null
          patient_id?: string | null
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          ambassador_id: string
          created_at: string | null
          id: string
          notes: string | null
          session_date: string
          session_time: string
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          session_date: string
          session_time: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          session_date?: string
          session_time?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ambassador"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_ambassadors: {
        Row: {
          ambassador_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ambassador"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          added_by: string | null
          group_id: string | null
          id: string
          joined_at: string | null
          notes: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          added_by?: string | null
          group_id?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          added_by?: string | null
          group_id?: string | null
          id?: string
          joined_at?: string | null
          notes?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "support_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_encrypted: boolean
          mood: Database["public"]["Enums"]["mood_type"] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_encrypted?: boolean
          mood?: Database["public"]["Enums"]["mood_type"] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_encrypted?: boolean
          mood?: Database["public"]["Enums"]["mood_type"] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_tags: {
        Row: {
          journal_entry_id: string
          tag_id: string
        }
        Insert: {
          journal_entry_id: string
          tag_id: string
        }
        Update: {
          journal_entry_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_tags_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      mental_health_resources: {
        Row: {
          category: string
          created_at: string
          description: string
          downloads: number | null
          file_url: string | null
          id: string
          shares: number | null
          title: string
          type: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          downloads?: number | null
          file_url?: string | null
          id?: string
          shares?: number | null
          title: string
          type: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          downloads?: number | null
          file_url?: string | null
          id?: string
          shares?: number | null
          title?: string
          type?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profiles: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          pincode: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_sequence: {
        Row: {
          id: number
          last_sequence: number
        }
        Insert: {
          id: number
          last_sequence?: number
        }
        Update: {
          id?: number
          last_sequence?: number
        }
        Relationships: []
      }
      support_groups: {
        Row: {
          ambassador_id: string | null
          created_at: string | null
          description: string | null
          group_type: string
          id: string
          max_participants: number | null
          meeting_schedule: string | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ambassador_id?: string | null
          created_at?: string | null
          description?: string | null
          group_type: string
          id?: string
          max_participants?: number | null
          meeting_schedule?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ambassador_id?: string | null
          created_at?: string | null
          description?: string | null
          group_type?: string
          id?: string
          max_participants?: number | null
          meeting_schedule?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_groups_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      therapist_profiles: {
        Row: {
          bio: string | null
          created_at: string
          education: string[] | null
          full_name: string
          id: string
          languages: string[] | null
          profile_image: string | null
          specialty: string
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          education?: string[] | null
          full_name: string
          id: string
          languages?: string[] | null
          profile_image?: string | null
          specialty: string
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          education?: string[] | null
          full_name?: string
          id?: string
          languages?: string[] | null
          profile_image?: string | null
          specialty?: string
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "therapist_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_users: {
        Row: {
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
        }
        Insert: {
          email?: string | null
          first_name?: never
          id?: string | null
          last_name?: never
        }
        Update: {
          email?: string | null
          first_name?: never
          id?: string | null
          last_name?: never
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      mood_type: "Happy" | "Calm" | "Sad" | "Angry" | "Worried"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      mood_type: ["Happy", "Calm", "Sad", "Angry", "Worried"],
    },
  },
} as const
