'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import Modal from '@/components/common/Modal';
import { useAuthStore } from '@/lib/stores/auth.store';
import {
  importTransactionsApi,
  ApiError,
  type ImportTransactionRow,
  type Vendor,
  listVendorsApi,
  getTransactionCategoriesApi
} from '@/lib/services/api';
import { parseSpreadsheetFile, type ImportParseResult } from '@/lib/import/parse-file';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Fired after a successful import so the page can reload its list. */
  onImported: () => void;
}

type Step = 'upload' | 'review' | 'done';

const MAX_ROWS = 2000;

const ACCEPTED = '.xlsx,.xls,.csv';

export default function ImportDialog({ isOpen, onClose, onImported }: ImportDialogProps) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ImportParseResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    inserted: number;
    rejected: { row: number; message: string }[];
  } | null>(null);
  const [lastVendorUpdate, setLastVendorUpdate] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && accessToken) {
      listVendorsApi(accessToken).then(res => {
        if (res.success && res.data.vendors.length > 0) {
          const maxTime = Math.max(...res.data.vendors.map((v) => new Date(v.join_date || 0).getTime()));
          if (maxTime > 0) {
            setLastVendorUpdate(new Date(maxTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
          } else {
            setLastVendorUpdate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
          }
        }
      }).catch(console.error);
    }
  }, [isOpen, accessToken]);

  const reset = useCallback(() => {
    setStep('upload');
    setFileName(null);
    setParsed(null);
    setParsing(false);
    setParseError(null);
    setImporting(false);
    setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      setParsing(true);
      setParseError(null);
      setFileName(file.name);
      try {
        const result = await parseSpreadsheetFile(file);
        if (result.rows.length > MAX_ROWS) {
          setParseError(`Too many rows (${result.rows.length}). Limit is ${MAX_ROWS} per import.`);
          setStep('upload');
        } else {
          setParsed(result);
          setStep('review');
        }
      } catch (error) {
        setParseError(
          error instanceof Error ? error.message : 'Could not read that file. Try .xlsx or .csv.'
        );
        setStep('upload');
      } finally {
        setParsing(false);
      }
    },
    []
  );

  const handleImport = async () => {
    if (!accessToken || !parsed) return;
    setImporting(true);
    try {
      const res = await importTransactionsApi(parsed.rows as ImportTransactionRow[], accessToken);
      setResult({ inserted: res.data.inserted, rejected: res.data.rejected });
      setStep('done');
      onImported();
    } catch (error) {
      setParseError(error instanceof ApiError ? error.message : 'Import failed. Please retry.');
      setStep('upload');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      let activeVendors: Vendor[] = [];
      let categories: string[] = [];

      if (accessToken) {
        const [vendorRes, catRes] = await Promise.all([
          listVendorsApi(accessToken),
          getTransactionCategoriesApi(undefined, accessToken)
        ]);
        if (vendorRes.success) {
          activeVendors = vendorRes.data.vendors.filter((v) => v.status === 'active');
        }
        if (catRes.success) {
          const arr = [...(catRes.data.income || []), ...(catRes.data.expense || [])];
          categories = Array.from(new Set(arr)).sort();
        }
      }

      if (categories.length === 0) {
        categories = ['Sales', 'B2B Sales', 'Payroll & Benefits', 'Office Supplies', 'Rent & Lease']; // Fallback
      }

      const exceljsModule = await import('exceljs');
      const ExcelJS = exceljsModule.default || exceljsModule;
      const workbook = new ExcelJS.Workbook();
      
      const sheet = workbook.addWorksheet('Transactions');
      sheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Amount', key: 'amount', width: 20 },
        { header: 'Category', key: 'category', width: 25 },
        { header: 'Invoice', key: 'invoice_no', width: 20 },
        { header: 'Vendor (ID - Name)', key: 'vendor', width: 40 },
        { header: 'Description', key: 'description', width: 40 },
      ];

      const today = new Date().toISOString().split('T')[0];
      sheet.addRow({
        date: today,
        type: 'income',
        amount: 15000000,
        category: 'Sales',
        invoice_no: 'INV-2023001',
        vendor: '',
        description: 'Pendapatan harian ritel (Vendor opsional)'
      });
      sheet.addRow({
        date: today,
        type: 'expense',
        amount: 500000,
        category: 'Office Supplies',
        invoice_no: 'INV-2023002',
        vendor: activeVendors.length > 0 ? `${activeVendors[0].id} - ${activeVendors[0].vendor_name}` : '',
        description: 'Pembelian alat tulis (Vendor Wajib)'
      });

      // Data Validation Lists Sheet
      const listSheet = workbook.addWorksheet('Lists');
      listSheet.state = 'hidden';
      
      listSheet.getColumn('A').values = ['Categories', ...categories];
      
      const vendorOptions = activeVendors.map((v) => `${v.id} - ${v.vendor_name}`);
      listSheet.getColumn('B').values = ['Vendors', ...vendorOptions];

      const catCount = categories.length;
      const vendorCount = vendorOptions.length;

      // Apply data validation to rows 2 - 1000
      for (let i = 2; i <= 1000; i++) {
        sheet.getCell(`B${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: ['"income,expense"']
        };

        if (catCount > 0) {
          sheet.getCell(`D${i}`).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`Lists!$A$2:$A$${catCount + 1}`]
          };
        }

        if (vendorCount > 0) {
          sheet.getCell(`F${i}`).dataValidation = {
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

  const canImport = (parsed?.rows.length ?? 0) > 0;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Import Transaction Data"
      size="xl"
      bare
      footer={
        step === 'review' ? (
          <>
            <button
              type="button"
              className="h-10 rounded-lg px-4 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container"
              onClick={() => {
                reset();
              }}
            >
              Choose another file
            </button>
            <button
              type="button"
              disabled={!canImport || importing}
              className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-5 font-label-sm text-label-sm text-on-primary-container transition-colors hover:bg-primary-fixed disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleImport}
            >
              {importing ? 'Importing…' : `Import ${parsed?.rows.length ?? 0} rows`}
              {!importing && <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />}
            </button>
          </>
        ) : step === 'done' ? (
          <button
            type="button"
            className="h-10 rounded-lg bg-primary-container px-5 font-label-sm text-label-sm text-on-primary-container transition-colors hover:bg-primary-fixed"
            onClick={handleClose}
          >
            Done
          </button>
        ) : (
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
              onClick={handleClose}
            >
              Cancel
            </button>
          </>
        )
      }
    >
      {/* Stepper. `bare` drops the modal's body padding so this strip can span
          the full width like the header above it. */}
      <div className="flex items-center gap-2 border-b border-surface-container-high bg-surface-container-low px-6 py-3 font-label-sm text-[11px] font-semibold">
        {(
          [
            ['upload', 'Upload'],
            ['review', 'Review'],
            ['done', 'Validate'],
          ] as const
        ).map(([id, label], i) => {
          const stepIndex = step === 'upload' ? 0 : step === 'review' ? 1 : 2;
          const active = stepIndex === i;
          const done = stepIndex > i;
          return (
            <React.Fragment key={id}>
              {i > 0 && <div className="h-px w-8 bg-outline-variant/50" />}
              <span
                className={`flex items-center gap-1 ${
                  active ? 'text-on-surface' : done ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    done
                      ? 'bg-primary-container text-on-primary-container'
                      : active
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-variant text-on-surface-variant'
                  }`}
                >
                  {done ? <CheckCircleIcon aria-hidden="true" className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {label}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {step === 'upload' && (
        <div className="flex min-h-[300px] flex-col items-center justify-center bg-background p-8">
          <label
            className={`group flex w-full max-w-md cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-outline-variant/50 bg-surface p-8 text-center transition-colors hover:border-primary ${
              parsing ? 'pointer-events-none opacity-60' : ''
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary-container">
              <DocumentArrowUpIcon
                aria-hidden="true"
                className="h-6 w-6 text-tertiary group-hover:text-on-primary-container"
              />
            </span>
            <span className="mb-1 font-headline-sm text-headline-sm text-on-surface">
              {parsing ? 'Reading file…' : fileName ?? 'Drag and drop your Excel file'}
            </span>
            <span className="mb-4 font-body-sm text-body-sm text-on-surface-variant">
              Supported formats: .xlsx, .csv (max {MAX_ROWS.toLocaleString('en-US')} rows)
            </span>
            <span className="inline-flex h-10 items-center justify-center rounded-lg border border-outline-variant/50 bg-surface px-4 font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container card-shadow">
              Browse Files
            </span>
          </label>

          {parseError && (
            <div className="mt-4 flex w-full max-w-md items-start gap-2 rounded-lg bg-error-container px-3 py-2.5 font-body-sm text-body-sm text-on-error-container">
              <ExclamationTriangleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>
      )}

      {step === 'review' && parsed && (
        <div className="bg-background p-6">
          <p className="mb-1 font-body-sm text-body-sm text-on-surface-variant">
            {fileName} · {parsed.rows.length} rows ready to import
            {parsed.errors.length > 0 ? `, ${parsed.errors.length} rows with errors` : ''}.
          </p>
          <p className="mb-4 font-body-sm text-body-sm text-on-surface-variant">
            Vendor names are matched case-insensitively and created if new. Imported expenses are
            analyzed automatically in the background.
          </p>

          {parsed.headers.length > 0 && (
            <div className="mb-4">
              <p className="mb-1.5 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                Columns found
              </p>
              <div className="flex flex-wrap gap-1.5">
                {parsed.headers.map((h) => (
                  <span
                    key={h}
                    className="rounded bg-surface-container px-2 py-1 font-mono text-[11px] text-on-surface"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {parsed.rows.length > 0 && (
            <div className="mb-4 max-h-56 overflow-y-auto rounded-lg border border-outline-variant/30">
              <table className="w-full border-collapse text-left font-table-data text-table-data">
                <thead className="sticky top-0 bg-surface-container-low font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Invoice</th>
                    <th className="px-4 py-2">Vendor</th>
                    <th className="px-4 py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-on-surface">
                  {parsed.rows.slice(0, 100).map((row, i) => (
                    <tr key={i} className="border-t border-outline-variant/20">
                      <td className="whitespace-nowrap px-4 py-2 text-on-surface-variant">
                        {row.date ?? '—'}
                      </td>
                      <td className="px-4 py-2">{row.type}</td>
                      <td className="whitespace-nowrap px-4 py-2">
                        {row.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-2">{row.category}</td>
                      <td className="px-4 py-2 text-on-surface-variant">{row.invoice_no ?? '—'}</td>
                      <td className="px-4 py-2 text-on-surface-variant">{row.vendor_name ?? '—'}</td>
                      <td className="max-w-xs truncate px-4 py-2 text-on-surface-variant">
                        {row.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.rows.length > 100 && (
                <p className="bg-surface-container-low px-4 py-2 font-body-sm text-body-sm text-on-surface-variant">
                  …and {parsed.rows.length - 100} more.
                </p>
              )}
            </div>
          )}

          {parsed.errors.length > 0 && (
            <div className="rounded-lg bg-error-container/60 px-4 py-3">
              <p className="mb-1.5 font-label-sm text-label-sm uppercase tracking-widest text-error">
                {parsed.errors.length} rows skipped
              </p>
              <ul className="flex flex-col gap-1">
                {parsed.errors.slice(0, 20).map((e) => (
                  <li key={e.row} className="font-body-sm text-body-sm text-on-error-container">
                    Row {e.row}: {e.message}
                  </li>
                ))}
              </ul>
              {parsed.errors.length > 20 && (
                <p className="mt-1 font-body-sm text-body-sm text-on-error-container">
                  …and {parsed.errors.length - 20} more. Fix the file and re-upload to import them.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {step === 'done' && result && (
        <div className="flex min-h-[300px] flex-col items-center justify-center bg-background p-8 text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container">
            <CheckCircleIcon aria-hidden="true" className="h-8 w-8 text-on-primary-container" />
          </span>
          <h4 className="mb-1 font-headline-sm text-headline-sm text-on-surface">
            {result.inserted} transaction{result.inserted === 1 ? '' : 's'} imported
          </h4>
          <p className="mb-4 font-body-sm text-body-sm text-on-surface-variant">
            {result.rejected.length > 0
              ? `${result.rejected.length} row${result.rejected.length === 1 ? '' : 's'} rejected server-side.`
              : 'Imported expenses are being analyzed in the background — findings will appear shortly.'}
          </p>
          {result.rejected.length > 0 && (
            <div className="flex w-full max-w-md items-start gap-2 rounded-lg bg-error-container/60 px-3 py-2.5 text-left font-body-sm text-body-sm text-on-error-container">
              <XCircleIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <ul className="flex flex-col gap-0.5">
                {result.rejected.slice(0, 10).map((r) => (
                  <li key={r.row}>Row {r.row}: {r.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
