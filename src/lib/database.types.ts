/** Hand-maintained Supabase types for Phase 2. Replace via `supabase gen types` when CLI is linked. */
export type MembershipStatus =
  | "draft" | "submitted" | "under_review" | "info_required" | "verification_in_progress"
  | "approved" | "rejected" | "suspended" | "expired";
export type ApplicationKind = "seller" | "buyer";
export type VerificationStatus =
  | "not_started" | "in_progress" | "info_required" | "recommended" | "approved"
  | "rejected" | "expired" | "suspended";
export type OrgMemberRole = "owner" | "admin" | "member" | "viewer";
export type PlatformRole =
  | "super_admin" | "operations" | "verification_reviewer" | "verification_approver"
  | "finance" | "content_editor" | "support";
export type ModerationStatus = "draft" | "pending_review" | "approved" | "rejected" | "archived";
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Rel = { foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; email: string; phone: string | null; avatar_url: string | null; locale: string; created_at: string; updated_at: string };
        Insert: { id: string; full_name?: string; email?: string; phone?: string | null; avatar_url?: string | null; locale?: string; created_at?: string; updated_at?: string };
        Update: { id?: string; full_name?: string; email?: string; phone?: string | null; avatar_url?: string | null; locale?: string; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      platform_roles: {
        Row: { user_id: string; role: PlatformRole; created_at: string };
        Insert: { user_id: string; role: PlatformRole; created_at?: string };
        Update: { user_id?: string; role?: PlatformRole; created_at?: string };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string; legal_name: string; trading_name: string | null; registration_country: string;
          registration_number: string | null; legal_address: Json; contact_email: string | null;
          contact_phone: string | null; website: string | null; industry: string | null; description: string | null;
          can_buy: boolean; can_sell: boolean; membership_status: MembershipStatus;
          membership_expires_at: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; legal_name: string; trading_name?: string | null; registration_country: string;
          registration_number?: string | null; legal_address?: Json; contact_email?: string | null;
          contact_phone?: string | null; website?: string | null; industry?: string | null; description?: string | null;
          can_buy?: boolean; can_sell?: boolean; membership_status?: MembershipStatus;
          membership_expires_at?: string | null; created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; legal_name?: string; trading_name?: string | null; registration_country?: string;
          registration_number?: string | null; legal_address?: Json; contact_email?: string | null;
          contact_phone?: string | null; website?: string | null; industry?: string | null; description?: string | null;
          can_buy?: boolean; can_sell?: boolean; membership_status?: MembershipStatus;
          membership_expires_at?: string | null; created_at?: string; updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: { organization_id: string; user_id: string; role: OrgMemberRole; is_active: boolean; invited_by: string | null; created_at: string };
        Insert: { organization_id: string; user_id: string; role?: OrgMemberRole; is_active?: boolean; invited_by?: string | null; created_at?: string };
        Update: { organization_id?: string; user_id?: string; role?: OrgMemberRole; is_active?: boolean; invited_by?: string | null; created_at?: string };
        Relationships: [
          { foreignKeyName: "organization_members_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
        ];
      };
      membership_applications: {
        Row: {
          id: string; organization_id: string; kind: ApplicationKind; status: MembershipStatus;
          payload: Json; submitted_by: string | null; submitted_at: string | null;
          reviewed_by: string | null; review_notes: string | null; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; organization_id: string; kind: ApplicationKind; status?: MembershipStatus;
          payload?: Json; submitted_by?: string | null; submitted_at?: string | null;
          reviewed_by?: string | null; review_notes?: string | null; created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; organization_id?: string; kind?: ApplicationKind; status?: MembershipStatus;
          payload?: Json; submitted_by?: string | null; submitted_at?: string | null;
          reviewed_by?: string | null; review_notes?: string | null; created_at?: string; updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "membership_applications_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
        ];
      };
      verification_cases: {
        Row: {
          id: string; organization_id: string; application_id: string | null; kind: ApplicationKind;
          status: VerificationStatus; reviewer_id: string | null; approver_id: string | null;
          recommendation: string | null; decision_notes: string | null; expires_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; organization_id: string; application_id?: string | null; kind: ApplicationKind;
          status?: VerificationStatus; reviewer_id?: string | null; approver_id?: string | null;
          recommendation?: string | null; decision_notes?: string | null; expires_at?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: {
          id?: string; organization_id?: string; application_id?: string | null; kind?: ApplicationKind;
          status?: VerificationStatus; reviewer_id?: string | null; approver_id?: string | null;
          recommendation?: string | null; decision_notes?: string | null; expires_at?: string | null;
          created_at?: string; updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "verification_cases_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
        ];
      };
      verification_documents: {
        Row: {
          id: string; case_id: string; organization_id: string; doc_type: string; storage_path: string;
          file_name: string; mime_type: string; size_bytes: number; status: ModerationStatus;
          reviewer_notes: string | null; uploaded_by: string | null; created_at: string;
        };
        Insert: {
          id?: string; case_id: string; organization_id: string; doc_type: string; storage_path: string;
          file_name: string; mime_type: string; size_bytes: number; status?: ModerationStatus;
          reviewer_notes?: string | null; uploaded_by?: string | null; created_at?: string;
        };
        Update: {
          id?: string; case_id?: string; organization_id?: string; doc_type?: string; storage_path?: string;
          file_name?: string; mime_type?: string; size_bytes?: number; status?: ModerationStatus;
          reviewer_notes?: string | null; uploaded_by?: string | null; created_at?: string;
        };
        Relationships: [];
      };
      inspections: {
        Row: {
          id: string; case_id: string; organization_id: string; inspector_id: string | null;
          scheduled_at: string | null; completed_at: string | null; location: string | null;
          findings: string | null; evidence_paths: string[]; outcome: string | null; created_at: string;
        };
        Insert: {
          id?: string; case_id: string; organization_id: string; inspector_id?: string | null;
          scheduled_at?: string | null; completed_at?: string | null; location?: string | null;
          findings?: string | null; evidence_paths?: string[]; outcome?: string | null; created_at?: string;
        };
        Update: {
          id?: string; case_id?: string; organization_id?: string; inspector_id?: string | null;
          scheduled_at?: string | null; completed_at?: string | null; location?: string | null;
          findings?: string | null; evidence_paths?: string[]; outcome?: string | null; created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "inspections_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
        ];
      };
      audit_logs: {
        Row: {
          id: number; actor_id: string | null; organization_id: string | null; action: string;
          entity_type: string; entity_id: string | null; metadata: Json; created_at: string;
        };
        Insert: {
          id?: number; actor_id?: string | null; organization_id?: string | null; action: string;
          entity_type: string; entity_id?: string | null; metadata?: Json; created_at?: string;
        };
        Update: {
          id?: number; actor_id?: string | null; organization_id?: string | null; action?: string;
          entity_type?: string; entity_id?: string | null; metadata?: Json; created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_organization_with_owner: {
        Args: {
          p_legal_name: string;
          p_registration_country: string;
          p_trading_name?: string | null;
          p_registration_number?: string | null;
          p_contact_email?: string | null;
          p_contact_phone?: string | null;
          p_can_buy?: boolean;
          p_can_sell?: boolean;
        };
        Returns: string;
      };
    };
    Enums: {
      membership_status: MembershipStatus;
      application_kind: ApplicationKind;
      verification_status: VerificationStatus;
      org_member_role: OrgMemberRole;
      platform_role: PlatformRole;
      moderation_status: ModerationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];

/** Silence unused Rel helper for hand-maintained Relationships. */
export type _Rel = Rel;
