export interface VendorHistoryItem {
  date: string;
  note: string;
  amount: number;
}

export interface VendorInfo {
  key: string;
  name: string;
  initials: string;
  active: boolean;
  vendorId: string;
  riskLevel: string;
  riskScore: number;
  ytdSpend: string;
  ytdTrend: string;
  avgTransaction: string;
  avgNote: string;
  summary: string;
  history: VendorHistoryItem[];
}

export interface TransactionRow {
  id: string;
  date: string;
  description: string;
  category: string;
  division: string;
  vendorKey: string;
  vendorName: string;
  amount: number;
  type: string;
  aiStatus: string;
}

export interface ChatRow {
  vendor: string;
  variance: string;
  category: string;
  risk: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  insight?: string;
  table?: {
    columns: string[];
    rows: ChatRow[];
  };
}

export interface Finding {
  id: string;
  title: string;
  score: number;
  severity: string;
  detectedBy: string;
  detectedAt: string;
  explanation: string;
  evidence: Array<{ icon: string; label: string; value: string; tone: string }>;
  transactions: Array<{ id: string; amount: string; status: string }>;
  audit: Array<{ agent: string; note: string; time: string }>;
}
