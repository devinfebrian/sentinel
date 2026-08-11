'use client';

import React from 'react';
import {
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface VendorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string | null;
}

export default function VendorDrawer({ isOpen, onClose, vendorName }: VendorDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for Drawer / Dialogs */}
      <div 
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-30 transition-opacity" 
        onClick={onClose}
      />
      {/* Vendor Details Side-Over Drawer */}
      <div className={`fixed right-0 top-0 h-screen w-[480px] bg-surface-container-lowest shadow-ambient-lvl-2 z-40 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-outline-variant/30 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Drawer Header */}
        <div className="flex justify-between items-start p-6 border-b border-surface-variant">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-lg bg-surface-container-high border border-outline-variant/50 flex items-center justify-center text-xl font-bold text-tertiary">
              {vendorName ? vendorName.substring(0, 2).toUpperCase() : 'VN'}
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{vendorName || 'Vendor Details'}</h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-secondary-container" />
                Active Vendor ID: V-8472
              </p>
            </div>
          </div>
          <button 
            className="text-on-surface-variant hover:text-on-surface bg-surface-container hover:bg-surface-container-high rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <XMarkIcon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        {/* Drawer Content Scrollable */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-stack-md bg-background">
          {/* Risk Assessment Card (Kinetic Style) */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient-lvl-1 border border-outline-variant/30 ai-glow relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
              <ShieldCheckIcon aria-hidden="true" className="h-6 w-6 text-[120px]" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h4 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">AI Risk Assessment</h4>
                <div className="flex items-center gap-2">
                  <span className="font-kpi-value text-headline-lg font-bold text-on-surface">Low Risk</span>
                  <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary-container/50 text-on-secondary-container border border-secondary-container">Score: 92/100</div>
                </div>
              </div>
            </div>
            <p className="font-body-md text-[13px] text-on-surface-variant leading-relaxed mb-3 relative z-10">
              Vendor transaction patterns remain highly consistent with historical data. No anomalies detected in the last 12 months. Contract terms align with industry standards for Cloud Infrastructure.
            </p>
            <button className="text-primary font-label-sm text-label-sm hover:underline flex items-center gap-1 relative z-10">
              View Full Audit Trail <ArrowRightIcon aria-hidden="true" className="h-6 w-6 text-[14px]" />
            </button>
          </div>
          {/* Quick Stats Bento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-ambient-lvl-1 border border-outline-variant/30">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">YTD Spend</p>
              <p className="font-headline-md text-headline-md font-semibold text-on-surface">Rp 148.500</p>
              <p className="text-[11px] text-secondary mt-1 flex items-center gap-1"><ArrowTrendingUpIcon aria-hidden="true" className="h-6 w-6 text-[12px]" /> 12% vs LY</p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl shadow-ambient-lvl-1 border border-outline-variant/30">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Avg Transaction</p>
              <p className="font-headline-md text-headline-md font-semibold text-on-surface">Rp 12.375</p>
              <p className="text-[11px] text-on-surface-variant mt-1">Monthly frequency</p>
            </div>
          </div>
          {/* Recent History List */}
          <div>
            <h4 className="font-headline-md text-[18px] font-semibold text-on-surface mb-3">Recent Transactions</h4>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
              <ul className="divide-y divide-surface-variant font-table-data text-[13px]">
                <li className="p-3 flex justify-between items-center hover:bg-surface-container/50 transition-colors">
                  <div>
                    <p className="font-medium text-on-surface">Oct 24, 2023</p>
                    <p className="text-on-surface-variant text-[11px]">AWS US-East Server...</p>
                  </div>
                  <span className="font-medium">-Rp 12.450,00</span>
                </li>
                <li className="p-3 flex justify-between items-center hover:bg-surface-container/50 transition-colors">
                  <div>
                    <p className="font-medium text-on-surface">Sep 24, 2023</p>
                    <p className="text-on-surface-variant text-[11px]">AWS US-East Server...</p>
                  </div>
                  <span className="font-medium">-Rp 12.120,00</span>
                </li>
                <li className="p-3 flex justify-between items-center hover:bg-surface-container/50 transition-colors">
                  <div>
                    <p className="font-medium text-on-surface">Aug 24, 2023</p>
                    <p className="text-on-surface-variant text-[11px]">AWS US-East Server...</p>
                  </div>
                  <span className="font-medium">-Rp 11.890,00</span>
                </li>
              </ul>
              <div className="p-2 text-center bg-surface-container-low border-t border-surface-variant">
                <button className="text-primary font-label-sm text-[11px] font-semibold hover:underline">View All History</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
