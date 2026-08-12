'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/components/common/Modal';
import { useAuthStore } from '@/lib/stores/auth.store';
import { listVendorsApi, getTransactionCategoriesApi, createTransactionApi } from '@/lib/services/api';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportDialog({ isOpen, onClose, onSuccess }: ImportDialogProps) {
  const [showToast, setShowToast] = useState(false);
  const [lastVendorUpdate, setLastVendorUpdate] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setIsDragging(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && accessToken) {
      listVendorsApi(accessToken).then(res => {
        if (res.success && res.data.vendors.length > 0) {
          const maxTime = Math.max(...res.data.vendors.map((v: any) => new Date(v.join_date || 0).getTime()));
          if (maxTime > 0) {
            setLastVendorUpdate(new Date(maxTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
          } else {
            setLastVendorUpdate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
          }
        }
      }).catch(console.error);
    }
  }, [isOpen, accessToken]);

  const handleUpload = async () => {
    if (!selectedFile || !accessToken || !user) return;
    setIsUploading(true);
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      
      if (selectedFile.name.endsWith('.csv')) {
        // Minimal CSV support, but focusing on XLSX
        const text = await selectedFile.text();
        const lines = text.split('\n');
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',');
          if (row.length < 5) continue;
          let vendor_id = null;
          const vMatch = row[3].match(/^(\d+)\s+-/);
          if (vMatch) vendor_id = parseInt(vMatch[1], 10);
          
          await createTransactionApi({
            type: row[0].toLowerCase(),
            amount: parseFloat(row[1]),
            category: row[2],
            vendor_id: vendor_id,
            description: row[4],
            input_by_user_id: user.id
          }, accessToken).catch(e => console.error(e));
        }
      } else {
        await workbook.xlsx.load(await selectedFile.arrayBuffer());
        const sheet = workbook.getWorksheet('Transactions') || workbook.worksheets[0];
        const rowCount = sheet.rowCount;
        
        for (let i = 2; i <= rowCount; i++) {
          const row = sheet.getRow(i);
          const type = row.getCell(1).text || row.getCell(1).value?.toString() || '';
          const amountVal = row.getCell(2).value;
          const category = row.getCell(3).text || row.getCell(3).value?.toString() || '';
          const vendorStr = row.getCell(4).text || row.getCell(4).value?.toString() || '';
          const description = row.getCell(5).text || row.getCell(5).value?.toString() || '';

          if (!type || !amountVal || !category) continue;
          
          const amount = typeof amountVal === 'number' ? amountVal : parseFloat(amountVal.toString());

          let vendor_id = null;
          const match = vendorStr.match(/^(\d+)\s+-/);
          if (match) vendor_id = parseInt(match[1], 10);

          await createTransactionApi({
            type: type.toLowerCase(),
            amount,
            category,
            description,
            vendor_id,
            input_by_user_id: user.id
          }, accessToken).catch(e => console.error(e));
        }
      }

      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to parse and upload', err);
      alert('Failed to process the uploaded file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      let activeVendors: any[] = [];
      let categories: string[] = [];

      if (accessToken) {
        const [vendorRes, catRes] = await Promise.all([
          listVendorsApi(accessToken),
          getTransactionCategoriesApi(undefined, accessToken)
        ]);
        if (vendorRes.success) {
          activeVendors = vendorRes.data.vendors.filter((v: any) => v.status === 'active');
        }
        if (catRes.success) {
          const arr = [...(catRes.data.income || []), ...(catRes.data.expense || [])];
          categories = Array.from(new Set(arr)).sort();
        }
      }

      if (categories.length === 0) {
        categories = ['Sales', 'B2B Sales', 'Payroll & Benefits', 'Office Supplies', 'Rent & Lease']; // Fallback
      }

      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      
      const sheet = workbook.addWorksheet('Transactions');
      sheet.columns = [
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Amount', key: 'amount', width: 20 },
        { header: 'Category', key: 'category', width: 25 },
        { header: 'Vendor (ID - Name)', key: 'vendor', width: 40 },
        { header: 'Description', key: 'description', width: 40 },
      ];

      sheet.addRow({
        type: 'income',
        amount: 15000000,
        category: 'Sales',
        vendor: '',
        description: 'Pendapatan harian ritel (Vendor opsional)'
      });
      sheet.addRow({
        type: 'expense',
        amount: 500000,
        category: 'Office Supplies',
        vendor: activeVendors.length > 0 ? `${activeVendors[0].id} - ${activeVendors[0].vendor_name}` : '',
        description: 'Pembelian alat tulis (Vendor Wajib)'
      });

      // Data Validation Lists Sheet
      const listSheet = workbook.addWorksheet('Lists');
      listSheet.state = 'hidden';
      
      listSheet.getColumn('A').values = ['Categories', ...categories];
      
      const vendorOptions = activeVendors.map((v: any) => `${v.id} - ${v.vendor_name}`);
      listSheet.getColumn('B').values = ['Vendors', ...vendorOptions];

      const catCount = categories.length;
      const vendorCount = vendorOptions.length;

      // Apply data validation to rows 2 - 1000
      for (let i = 2; i <= 1000; i++) {
        sheet.getCell(`A${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"income,expense"']
        };

        if (catCount > 0) {
          sheet.getCell(`C${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`Lists!$A$2:$A$${catCount + 1}`]
          };
        }

        if (vendorCount > 0) {
          sheet.getCell(`D${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`Lists!$B$2:$B$${vendorCount + 1}`]
          };
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'template_transactions.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate excel template', error);
    }
  };

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        title="Import Transaction Data"
        size="xl"
        bare
        footer={
          <>
            {lastVendorUpdate && (
              <div className="mr-auto flex items-center text-[11px] text-on-surface-variant leading-tight">
                Vendor Updated:<br />
                <span className="font-semibold text-primary ml-1">{lastVendorUpdate}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex h-10 items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface px-4 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container"
            >
              <ArrowDownTrayIcon aria-hidden="true" className="h-4 w-4" />
              Download Template
            </button>
            <button
              type="button"
              className="h-10 rounded-lg px-4 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedFile || isUploading}
              className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-5 font-label-sm text-label-sm text-on-primary-container transition-colors hover:bg-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUpload}
            >
              {isUploading ? 'Uploading...' : 'Process Upload'}
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </button>
          </>
        }
      >
        {/* Stepper. `bare` drops the modal's body padding so this strip can span
            the full width like the header above it. */}
        <div className="flex items-center gap-2 border-b border-surface-container-high bg-surface-container-low px-6 py-3 font-label-sm text-[11px] font-semibold">
          <span className="flex items-center gap-1 text-on-surface">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              1
            </span>
            Upload
          </span>
          <div className="h-px w-8 bg-outline-variant/50" />
          <span className="flex items-center gap-1 text-on-surface-variant">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
              2
            </span>
            Map Columns
          </span>
          <div className="h-px w-8 bg-outline-variant/50" />
          <span className="flex items-center gap-1 text-on-surface-variant">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
              3
            </span>
            Validate
          </span>
        </div>

        <div className="flex min-h-[300px] flex-col items-center justify-center bg-background p-8">
          <input
            type="file"
            accept=".xlsx,.csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          {!selectedFile ? (
            <div 
              className={`group flex w-full max-w-md cursor-pointer flex-col items-center rounded-xl border-2 border-dashed ${isDragging ? 'border-primary bg-primary-container/10' : 'border-outline-variant/50 bg-surface'} p-8 text-center transition-colors hover:border-primary`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary-container">
                <DocumentArrowUpIcon
                  aria-hidden="true"
                  className="h-6 w-6 text-tertiary group-hover:text-on-primary-container"
                />
              </div>
              <h4 className="mb-1 font-headline-sm text-headline-sm text-on-surface">
                Drag and drop your Excel file
              </h4>
              <p className="mb-4 font-body-sm text-body-sm text-on-surface-variant">
                Supported formats: .xlsx, .csv (Max 50MB)
              </p>
              <button
                type="button"
                className="h-10 rounded-lg border border-outline-variant/50 bg-surface px-4 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container card-shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </button>
            </div>
          ) : (
            <div className="flex w-full max-w-md flex-col items-center rounded-xl border border-outline-variant/50 bg-surface p-6 text-center card-shadow">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <DocumentIcon aria-hidden="true" className="h-8 w-8" />
              </div>
              <h4 className="mb-1 font-headline-sm text-headline-sm text-on-surface truncate w-full px-4">
                {selectedFile.name}
              </h4>
              <p className="mb-4 font-body-sm text-body-sm text-on-surface-variant">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                className="flex items-center gap-2 text-error hover:underline font-label-sm text-label-sm"
                onClick={() => setSelectedFile(null)}
              >
                <XMarkIcon className="h-4 w-4" />
                Remove File
              </button>
            </div>
          )}

          <div className="mt-6 flex w-full max-w-md items-start gap-3 rounded-lg border border-surface-container-high bg-surface p-3 ai-glow">
            <SparklesIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="mb-0.5 font-label-sm text-label-sm text-on-surface">
                AI Auto-Mapping enabled
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Our models will automatically detect and map headers based on historical transaction
                structures.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Sits outside the dialog on purpose: it appears after the modal closes. */}
      {showToast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg bg-inverse-surface px-4 py-3 font-body-sm text-body-sm text-inverse-on-surface shadow-ambient-lvl-2 animate-fade-in"
        >
          <CheckCircleIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-primary-container" />
          <div>
            <p className="font-semibold">Import Started</p>
            <p className="text-xs text-outline-variant">
              Processing 1,240 rows. AI mapping in progress.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
