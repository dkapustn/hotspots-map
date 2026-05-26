export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          visit_radius_m: number;
          theme: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          visit_radius_m?: number;
          theme?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          visit_radius_m?: number;
          theme?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      spots: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          latitude: number;
          longitude: number;
          photo_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          latitude: number;
          longitude: number;
          photo_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          latitude?: number;
          longitude?: number;
          photo_path?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      visits: {
        Row: {
          id: string;
          user_id: string;
          spot_id: string;
          visited_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          spot_id: string;
          visited_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          spot_id?: string;
          visited_at?: string;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          user_id: string;
          spot_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          spot_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          spot_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          spot_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          spot_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          spot_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      spot_stats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          latitude: number;
          longitude: number;
          photo_path: string;
          created_at: string;
          likes_count: number;
          visits_count: number;
          comments_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Spot = Database["public"]["Tables"]["spots"]["Row"];
export type Visit = Database["public"]["Tables"]["visits"]["Row"];
export type Like = Database["public"]["Tables"]["likes"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type SpotStats = Database["public"]["Views"]["spot_stats"]["Row"];

export type SpotWithAuthor = Spot & {
  author: Pick<Profile, "id" | "username" | "avatar_url"> | null;
  photo_url: string;
};

export type SpotStatsWithAuthor = SpotStats & {
  author: Pick<Profile, "id" | "username" | "avatar_url"> | null;
  photo_url: string;
};
