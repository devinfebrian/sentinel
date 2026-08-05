import React from 'react';
import DashboardShell from '@/components/layout/DashboardShell';

const actions = (
  <div className="flex gap-3">
    <button className="bg-white border border-outline-variant text-on-surface font-label-md text-label-md px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
      <span className="material-symbols-outlined text-sm">flag</span> Flag Selected
    </button>
    <button className="bg-white border border-outline-variant text-on-surface font-label-md text-label-md px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
      <span className="material-symbols-outlined text-sm">download</span> Export
    </button>
  </div>
);

export default function TransactionsPage() {
  return (
    <DashboardShell
      title="Financial Operations"
      subtitle="Review and manage recent transactions with AI-assisted risk analysis."
      placeholder="Search transactions..."
      actions={actions}
    >
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-padding-card mb-stack-md flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded bg-surface-container-low font-body-sm text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
            placeholder="Search transactions..."
            type="text"
          />
        </div>
        <div className="flex gap-2">
          <select className="border border-outline-variant rounded bg-surface-container-low font-body-sm text-body-sm px-3 py-2 outline-none focus:border-primary">
            <option>Date Range</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
          <select className="border border-outline-variant rounded bg-surface-container-low font-body-sm text-body-sm px-3 py-2 outline-none focus:border-primary">
            <option>Division</option>
            <option>Marketing</option>
            <option>Engineering</option>
          </select>
          <select className="border border-outline-variant rounded bg-surface-container-low font-body-sm text-body-sm px-3 py-2 outline-none focus:border-primary">
            <option>Category</option>
            <option>Software</option>
            <option>Travel</option>
          </select>
          <button className="text-primary font-label-sm text-label-sm flex items-center gap-1 hover:underline ml-2">
            <span className="material-symbols-outlined text-sm">filter_list</span> More Filters
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low font-label-md text-label-md text-on-surface-variant">
              <th className="p-4 w-12">
                <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
              </th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Division</th>
              <th className="p-4 font-semibold">Vendor</th>
              <th className="p-4 font-semibold text-right">Amount</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">AI Risk</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant/50">
            <tr className="hover:bg-surface-container-low transition-colors cursor-pointer group">
              <td className="p-4">
                <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
              </td>
              <td className="p-4 text-on-surface-variant">Oct 24, 2023</td>
              <td className="p-4 font-medium text-on-surface">Cloud Server Expansion APAC</td>
              <td className="p-4 text-on-surface-variant">Engineering</td>
              <td className="p-4 text-on-surface-variant">GlobalTech Infra</td>
              <td className="p-4 text-right font-medium font-mono text-on-surface">$145,200.00</td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-outline"></span> Pending
                </span>
              </td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-error-container text-on-error-container text-xs font-bold border border-error/20">
                  <span className="material-symbols-outlined text-[14px]">warning</span> 92%
                </span>
              </td>
            </tr>
            <tr className="hover:bg-surface-container-low transition-colors cursor-pointer group">
              <td className="p-4">
                <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
              </td>
              <td className="p-4 text-on-surface-variant">Oct 23, 2023</td>
              <td className="p-4 font-medium text-on-surface">Q4 Marketing Campaign</td>
              <td className="p-4 text-on-surface-variant">Marketing</td>
              <td className="p-4 text-on-surface-variant">AdWorks Digital</td>
              <td className="p-4 text-right font-medium font-mono text-on-surface">$45,000.00</td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Cleared
                </span>
              </td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded ai-wash text-on-tertiary-fixed-variant text-xs font-bold border border-tertiary-fixed-dim/30">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> 12%
                </span>
              </td>
            </tr>
            <tr className="hover:bg-surface-container-low transition-colors cursor-pointer group">
              <td className="p-4">
                <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
              </td>
              <td className="p-4 text-on-surface-variant">Oct 22, 2023</td>
              <td className="p-4 font-medium text-on-surface">Annual Legal Retainer</td>
              <td className="p-4 text-on-surface-variant">Legal</td>
              <td className="p-4 text-on-surface-variant">Smith &amp; Associates</td>
              <td className="p-4 text-right font-medium font-mono text-on-surface">$120,000.00</td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-primary"></span> Cleared
                </span>
              </td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded ai-wash text-on-tertiary-fixed-variant text-xs font-bold border border-tertiary-fixed-dim/30">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> 05%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant">
          <span>Showing 1-3 of 124 transactions</span>
          <div className="flex gap-2">
            <button className="px-2 py-1 border border-outline-variant rounded hover:bg-surface-container disabled:opacity-50" disabled>Prev</button>
            <button className="px-2 py-1 border border-outline-variant rounded hover:bg-surface-container">Next</button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
