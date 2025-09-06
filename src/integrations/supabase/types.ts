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
      crypto_prices: {
        Row: {
          change_24h: number | null
          id: string
          last_updated: string
          market_cap: number | null
          price_usd: number
          symbol: string
          volume_24h: number | null
        }
        Insert: {
          change_24h?: number | null
          id?: string
          last_updated?: string
          market_cap?: number | null
          price_usd: number
          symbol: string
          volume_24h?: number | null
        }
        Update: {
          change_24h?: number | null
          id?: string
          last_updated?: string
          market_cap?: number | null
          price_usd?: number
          symbol?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      crypto_transactions: {
        Row: {
          amount: number
          created_at: string
          crypto_symbol: string
          exchange: string | null
          fees: number | null
          from_address: string | null
          id: string
          purchase_price: number | null
          status: string
          to_address: string | null
          transaction_hash: string | null
          transaction_type: string
          transaction_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          crypto_symbol: string
          exchange?: string | null
          fees?: number | null
          from_address?: string | null
          id?: string
          purchase_price?: number | null
          status?: string
          to_address?: string | null
          transaction_hash?: string | null
          transaction_type: string
          transaction_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          crypto_symbol?: string
          exchange?: string | null
          fees?: number | null
          from_address?: string | null
          id?: string
          purchase_price?: number | null
          status?: string
          to_address?: string | null
          transaction_hash?: string | null
          transaction_type?: string
          transaction_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crypto_wallets: {
        Row: {
          created_at: string
          crypto_name: string
          crypto_symbol: string
          id: string
          is_active: boolean
          network: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          crypto_name: string
          crypto_symbol: string
          id?: string
          is_active?: boolean
          network: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          crypto_name?: string
          crypto_symbol?: string
          id?: string
          is_active?: boolean
          network?: string
          wallet_address?: string
        }
        Relationships: []
      }
      daily_value_updates: {
        Row: {
          created_at: string
          crypto_symbol: string
          id: string
          increase_percentage: number
          new_value: number
          previous_value: number
          update_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crypto_symbol: string
          id?: string
          increase_percentage?: number
          new_value: number
          previous_value: number
          update_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crypto_symbol?: string
          id?: string
          increase_percentage?: number
          new_value?: number
          previous_value?: number
          update_date?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          created_at: string
          id: string
          total_cost: number
          total_value: number
          unrealized_pnl: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          total_cost: number
          total_value: number
          unrealized_pnl: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          total_cost?: number
          total_value?: number
          unrealized_pnl?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          ada_balance: number
          bnb_balance: number
          btc_balance: number
          created_at: string
          eth_balance: number
          id: string
          total_balance: number
          updated_at: string
          usdt_balance: number
          user_id: string
        }
        Insert: {
          ada_balance?: number
          bnb_balance?: number
          btc_balance?: number
          created_at?: string
          eth_balance?: number
          id?: string
          total_balance?: number
          updated_at?: string
          usdt_balance?: number
          user_id: string
        }
        Update: {
          ada_balance?: number
          bnb_balance?: number
          btc_balance?: number
          created_at?: string
          eth_balance?: number
          id?: string
          total_balance?: number
          updated_at?: string
          usdt_balance?: number
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          encrypted_data: string | null
          id: string
          notification_preferences: Json | null
          privacy_settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_data?: string | null
          id?: string
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_data?: string | null
          id?: string
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_balance: {
        Args: {
          amount_change_param: number
          crypto_symbol_param: string
          user_id_param: string
        }
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
