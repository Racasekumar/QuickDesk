export type Role = "employee" | "agent";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export type TicketCategory = "IT" | "HR" | "Finance" | "Admin" | "Other";
export type TicketPriority = "Low" | "Medium" | "High";
export type TicketStatus = "open" | "resolved";

export interface TicketCreator {
  id: number;
  full_name: string;
  email: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  attachment_filename: string | null;
  status: TicketStatus;
  ai_category: TicketCategory | null;
  ai_priority: TicketPriority | null;
  final_category: TicketCategory | null;
  final_priority: TicketPriority | null;
  created_at: string;
  resolved_at: string | null;
  creator: TicketCreator;
}

export interface Citation {
  title: string;
  filename: string;
  last_updated: string;
}

export interface AuditLog {
  id: number;
  field: "category" | "priority" | string;
  from_value: string;
  to_value: string;
  changed_at: string;
  agent: TicketCreator;
}

export interface TicketDetail extends Ticket {
  final_category: TicketCategory | null;
  final_priority: TicketPriority | null;
  ai_draft_reply: string | null;
  ai_draft_citations: Citation[];
  final_reply: string | null;
  audit_logs: AuditLog[];
}

export interface ClassificationUpdate {
  final_category?: TicketCategory;
  final_priority?: TicketPriority;
}

export interface ReplyPayload {
  final_reply: string;
  final_category?: TicketCategory;
  final_priority?: TicketPriority;
}

export interface Metrics {
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  median_resolution_seconds: number | null;
  ai_override_percentage: number;
}
