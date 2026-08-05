import DashboardShell from '@/components/layout/DashboardShell';

export default function OverviewDashboard() {
  const actions = (
    <>
      <button
        type="button"
        className="px-4 py-2 bg-white border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm"
      >
        <span className="material-symbols-outlined">download</span>
        Export Report
      </button>
      <button
        type="button"
        className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
      >
        <span className="material-symbols-outlined">search_insights</span>
        New Investigation
      </button>
    </>
  );

  return (
    <DashboardShell
      title="Executive Overview"
      subtitle="Real-time financial synthesis and AI risk analysis."
      placeholder="Search insights..."
      actions={actions}
    >
      <div className="grid grid-cols-12 gap-gutter-grid">
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-gutter-grid">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card flex flex-col md:flex-row gap-8 relative overflow-hidden border-l-2 border-[#EDFF8C] ai-wash">
            <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full border border-[#EDFF8C] flex items-center gap-1 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#EDFF8C]" />
              <span className="font-label-sm text-label-sm text-on-surface">AI Verified</span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-outline-variant/30 pr-8 min-w-[200px]">
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Financial Health Score</p>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-highest"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#EDFF8C"
                    strokeDasharray="94, 100"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="font-display-lg text-display-lg text-on-surface">94</span>
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-[#93A144] mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                +2 pts
              </span>
            </div>
            <div className="flex-1 pt-2">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#93A144]">auto_awesome</span>
                AI Executive Summary
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Revenue velocity remains strong, outperforming Q3 projections by 4.2%. However,
                operational expenses in the logistics sector have shown a minor, unexpected deviation
                from historical baselines. Cash flow stability is optimal, suggesting favorable
                conditions for planned Q4 capital expenditures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter-grid">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card">
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Total Revenue</p>
              <h4 className="font-headline-lg text-headline-lg text-on-surface">$12.4M</h4>
              <div className="mt-4 h-12 w-full opacity-60">
                <svg className="w-full h-full preserve-aspect-ratio-none" viewBox="0 0 100 30">
                  <path
                    d="M0,25 Q10,15 20,20 T40,10 T60,15 T80,5 T100,2"
                    fill="none"
                    stroke="#EDFF8C"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,25 Q10,15 20,20 T40,10 T60,15 T80,5 T100,2 L100,30 L0,30 Z"
                    fill="url(#grad1)"
                    opacity="0.4"
                  />
                  <defs>
                    <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#EDFF8C', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card">
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Expenses</p>
              <h4 className="font-headline-lg text-headline-lg text-on-surface">$4.2M</h4>
              <div className="mt-4 h-12 w-full opacity-60">
                <svg className="w-full h-full preserve-aspect-ratio-none" viewBox="0 0 100 30">
                  <path
                    d="M0,20 Q15,25 30,15 T60,20 T80,10 T100,15"
                    fill="none"
                    stroke="#ba1a1a"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card">
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Cash Flow</p>
              <h4 className="font-headline-lg text-headline-lg text-on-surface text-[#93A144]">+$8.2M</h4>
              <div className="mt-4 h-12 w-full opacity-60">
                <svg className="w-full h-full preserve-aspect-ratio-none" viewBox="0 0 100 30">
                  <path
                    d="M0,15 Q20,10 40,15 T70,5 T100,2"
                    fill="none"
                    stroke="#EDFF8C"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card">
              <p className="font-label-md text-label-md text-on-surface-variant mb-2">Profit Margin</p>
              <h4 className="font-headline-lg text-headline-lg text-on-surface">66%</h4>
              <div className="mt-4 h-12 w-full opacity-60">
                <svg className="w-full h-full preserve-aspect-ratio-none" viewBox="0 0 100 30">
                  <path
                    d="M0,10 Q25,12 50,8 T80,5 T100,2"
                    fill="none"
                    stroke="#EDFF8C"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card h-80 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Revenue Trend &amp; Forecast</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm"
                >
                  1M
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm"
                >
                  YTD
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm"
                >
                  1Y
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-surface-container-lowest rounded border border-outline-variant/30 flex items-center justify-center text-on-surface-variant font-body-sm relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 1000 300">
                <path
                  d="M0,280 C100,250 200,260 300,200 C400,140 500,180 600,100 C700,20 800,80 900,40 L1000,10 L1000,300 L0,300 Z"
                  fill="#EDFF8C"
                />
                <path
                  d="M0,280 C100,250 200,260 300,200 C400,140 500,180 600,100 C700,20 800,80 900,40 L1000,10"
                  fill="none"
                  stroke="#93A144"
                  strokeWidth="4"
                />
                <path
                  d="M900,40 L950,25 L1000,10"
                  fill="none"
                  stroke="#191c1e"
                  strokeDasharray="10,10"
                  strokeWidth="4"
                />
              </svg>
              <span className="z-10 bg-white/80 px-4 py-2 rounded shadow-sm">
                Interactive Line Chart Canvas
              </span>
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-gutter-grid">
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card border-t-4 border-[#EDFF8C]">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">policy</span>
              AI Risk Center
            </h3>
            <div className="bg-surface-container-low rounded-lg p-4 mb-6 flex justify-between items-center">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Overall Risk Score</p>
                <p className="font-headline-md text-headline-md text-[#93A144]">Low (12%)</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#EDFF8C] flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>
            <h4 className="font-label-md text-label-md text-on-surface mb-3">Recent Findings</h4>
            <div className="flex flex-col gap-3">
              <div className="border border-outline-variant/40 rounded-lg p-3 hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded font-label-sm text-label-sm">
                    Anomaly
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">2h ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Unusual vendor payment pattern detected in Region EMEA.
                </p>
              </div>
              <div className="border border-outline-variant/40 rounded-lg p-3 hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="bg-surface-container-highest text-on-surface px-2 py-0.5 rounded font-label-sm text-label-sm">
                    Variance
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">5h ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Q3 server costs exceeded predicted baseline by 8%.
                </p>
              </div>
              <div className="border border-outline-variant/40 rounded-lg p-3 hover:bg-surface-container-low transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded font-label-sm text-label-sm">
                    Anomaly
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">1d ago</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Duplicate invoice probability high for supplier TX-902.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="w-full mt-4 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/30"
            >
              View All Findings
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card flex-1 flex flex-col">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Expense Breakdown</h3>
            <div className="flex-1 flex items-center justify-center relative">
              <svg className="w-48 h-48" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="#EDFF8C"
                  strokeDasharray="160 251"
                  strokeWidth="20"
                />
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="#191c1e"
                  strokeDasharray="60 251"
                  strokeDashoffset={-160}
                  strokeWidth="20"
                />
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="40"
                  stroke="#c4c6d3"
                  strokeDasharray="31 251"
                  strokeDashoffset={-220}
                  strokeWidth="20"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Total</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">$4.2M</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex justify-between items-center font-body-sm text-body-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#EDFF8C]" />
                  <span className="text-on-surface">Operations</span>
                </div>
                <span className="font-label-md text-label-md">64%</span>
              </div>
              <div className="flex justify-between items-center font-body-sm text-body-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#191c1e]" />
                  <span className="text-on-surface">R&amp;D</span>
                </div>
                <span className="font-label-md text-label-md">24%</span>
              </div>
              <div className="flex justify-between items-center font-body-sm text-body-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-outline-variant" />
                  <span className="text-on-surface">Marketing</span>
                </div>
                <span className="font-label-md text-label-md">12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
