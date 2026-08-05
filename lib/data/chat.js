// Mock data + assistant reply builder for the FinAnalyst AI workspace

export const suggestedPrompts = [
  'Which vendors had unusual spending this month?',
  'Summarize Q3 expense trends by division',
  'Show me recent high-risk anomalies',
  'Break down spending for AWS this year',
];

export const initialMessages = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      'Hi! I\'m FinAnalyst AI. I can help you explore Sentinel\'s financial intelligence — anomalies, vendor risk, expense trends, and more. What would you like to dig into?',
    insight: 'Ready to analyze your latest ledger batch.',
  },
];

function buildTableReply(query) {
  const normalized = query.toLowerCase();

  if (normalized.includes('vendor') && (normalized.includes('unusual') || normalized.includes('spike'))) {
    return {
      insight: 'Unusual spend detected on 3 vendors this month.',
      table: {
        columns: ['Vendor', 'Variance vs avg', 'Category', 'Risk'],
        rows: [
          { vendor: 'Acme Corp', variance: '+320%', category: 'Professional Services', risk: 'High' },
          { vendor: 'CloudTech Solutions', variance: '+45%', category: 'Infrastructure', risk: 'High' },
          { vendor: 'Apex Marketing', variance: '+18%', category: 'Ad Spend', risk: 'Medium' },
        ],
      },
    };
  }

  if (normalized.includes('q3') || normalized.includes('trend') || normalized.includes('division')) {
    return {
      insight: 'Q3 expense grew 5% QoQ, concentrated in North America and EMEA.',
      table: {
        columns: ['Division', 'Q3 Spend', 'QoQ change', 'Share'],
        rows: [
          { vendor: 'North America', variance: '$1.18M', category: '+6%', risk: '42%' },
          { vendor: 'EMEA', variance: '$0.75M', category: '+4%', risk: '27%' },
          { vendor: 'APAC', variance: '$0.53M', category: '+9%', risk: '19%' },
        ],
      },
    };
  }

  if (normalized.includes('anomal') || normalized.includes('risk') || normalized.includes('finding')) {
    return {
      insight: '3 anomalies are open. One is high-risk and ready for manual review.',
      table: {
        columns: ['Finding', 'Severity', 'Detected by', 'Status'],
        rows: [
          { vendor: 'Anomaly #842', variance: 'High', category: 'Investigator 2', risk: 'Pending Review' },
          { vendor: 'Anomaly #841', variance: 'Medium', category: 'Investigator 1', risk: 'Investigating' },
          { vendor: 'Anomaly #840', variance: 'Low', category: 'Investigator 1', risk: 'Resolved' },
        ],
      },
    };
  }

  if (normalized.includes('aws') || normalized.includes('amazon')) {
    return {
      insight: 'AWS spend is up 12% YoY, consistent with last year — no anomalies detected.',
      table: {
        columns: ['Metric', 'Value', 'Trend', 'Status'],
        rows: [
          { vendor: 'YTD spend', variance: '$148,500', category: '+12% vs LY', risk: 'Healthy' },
          { vendor: 'Avg transaction', variance: '$12,375', category: 'Monthly', risk: 'Healthy' },
        ],
      },
    };
  }

  return null;
}

export function buildAssistantReply(query) {
  const table = buildTableReply(query);
  const base =
    table == null
      ? 'I\'ve scanned the latest ledger batch for that. Nothing stands out as unusual right now — but I can dig deeper if you narrow the scope.'
      : 'Here\'s what I found in the latest ledger batch:';
  return {
    content: base,
    ...(table ? { insight: table.insight, table } : {}),
  };
}
