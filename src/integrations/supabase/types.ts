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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          client_id: string | null
          client_name: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          priority: Database["public"]["Enums"]["event_priority"] | null
          project_name: string | null
          reminder: string | null
          responsible: string | null
          start_time: string
          task_name: string | null
          ticket_id: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"] | null
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          priority?: Database["public"]["Enums"]["event_priority"] | null
          project_name?: string | null
          reminder?: string | null
          responsible?: string | null
          start_time: string
          task_name?: string | null
          ticket_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["event_type"] | null
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          priority?: Database["public"]["Enums"]["event_priority"] | null
          project_name?: string | null
          reminder?: string | null
          responsible?: string | null
          start_time?: string
          task_name?: string | null
          ticket_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_interactions: {
        Row: {
          client_id: string
          created_at: string
          date: string
          id: string
          summary: string | null
          type: Database["public"]["Enums"]["interaction_type"]
        }
        Insert: {
          client_id: string
          created_at?: string
          date?: string
          id?: string
          summary?: string | null
          type?: Database["public"]["Enums"]["interaction_type"]
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          id?: string
          summary?: string | null
          type?: Database["public"]["Enums"]["interaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "client_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          city: string | null
          company: string | null
          contact_channel: string | null
          created_at: string
          doc_number: string | null
          doc_type: Database["public"]["Enums"]["doc_type"] | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          sector: string | null
          source: Database["public"]["Enums"]["client_source"] | null
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          company?: string | null
          contact_channel?: string | null
          created_at?: string
          doc_number?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"] | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          sector?: string | null
          source?: Database["public"]["Enums"]["client_source"] | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          company?: string | null
          contact_channel?: string | null
          created_at?: string
          doc_number?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"] | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          sector?: string | null
          source?: Database["public"]["Enums"]["client_source"] | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      finance_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["movement_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["movement_type"]
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["movement_type"]
        }
        Relationships: []
      }
      finance_movements: {
        Row: {
          amount: number
          category_id: string | null
          client: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          payment_method_id: string | null
          provider: string | null
          status: Database["public"]["Enums"]["movement_status"] | null
          type: Database["public"]["Enums"]["movement_type"]
        }
        Insert: {
          amount?: number
          category_id?: string | null
          client?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          payment_method_id?: string | null
          provider?: string | null
          status?: Database["public"]["Enums"]["movement_status"] | null
          type?: Database["public"]["Enums"]["movement_type"]
        }
        Update: {
          amount?: number
          category_id?: string | null
          client?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          payment_method_id?: string | null
          provider?: string | null
          status?: Database["public"]["Enums"]["movement_status"] | null
          type?: Database["public"]["Enums"]["movement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "finance_movements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_movements_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "finance_payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_payment_methods: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_name: string
          quantity: number | null
          sort_order: number | null
          tax_rate: number | null
          unit_price: number | null
        }
        Insert: {
          id?: string
          invoice_id: string
          product_name?: string
          quantity?: number | null
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number | null
        }
        Update: {
          id?: string
          invoice_id?: string
          product_name?: string
          quantity?: number | null
          sort_order?: number | null
          tax_rate?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          date: string
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method_type"] | null
          notes: string | null
          reference: string | null
        }
        Insert: {
          amount?: number
          date?: string
          id?: string
          invoice_id: string
          method?: Database["public"]["Enums"]["payment_method_type"] | null
          notes?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          date?: string
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method_type"] | null
          notes?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string | null
          client_name: string | null
          created_at: string
          date: string
          discount: number | null
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          date?: string
          discount?: number | null
          due_date?: string
          id?: string
          invoice_number: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          date?: string
          discount?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_incidents: {
        Row: {
          date: string
          description: string | null
          duration: string | null
          id: string
          resolved: boolean | null
          resource_id: string
        }
        Insert: {
          date?: string
          description?: string | null
          duration?: string | null
          id?: string
          resolved?: boolean | null
          resource_id: string
        }
        Update: {
          date?: string
          description?: string | null
          duration?: string | null
          id?: string
          resolved?: boolean | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitor_incidents_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "monitor_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_latency_history: {
        Row: {
          id: string
          resource_id: string
          time: string
          value: number
        }
        Insert: {
          id?: string
          resource_id: string
          time: string
          value?: number
        }
        Update: {
          id?: string
          resource_id?: string
          time?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "monitor_latency_history_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "monitor_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_resources: {
        Row: {
          created_at: string
          frequency: Database["public"]["Enums"]["monitor_frequency"] | null
          id: string
          last_check: string | null
          latency: number | null
          name: string
          notify_email: string | null
          notify_slack: boolean | null
          responsible: string | null
          status: Database["public"]["Enums"]["resource_status"] | null
          type: Database["public"]["Enums"]["resource_type"] | null
          uptime: number | null
          url: string | null
        }
        Insert: {
          created_at?: string
          frequency?: Database["public"]["Enums"]["monitor_frequency"] | null
          id?: string
          last_check?: string | null
          latency?: number | null
          name: string
          notify_email?: string | null
          notify_slack?: boolean | null
          responsible?: string | null
          status?: Database["public"]["Enums"]["resource_status"] | null
          type?: Database["public"]["Enums"]["resource_type"] | null
          uptime?: number | null
          url?: string | null
        }
        Update: {
          created_at?: string
          frequency?: Database["public"]["Enums"]["monitor_frequency"] | null
          id?: string
          last_check?: string | null
          latency?: number | null
          name?: string
          notify_email?: string | null
          notify_slack?: boolean | null
          responsible?: string | null
          status?: Database["public"]["Enums"]["resource_status"] | null
          type?: Database["public"]["Enums"]["resource_type"] | null
          uptime?: number | null
          url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          module: string | null
          title: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          module?: string | null
          title: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          module?: string | null
          title?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number | null
          status: Database["public"]["Enums"]["product_status"] | null
          type: Database["public"]["Enums"]["product_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          type?: Database["public"]["Enums"]["product_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          status?: Database["public"]["Enums"]["product_status"] | null
          type?: Database["public"]["Enums"]["product_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          progress: number | null
          responsible: string | null
          score_budget: number | null
          score_client: number | null
          score_quality: number | null
          score_risk: number | null
          score_scope: number | null
          score_time: number | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string
        }
        Insert: {
          client?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          progress?: number | null
          responsible?: string | null
          score_budget?: number | null
          score_client?: number | null
          score_quality?: number | null
          score_risk?: number | null
          score_scope?: number | null
          score_time?: number | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Update: {
          client?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          progress?: number | null
          responsible?: string | null
          score_budget?: number | null
          score_client?: number | null
          score_quality?: number | null
          score_risk?: number | null
          score_scope?: number | null
          score_time?: number | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_activity: {
        Row: {
          action: string
          date: string
          id: string
          quote_id: string
          user_name: string | null
        }
        Insert: {
          action: string
          date?: string
          id?: string
          quote_id: string
          user_name?: string | null
        }
        Update: {
          action?: string
          date?: string
          id?: string
          quote_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_activity_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          discount: number | null
          id: string
          product_name: string
          quantity: number | null
          quote_id: string
          sort_order: number | null
          unit_price: number | null
        }
        Insert: {
          discount?: number | null
          id?: string
          product_name?: string
          quantity?: number | null
          quote_id: string
          sort_order?: number | null
          unit_price?: number | null
        }
        Update: {
          discount?: number | null
          id?: string
          product_name?: string
          quantity?: number | null
          quote_id?: string
          sort_order?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          client_name: string | null
          created_at: string
          date: string
          general_discount: number | null
          id: string
          notes: string | null
          quote_number: string
          seller: string | null
          status: Database["public"]["Enums"]["quote_status"] | null
          tax_rate: number | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          date?: string
          general_discount?: number | null
          id?: string
          notes?: string | null
          quote_number: string
          seller?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          tax_rate?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          date?: string
          general_discount?: number | null
          id?: string
          notes?: string | null
          quote_number?: string
          seller?: string | null
          status?: Database["public"]["Enums"]["quote_status"] | null
          tax_rate?: number | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee: string | null
          created_at: string
          due_date: string | null
          id: string
          name: string
          points: number | null
          project_id: string | null
          project_name: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          points?: number | null
          project_id?: string | null
          project_name?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          points?: number | null
          project_id?: string | null
          project_name?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_activity: {
        Row: {
          action: string
          date: string
          id: string
          ticket_id: string
          user_name: string | null
        }
        Insert: {
          action: string
          date?: string
          id?: string
          ticket_id: string
          user_name?: string | null
        }
        Update: {
          action?: string
          date?: string
          id?: string
          ticket_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_activity_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_internal: boolean | null
          sender: string
          ticket_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          sender?: string
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          sender?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_agent: string | null
          client_id: string | null
          client_name: string | null
          created_at: string
          department: string | null
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"] | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          tags: string[] | null
          ticket_number: string
          type: Database["public"]["Enums"]["ticket_type"] | null
          updated_at: string
        }
        Insert: {
          assigned_agent?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject: string
          tags?: string[] | null
          ticket_number: string
          type?: Database["public"]["Enums"]["ticket_type"] | null
          updated_at?: string
        }
        Update: {
          assigned_agent?: string | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          type?: Database["public"]["Enums"]["ticket_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
      client_source:
        | "Referido"
        | "Web"
        | "Redes sociales"
        | "Llamada"
        | "Evento"
        | "Otro"
      client_status: "Activo" | "Inactivo" | "Prospecto" | "Suspendido"
      doc_type:
        | "RFC"
        | "INE"
        | "Contrato"
        | "Otro"
        | "NIT"
        | "CC"
        | "CE"
        | "Pasaporte"
        | "RUC"
      event_priority: "alta" | "media" | "baja"
      event_type: "reunión" | "tarea" | "soporte" | "recordatorio" | "general"
      interaction_type: "Llamada" | "Correo" | "Reunión" | "Nota" | "Soporte"
      invoice_status:
        | "Borrador"
        | "Enviada"
        | "Pagada"
        | "Parcial"
        | "Vencida"
        | "Cancelada"
      monitor_frequency: "30s" | "1m" | "5m" | "15m" | "30m" | "1h"
      movement_status: "Pendiente" | "Confirmado"
      movement_type: "Ingreso" | "Gasto"
      payment_method_type:
        | "Efectivo"
        | "Transferencia"
        | "Tarjeta"
        | "Nequi"
        | "Daviplata"
        | "PayPal"
        | "Otro"
      product_status: "Activo" | "Pausado" | "Descontinuado"
      product_type: "Producto" | "Servicio"
      project_status:
        | "En progreso"
        | "Completado"
        | "Pausado"
        | "Cancelado"
        | "Idea"
        | "Planeación"
      quote_status:
        | "Borrador"
        | "Enviada"
        | "Aceptada"
        | "Rechazada"
        | "Convertida"
        | "Vencida"
      resource_status: "Operativo" | "Degradado" | "Caído" | "Mantenimiento"
      resource_type: "Servidor" | "API" | "Web" | "Base de datos" | "Servicio"
      task_status: "pendiente" | "en_progreso" | "revision" | "completada"
      ticket_priority: "Baja" | "Media" | "Alta" | "Urgente"
      ticket_status:
        | "Abierto"
        | "En progreso"
        | "Esperando"
        | "Resuelto"
        | "Cerrado"
      ticket_type: "Soporte" | "Bug" | "Feature" | "Consulta"
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
      client_source: [
        "Referido",
        "Web",
        "Redes sociales",
        "Llamada",
        "Evento",
        "Otro",
      ],
      client_status: ["Activo", "Inactivo", "Prospecto", "Suspendido"],
      doc_type: [
        "RFC",
        "INE",
        "Contrato",
        "Otro",
        "NIT",
        "CC",
        "CE",
        "Pasaporte",
        "RUC",
      ],
      event_priority: ["alta", "media", "baja"],
      event_type: ["reunión", "tarea", "soporte", "recordatorio", "general"],
      interaction_type: ["Llamada", "Correo", "Reunión", "Nota", "Soporte"],
      invoice_status: [
        "Borrador",
        "Enviada",
        "Pagada",
        "Parcial",
        "Vencida",
        "Cancelada",
      ],
      monitor_frequency: ["30s", "1m", "5m", "15m", "30m", "1h"],
      movement_status: ["Pendiente", "Confirmado"],
      movement_type: ["Ingreso", "Gasto"],
      payment_method_type: [
        "Efectivo",
        "Transferencia",
        "Tarjeta",
        "Nequi",
        "Daviplata",
        "PayPal",
        "Otro",
      ],
      product_status: ["Activo", "Pausado", "Descontinuado"],
      product_type: ["Producto", "Servicio"],
      project_status: [
        "En progreso",
        "Completado",
        "Pausado",
        "Cancelado",
        "Idea",
        "Planeación",
      ],
      quote_status: [
        "Borrador",
        "Enviada",
        "Aceptada",
        "Rechazada",
        "Convertida",
        "Vencida",
      ],
      resource_status: ["Operativo", "Degradado", "Caído", "Mantenimiento"],
      resource_type: ["Servidor", "API", "Web", "Base de datos", "Servicio"],
      task_status: ["pendiente", "en_progreso", "revision", "completada"],
      ticket_priority: ["Baja", "Media", "Alta", "Urgente"],
      ticket_status: [
        "Abierto",
        "En progreso",
        "Esperando",
        "Resuelto",
        "Cerrado",
      ],
      ticket_type: ["Soporte", "Bug", "Feature", "Consulta"],
    },
  },
} as const
