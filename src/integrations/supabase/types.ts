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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      jobs: {
        Row: {
          amount: number
          approval_required: boolean | null
          category: string
          codes: string[] | null
          completed: number | null
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          image_url: string | null
          requirements: string[] | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          type: Database["public"]["Enums"]["job_type"]
          updated_at: string | null
          vacancy: number
        }
        Insert: {
          amount: number
          approval_required?: boolean | null
          category: string
          codes?: string[] | null
          completed?: number | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          image_url?: string | null
          requirements?: string[] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          type: Database["public"]["Enums"]["job_type"]
          updated_at?: string | null
          vacancy: number
        }
        Update: {
          amount?: number
          approval_required?: boolean | null
          category?: string
          codes?: string[] | null
          completed?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          image_url?: string | null
          requirements?: string[] | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["job_type"]
          updated_at?: string | null
          vacancy?: number
        }
        Relationships: []
      }
      kyc_details: {
        Row: {
          aadhar_number: string | null
          account_holder: string | null
          bank_account: string | null
          created_at: string | null
          documents: string[] | null
          id: string
          ifsc_code: string | null
          pan_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aadhar_number?: string | null
          account_holder?: string | null
          bank_account?: string | null
          created_at?: string | null
          documents?: string[] | null
          id?: string
          ifsc_code?: string | null
          pan_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aadhar_number?: string | null
          account_holder?: string | null
          bank_account?: string | null
          created_at?: string | null
          documents?: string[] | null
          id?: string
          ifsc_code?: string | null
          pan_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["gateway_status"] | null
          type: Database["public"]["Enums"]["payment_gateway_type"]
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["gateway_status"] | null
          type: Database["public"]["Enums"]["payment_gateway_type"]
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["gateway_status"] | null
          type?: Database["public"]["Enums"]["payment_gateway_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number | null
          completed_tasks: number | null
          created_at: string | null
          email: string
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          level: string | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          completed_tasks?: number | null
          created_at?: string | null
          email: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          level?: string | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          completed_tasks?: number | null
          created_at?: string | null
          email?: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          level?: string | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"] | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          created_at: string | null
          id: string
          job_id: string
          status: Database["public"]["Enums"]["task_status"] | null
          submitted_at: string | null
          submitted_code: string | null
          submitted_image: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["task_status"] | null
          submitted_at?: string | null
          submitted_code?: string | null
          submitted_image?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          submitted_at?: string | null
          submitted_code?: string | null
          submitted_image?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          method: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          method?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          method?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      gateway_status: "active" | "inactive"
      job_status: "active" | "paused" | "completed"
      job_type: "code" | "image"
      kyc_status: "pending" | "verified" | "rejected"
      payment_gateway_type: "upi" | "bank" | "wallet"
      task_status: "pending" | "completed" | "approved" | "rejected"
      transaction_status: "pending" | "completed" | "failed"
      transaction_type: "earning" | "withdrawal"
      user_status: "active" | "pending" | "suspended"
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
      gateway_status: ["active", "inactive"],
      job_status: ["active", "paused", "completed"],
      job_type: ["code", "image"],
      kyc_status: ["pending", "verified", "rejected"],
      payment_gateway_type: ["upi", "bank", "wallet"],
      task_status: ["pending", "completed", "approved", "rejected"],
      transaction_status: ["pending", "completed", "failed"],
      transaction_type: ["earning", "withdrawal"],
      user_status: ["active", "pending", "suspended"],
    },
  },
} as const
