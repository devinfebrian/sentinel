// AUTO-GENERATED. Jangan edit. Sumber: snapshot OpenAPI sentinel-agent-server.
// Regenerasi: npm run contract:pull
// Fingerprint: 80338f168eb3f0c6

export const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export const RESOLUTIONS = ["justified", "false_positive", "confirmed_fraud", "escalated"] as const;
export const FINDING_STATUS_FILTERS = ["open", "resolved", "all"] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];
export type Resolution = (typeof RESOLUTIONS)[number];
export type FindingStatusFilter = (typeof FINDING_STATUS_FILTERS)[number];

/** One finding row as served by the agent server. */
export interface FindingRow {
  id: number;
  transaction_id: number;
  /** Every transaction this one finding covers, anchor included. */
  related_transaction_ids: number[];
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  /** Indonesian display text. The UI renders `risk_level` instead. */
  risk_label: string;
  /** Indonesian, one sentence per risk band. */
  recommended_action: string;
  /** Indonesian. The LLM narrative, or a fact-assembled fallback when it failed. */
  description: string;
  resolution: ("justified" | "false_positive" | "confirmed_fraud" | "escalated") | null;
  resolution_note: (string) | null;
  resolved_by: (number) | null;
  resolved_at: (string) | null;
  created_at: string;
  updated_at: (string) | null;
  /** More transactions joined after the narrative was written: the numbers are current, the sentence is not. */
  narrative_stale: boolean;
  evidence: (Record<string, unknown>) | null;
  analysis: (Record<string, unknown>) | null;
}

/** Headline counts for the findings page. */
export interface SummaryRow {
  perlu_tindakan: number;
  perlu_ditinjau: number;
  aman: number;
  gagal: number;
  belum_diperiksa: number;
  total_transaksi: number;
  per_tingkat: Partial<Record<"low" | "medium" | "high" | "critical", number>>;
  selesai: number;
  total_temuan: number;
  /** Null when no finding exists yet — which is not the same as zero percent cleared. */
  clear_rate: (number) | null;
}
