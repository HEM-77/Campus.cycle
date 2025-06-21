export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          roll_number: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          roll_number: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          roll_number?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cycles: {
        Row: {
          id: string;
          owner_id: string;
          model: string;
          color: string;
          device_id: string;
          is_locked: boolean;
          last_location: any;
          last_updated: string;
          created_at: string;
          firmware_version: string | null;
          battery_level: number | null;
          signal_strength: number | null;
          last_sync: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          model: string;
          color: string;
          device_id: string;
          is_locked?: boolean;
          last_location?: any;
          last_updated?: string;
          created_at?: string;
          firmware_version?: string | null;
          battery_level?: number | null;
          signal_strength?: number | null;
          last_sync?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          model?: string;
          color?: string;
          device_id?: string;
          is_locked?: boolean;
          last_location?: any;
          last_updated?: string;
          created_at?: string;
          firmware_version?: string | null;
          battery_level?: number | null;
          signal_strength?: number | null;
          last_sync?: string;
        };
      };
      tracking_logs: {
        Row: {
          id: string;
          cycle_id: string;
          event_type: string;
          location: any;
          data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          event_type: string;
          location?: any;
          data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          cycle_id?: string;
          event_type?: string;
          location?: any;
          data?: any;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_cycle_stats: {
        Args: { p_cycle_id: string };
        Returns: {
          total_distance: number;
          total_rides: number;
          last_location: any;
          last_updated: string;
        };
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
}