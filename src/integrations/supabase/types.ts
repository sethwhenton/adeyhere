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
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar: string | null
          is_ghost: boolean | null
          location: Json | null
          updated_at: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar?: string | null
          is_ghost?: boolean | null
          location?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar?: string | null
          is_ghost?: boolean | null
          location?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      spaces: {
        Row: {
          id: string
          name: string
          host_id: string
          center_lat: number
          center_lng: number
          radius: number
          created_at: string | null
          expires_at: string
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          host_id: string
          center_lat: number
          center_lng: number
          radius: number
          created_at?: string | null
          expires_at: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          host_id?: string
          center_lat?: number
          center_lng?: number
          radius?: number
          created_at?: string | null
          expires_at?: string
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spaces_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      participants: {
        Row: {
          id: string
          space_id: string
          user_id: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          space_id: string
          user_id: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          space_id?: string
          user_id?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participants_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          space_id: string
          user_id: string
          content: string
          is_broadcast: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          space_id: string
          user_id: string
          content: string
          is_broadcast?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          space_id?: string
          user_id?: string
          content?: string
          is_broadcast?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      past_events: {
        Row: {
          id: string
          user_id: string
          space_id: string | null
          space_name: string | null
          visited_at: string | null
          left_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          space_id?: string | null
          space_name?: string | null
          visited_at?: string | null
          left_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          space_id?: string | null
          space_name?: string | null
          visited_at?: string | null
          left_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "past_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      announcements: {
        Row: {
          id: string
          space_id: string
          host_id: string
          content: string
          image_url: string | null
          link_url: string | null
          link_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          space_id: string
          host_id: string
          content: string
          image_url?: string | null
          link_url?: string | null
          link_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          space_id?: string
          host_id?: string
          content?: string
          image_url?: string | null
          link_url?: string | null
          link_text?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  : never = never
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
  : never = never
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
  : never = never
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
  : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never
