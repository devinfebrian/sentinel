// Mock data for the Financial Analyst Insights workspace

export const pipelineStages = [
  { label: 'Investigator 1', weight: 0.6, status: 'complete' },
  { label: 'Investigator 2', weight: 0.6, status: 'complete' },
  { label: 'Reviewer', weight: 0.9, status: 'active' },
  { label: 'Synthesizer', weight: 1.0, status: 'pending' },
];

export const findings = [
  {
    id: 'finding-001',
    title: 'Anomaly #842',
    score: 92,
    severity: 'high',
    detectedBy: 'Investigator 2',
    detectedAt: 'Oct 12, 2023',
    explanation:
      'Invoice amount exceeds 12-month average by 3.2x for Acme Corp Consulting. Occurred 3 days after month-end close, matching a pattern associated with reserve reversals.',
    evidence: [
      { icon: 'receipt_long', label: 'Invoice value', value: '$45,000', tone: 'error' },
      { icon: 'insights', label: 'vs 12mo avg', value: '+320%', tone: 'error' },
      { icon: 'schedule', label: 'Posting window', value: 'Month-end', tone: 'warning' },
    ],
    transactions: [
      { id: 'TX-0092', amount: '$45,000', status: 'high' },
      { id: 'TX-0087', amount: '$39,000', status: 'medium' },
    ],
    audit: [
      { agent: 'Investigator 1', note: 'Cross-referenced PO #22981. PO exists but exceeds cap by $18k.', time: 'Oct 11, 09:14' },
      { agent: 'Investigator 2', note: 'Similar pattern seen on Acme in March & June. Flagging recurrence.', time: 'Oct 12, 08:02' },
      { agent: 'Reviewer', note: 'Confirmed. Route to Fraud Ops for manual review.', time: 'Oct 12, 11:40' },
    ],
  },
  {
    id: 'finding-002',
    title: 'Anomaly #841',
    score: 76,
    severity: 'medium',
    detectedBy: 'Investigator 1',
    detectedAt: 'Oct 10, 2023',
    explanation:
      'CloudTech usage spike of 45% month-over-month without a matching change in contract scope. Rate card suggests a 20% per-unit increase was silently applied.',
    evidence: [
      { icon: 'trending_up', label: 'MoM change', value: '+45%', tone: 'warning' },
      { icon: 'contract', label: 'Contract scope', value: 'Unchanged', tone: 'warning' },
      { icon: 'attach_money', label: 'Est. overage', value: '$9,400', tone: 'error' },
    ],
    transactions: [
      { id: 'TX-0085', amount: '$28,400', status: 'medium' },
      { id: 'TX-0062', amount: '$19,500', status: 'low' },
    ],
    audit: [
      { agent: 'Investigator 1', note: 'Usage telemetry pulled. GPU hours up 2.1x vs average.', time: 'Oct 10, 13:21' },
      { agent: 'Investigator 2', note: 'No new resource group found. Rate card diff confirmed.', time: 'Oct 10, 16:05' },
    ],
  },
  {
    id: 'finding-003',
    title: 'Anomaly #840',
    score: 58,
    severity: 'low',
    detectedBy: 'Investigator 1',
    detectedAt: 'Oct 08, 2023',
    explanation:
      'Apex Marketing ad placements show a 12% budget overspend with 3 incomplete approval records. Likely an approval workflow gap rather than fraud.',
    evidence: [
      { icon: 'campaign', label: 'Budget used', value: '112%', tone: 'warning' },
      { icon: 'approval', label: 'Missing approvals', value: '3 of 11', tone: 'warning' },
    ],
    transactions: [
      { id: 'TX-0071', amount: '$4,900', status: 'low' },
      { id: 'TX-0066', amount: '$3,100', status: 'low' },
    ],
    audit: [
      { agent: 'Investigator 1', note: 'Media plan reconciled. Overspend is real but explainable.', time: 'Oct 08, 10:45' },
      { agent: 'Reviewer', note: 'Auto-closed with recommendation to tighten approvals.', time: 'Oct 09, 09:12' },
    ],
  },
];
