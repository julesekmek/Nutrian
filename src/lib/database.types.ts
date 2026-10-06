
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "daily_steps": {
                  Row: {
                    "day": string,"steps": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "day": string,"steps": number,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "day"?: string,"steps"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"foods": {
                  Row: {
                    "carbs_per_100g": number,"category": string,"created_at": string,"fat_per_100g": number,"id": string,"kcal_per_100g": number,"name": string,"protein_per_100g": number,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "carbs_per_100g": number,"category"?: string,"created_at"?: string,"fat_per_100g": number,"id"?: string,"kcal_per_100g": number,"name": string,"protein_per_100g": number,"user_id"?: string | null
                  }
                  Update: {
                    "carbs_per_100g"?: number,"category"?: string,"created_at"?: string,"fat_per_100g"?: number,"id"?: string,"kcal_per_100g"?: number,"name"?: string,"protein_per_100g"?: number,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"meal_entries": {
                  Row: {
                    "carbs_g": number | null,"created_at": string,"eaten_on": string,"fat_g": number | null,"id": string,"kcal": number,"name": string,"portions": number,"protein_g": number | null,"recipe_id": string | null,"source": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "carbs_g"?: number | null,"created_at"?: string,"eaten_on": string,"fat_g"?: number | null,"id"?: string,"kcal": number,"name": string,"portions"?: number,"protein_g"?: number | null,"recipe_id"?: string | null,"source": string,"user_id"?: string
                  }
                  Update: {
                    "carbs_g"?: number | null,"created_at"?: string,"eaten_on"?: string,"fat_g"?: number | null,"id"?: string,"kcal"?: number,"name"?: string,"portions"?: number,"protein_g"?: number | null,"recipe_id"?: string | null,"source"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "meal_entries_recipe_id_fkey"
      columns: ["recipe_id"]
isOneToOne: false
      referencedRelation: "recipe_stock"
      referencedColumns: ["recipe_id"]
    },{
      foreignKeyName: "meal_entries_recipe_id_fkey"
      columns: ["recipe_id"]
isOneToOne: false
      referencedRelation: "recipes"
      referencedColumns: ["id"]
    }
                  ]
                },"preparations": {
                  Row: {
                    "created_at": string,"id": string,"portions": number,"prepared_on": string,"recipe_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"portions": number,"prepared_on"?: string,"recipe_id": string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"portions"?: number,"prepared_on"?: string,"recipe_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "preparations_recipe_id_fkey"
      columns: ["recipe_id"]
isOneToOne: false
      referencedRelation: "recipe_stock"
      referencedColumns: ["recipe_id"]
    },{
      foreignKeyName: "preparations_recipe_id_fkey"
      columns: ["recipe_id"]
isOneToOne: false
      referencedRelation: "recipes"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "activity_level": string,"batches_per_week": number,"birth_year": number,"created_at": string,"goal": string,"height_cm": number,"sex": string,"stock_portions_per_day": number,"updated_at": string,"user_id": string,"weight_kg": number
                  }
                  ComputedFields: never
                  Insert: {
                    "activity_level": string,"batches_per_week"?: number,"birth_year": number,"created_at"?: string,"goal": string,"height_cm": number,"sex": string,"stock_portions_per_day"?: number,"updated_at"?: string,"user_id"?: string,"weight_kg": number
                  }
                  Update: {
                    "activity_level"?: string,"batches_per_week"?: number,"birth_year"?: number,"created_at"?: string,"goal"?: string,"height_cm"?: number,"sex"?: string,"stock_portions_per_day"?: number,"updated_at"?: string,"user_id"?: string,"weight_kg"?: number
                  }
                  Relationships: [
                    
                  ]
                },"recipe_ingredients": {
                  Row: {
                    "food_id": string,"grams": number,"id": string,"position": number,"recipe_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "food_id": string,"grams": number,"id"?: string,"position"?: number,"recipe_id": string,"user_id"?: string
                  }
                  Update: {
                    "food_id"?: string,"grams"?: number,"id"?: string,"position"?: number,"recipe_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "recipe_ingredients_food_id_fkey"
      columns: ["food_id"]
isOneToOne: false
      referencedRelation: "foods"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "recipe_ingredients_recipe_id_fkey"
      columns: ["recipe_id"]
isOneToOne: false
      referencedRelation: "recipe_stock"
      referencedColumns: ["recipe_id"]
    },{
      foreignKeyName: "recipe_ingredients_recipe_id_fkey"
      columns: ["recipe_id"]
isOneToOne: false
      referencedRelation: "recipes"
      referencedColumns: ["id"]
    }
                  ]
                },"recipes": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"servings": number,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"servings": number,"updated_at"?: string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"servings"?: number,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"shopping_checks": {
                  Row: {
                    "checked_at": string,"food_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "checked_at"?: string,"food_id": string,"user_id"?: string
                  }
                  Update: {
                    "checked_at"?: string,"food_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "shopping_checks_food_id_fkey"
      columns: ["food_id"]
isOneToOne: false
      referencedRelation: "foods"
      referencedColumns: ["id"]
    }
                  ]
                },"shopping_plan_items": {
                  Row: {
                    "created_at": string,"portions": number,"recipe_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"portions": number,"recipe_id": string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"portions"?: number,"recipe_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "shopping_plan_items_recipe_id_fkey"
      columns: ["recipe_id"]
isOneToOne: false
      referencedRelation: "recipe_stock"
      referencedColumns: ["recipe_id"]
    },{
      foreignKeyName: "shopping_plan_items_recipe_id_fkey"
      columns: ["recipe_id"]
isOneToOne: false
      referencedRelation: "recipes"
      referencedColumns: ["id"]
    }
                  ]
                },"weigh_ins": {
                  Row: {
                    "created_at": string,"day": string,"id": string,"user_id": string,"weight_kg": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"day": string,"id"?: string,"user_id"?: string,"weight_kg": number
                  }
                  Update: {
                    "created_at"?: string,"day"?: string,"id"?: string,"user_id"?: string,"weight_kg"?: number
                  }
                  Relationships: [
                    
                  ]
                },"workouts": {
                  Row: {
                    "created_at": string,"day": string,"duration_min": number,"id": string,"kcal": number,"kind": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"day": string,"duration_min": number,"id"?: string,"kcal": number,"kind": string,"user_id"?: string
                  }
                  Update: {
                    "created_at"?: string,"day"?: string,"duration_min"?: number,"id"?: string,"kcal"?: number,"kind"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "recipe_stock": {
                  Row: {
                    "last_prepared_on": string | null,"portions_left": number | null,"recipe_id": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "save_recipe":
{ Args: { "p_ingredients": Json,"p_name": string,"p_recipe_id"?: string,"p_servings": number }; Returns: string
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
