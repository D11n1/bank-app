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
      account_requests: {
        Row: {
          account_type: string
          created_at: string | null
          id: string
          initial_deposit: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type: string
          created_at?: string | null
          id?: string
          initial_deposit?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type?: string
          created_at?: string | null
          id?: string
          initial_deposit?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_number: string
          account_type: string
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          account_type: string
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          account_type?: string
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_orders: {
        Row: {
          account_id: string
          amount_eth: number
          amount_usd: number
          created_at: string
          eth_address: string
          id: string
          status: string
          tx_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount_eth: number
          amount_usd: number
          created_at?: string
          eth_address: string
          id?: string
          status?: string
          tx_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount_eth?: number
          amount_usd?: number
          created_at?: string
          eth_address?: string
          id?: string
          status?: string
          tx_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_orders_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_prices: {
        Row: {
          id: string
          price_usd: number
          symbol: string
          updated_at: string
        }
        Insert: {
          id?: string
          price_usd: number
          symbol: string
          updated_at?: string
        }
        Update: {
          id?: string
          price_usd?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      crypto_purchases: {
        Row: {
          account_id: string
          amount_eth: number
          amount_usd: number
          created_at: string
          eth_address: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount_eth: number
          amount_usd: number
          created_at?: string
          eth_address: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount_eth?: number
          amount_usd?: number
          created_at?: string
          eth_address?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_purchases_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_requests: {
        Row: {
          account_id: string
          amount: number
          created_at: string | null
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string | null
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_requests: {
        Row: {
          address: string
          created_at: string
          date_of_birth: string
          document_number: string
          document_type: string
          document_url: string
          full_name: string
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          date_of_birth: string
          document_number: string
          document_type: string
          document_url: string
          full_name: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          date_of_birth?: string
          document_number?: string
          document_type?: string
          document_url?: string
          full_name?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kyc_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          description: string | null
          id: string
          transaction_type: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_account_request:
        | {
            Args: {
              request_id: string
            }
            Returns: undefined
          }
        | {
            Args: {
              request_id: string
              initial_deposit: number
            }
            Returns: undefined
          }
      approve_deposit_request: {
        Args: {
          request_id: string
        }
        Returns: undefined
      }
      handle_crypto_purchase: {
        Args: {
          p_user_id: string
          p_account_id: string
          p_amount_usd: number
          p_amount_eth: number
          p_eth_address: string
        }
        Returns: string
      }
      handle_kyc_request: {
        Args: {
          request_id: string
          new_status: string
        }
        Returns: undefined
      }
      setup_admin_deposit_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      setup_admin_replenishment_trigger: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      top_up_admin_account: {
        Args: {
          p_amount: number
        }
        Returns: undefined
      }
      transfer_money: {
        Args: {
          p_from_account_id: string
          p_to_account_id: string
          p_amount: number
          p_description: string
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
