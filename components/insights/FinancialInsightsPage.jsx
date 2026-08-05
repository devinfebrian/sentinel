import DashboardShell from '@/components/layout/DashboardShell';

export default function FinancialInsightsPage() {
  const periodSelect = (
    <select className="bg-white border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg shadow-sm py-2 pl-3 pr-8 focus:ring-primary focus:border-primary">
      <option>Q3 2023 - YTD</option>
      <option>Q2 2023</option>
      <option>FY 2022</option>
    </select>
  );

  const actions = (
    <div className="flex items-center gap-4">
      <div className="flex bg-surface-container-low rounded-lg p-1">
        <button
          type="button"
          className="px-4 py-1.5 rounded-md bg-white shadow-sm font-label-sm text-label-sm text-primary-container font-semibold"
        >
          Actuals
        </button>
        <button
          type="button"
          className="px-4 py-1.5 rounded-md font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          AI Forecast
        </button>
      </div>
      {periodSelect}
    </div>
  );

  return (
    <DashboardShell
      title="Financial Insights"
      subtitle="Deep-dive analytics and AI-driven forecasting."
      placeholder="Search financial data..."
      actions={actions}
    >
      <div className="grid grid-cols-12 gap-gutter-grid">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-background">Revenue Analytics</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Global vs Division performance</p>
            </div>
            <button type="button" className="text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="h-72 w-full flex items-end gap-2 relative">
            <div className="absolute inset-0 flex flex-col justify-between text-on-surface-variant font-label-sm text-label-sm opacity-50 pb-6 pointer-events-none">
              <div className="border-b border-surface-dim w-full h-0 flex items-center"><span className="bg-white pr-2 -mt-4">$150M</span></div>
              <div className="border-b border-surface-dim w-full h-0 flex items-center"><span className="bg-white pr-2 -mt-4">$100M</span></div>
              <div className="border-b border-surface-dim w-full h-0 flex items-center"><span className="bg-white pr-2 -mt-4">$50M</span></div>
              <div className="w-full h-0 flex items-center"><span className="bg-white pr-2 -mt-4">$0M</span></div>
            </div>
            <div className="flex-1 flex justify-center items-end gap-1 h-full pb-6 z-10 pl-12 group">
              <div className="w-1/2 bg-secondary-fixed h-[40%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
              <div className="w-1/2 bg-primary-container h-[60%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
            </div>
            <div className="flex-1 flex justify-center items-end gap-1 h-full pb-6 z-10 group">
              <div className="w-1/2 bg-secondary-fixed h-[50%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
              <div className="w-1/2 bg-primary-container h-[70%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
            </div>
            <div className="flex-1 flex justify-center items-end gap-1 h-full pb-6 z-10 group">
              <div className="w-1/2 bg-secondary-fixed h-[45%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
              <div className="w-1/2 bg-primary-container h-[65%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
            </div>
            <div className="flex-1 flex justify-center items-end gap-1 h-full pb-6 z-10 group">
              <div className="w-1/2 bg-secondary-fixed h-[70%] rounded-t-sm group-hover:opacity-80 transition-opacity"></div>
              <div className="w-1/2 bg-primary-container h-[90%] rounded-t-sm group-hover:opacity-80 transition-opacity relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">$142M</div>
              </div>
            </div>
            <div className="absolute bottom-0 w-full flex justify-between pl-12 pr-4 text-on-surface-variant font-label-sm text-label-sm">
              <span className="flex-1 text-center">APAC</span>
              <span className="flex-1 text-center">EMEA</span>
              <span className="flex-1 text-center">LATAM</span>
              <span className="flex-1 text-center text-primary font-bold">NA</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary-fixed"></div><span className="font-label-sm text-label-sm">Division Target</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary-container"></div><span className="font-label-sm text-label-sm">Global Actual</span></div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border-l-2 border-[#EDFF8C] ai-wash flex flex-col">
          <div className="p-padding-card flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-tertiary-container">
                <span className="material-symbols-outlined">auto_awesome</span>
                <h3 className="font-headline-md text-headline-md">AI Forecast</h3>
              </div>
              <span className="bg-tertiary-fixed text-tertiary-container font-label-sm text-label-sm px-2 py-1 rounded-full border border-tertiary-fixed-dim">94% Confidence</span>
            </div>
            <div className="mb-6">
              <p className="font-display-lg text-display-lg text-on-background">$18.4M</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Predicted Q4 Operating Expense reduction if current optimization strategies hold.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-surface-dim pb-2">
                <span className="font-body-md text-body-md text-on-surface-variant">Cloud Infrastructure</span>
                <span className="font-label-sm text-label-sm text-tertiary-container">-$4.2M</span>
              </div>
              <div className="flex items-center justify-between border-b border-surface-dim pb-2">
                <span className="font-body-md text-body-md text-on-surface-variant">Vendor Consolidation</span>
                <span className="font-label-sm text-label-sm text-tertiary-container">-$10.1M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface-variant">Travel &amp; Entertainment</span>
                <span className="font-label-sm text-label-sm text-tertiary-container">-$4.1M</span>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-surface-dim bg-white rounded-b-xl flex justify-center">
            <button type="button" className="text-tertiary-container font-label-sm text-label-sm hover:underline">
              View Detailed Model
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
