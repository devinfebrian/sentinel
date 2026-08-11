'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import ImportDialog from '@/components/transactions/ImportDialog';
import VendorDrawer from '@/components/transactions/VendorDrawer';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import RippleButton, {
  PRIMARY_ACTION_CLASSES,
  SECONDARY_ACTION_CLASSES,
} from '@/components/common/RippleButton';
import { 
  listTransactionsApi, 
  createTransactionApi,
  updateTransactionApi,
  getTransactionCategoriesApi,
  listVendorsApi,
  type Transaction,
  type Vendor
} from '@/lib/services/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { formatDate } from '@/lib/format/datetime';
import { FilterSelect, FILTER_INPUT_CLASSES } from '@/components/common/FilterControls';
import {
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// Income and expense are the one distinction worth reading at a glance, so the
// column is a coloured chip rather than plain text.
function TypeChip({ type }: { type: string }) {
  const income = type === 'income';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        income
          ? 'bg-secondary-container text-on-secondary-container'
          : 'bg-error-container text-on-error-container'
      }`}
    >
      {type}
    </span>
  );
}

const formatCurrency = (amountStr: string | number, type: string) => {
  const amount = typeof amountStr === 'string' ? parseFloat(amountStr) : amountStr;
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(Math.abs(amount));
  return type === 'expense' ? `-${formatted}` : `+${formatted}`;
};

function TransactionDialog({
  isOpen,
  onClose,
  onSuccess,
  txToEdit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  txToEdit?: Transaction | null;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [vendorId, setVendorId] = useState('');

  const [categories, setCategories] = useState<string[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize form state
  useEffect(() => {
    if (!isOpen) return;
    if (txToEdit) {
      setAmount(txToEdit.amount);
      setType(txToEdit.type);
      setCategory(txToEdit.category);
      setDescription(txToEdit.description);
      setVendorId(txToEdit.vendor_id ? txToEdit.vendor_id.toString() : '');
    } else {
      setAmount('');
      setType('expense');
      setCategory('');
      setDescription('');
      setVendorId('');
    }
    setError('');
  }, [txToEdit, isOpen]);

  // Fetch categories based on type
  useEffect(() => {
    if (!isOpen || !accessToken) return;
    getTransactionCategoriesApi(type, accessToken)
      .then(res => {
        if (res.success) {
          const cats = type === 'income' ? res.data.income : res.data.expense;
          setCategories(cats || []);
          if (!txToEdit || txToEdit.type !== type) {
            if (cats && cats.length > 0) setCategory(cats[0]);
          } else if (txToEdit && txToEdit.type === type) {
            setCategory(txToEdit.category);
          }
        }
      })
      .catch(console.error);
  }, [isOpen, type, accessToken, txToEdit]);

  // Fetch vendors
  useEffect(() => {
    if (!isOpen || !accessToken) return;
    listVendorsApi(accessToken)
      .then(res => {
        if (res.success) {
          setVendors(res.data.vendors.filter(v => v.status === 'active' || (txToEdit && txToEdit.vendor_id === v.id)));
        }
      })
      .catch(console.error);
  }, [isOpen, accessToken, txToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !user) return;
    setIsSubmitting(true);
    setError('');

    try {
      const payload: any = {
        amount: parseFloat(amount),
        type,
        category,
        description,
        vendor_id: vendorId ? parseInt(vendorId, 10) : null,
      };

      if (txToEdit) {
        const res = await updateTransactionApi(txToEdit.id, payload, accessToken);
        if (res.success) {
          onSuccess();
          onClose();
        }
      } else {
        payload.input_by_user_id = user.id;
        const res = await createTransactionApi(payload, accessToken);
        if (res.success) {
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={txToEdit ? 'Edit Transaction' : 'Add Transaction'}
      size="lg"
      footer={
        <>
          <button
            type="button"
            className="h-10 rounded-lg px-4 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tx-form"
            disabled={isSubmitting}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-5 font-label-sm text-label-sm text-on-primary-container transition-colors hover:bg-primary-fixed disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Transaction'}
          </button>
        </>
      }
    >
      <form id="tx-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="text-error font-body-sm bg-error-container/20 p-3 rounded-lg">{error}</div>}
            
            {/* Tanggal tidak lagi diisi pengguna: transaksi berasal dari mutasi
                bank, dan waktu pencatatannya (created_at) ditulis server. */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">Type</label>
                <select
                  className="px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  className="px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">Category</label>
                <select
                  required
                  className="px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">Vendor (Optional)</label>
              <select
                className="px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              >
                <option value="">-- No Vendor --</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id.toString()}>{v.vendor_name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">Description</label>
              <textarea
                required
                className="px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
                placeholder="Transaction details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
      </form>
    </Modal>
  );
}

export default function TransactionsPage() {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);
  
  const accessToken = useAuthStore((s) => s.accessToken);

  // Fetch all categories for filter dropdown
  useEffect(() => {
    if (!accessToken) return;
    getTransactionCategoriesApi(undefined, accessToken)
      .then(res => {
        if (res.success) {
          const arr = [...(res.data.income || []), ...(res.data.expense || [])];
          setAllCategories(Array.from(new Set(arr)).sort());
        }
      })
      .catch(console.error);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    listVendorsApi(accessToken)
      .then(res => {
        if (res.success) setAllVendors(res.data.vendors);
      })
      .catch(console.error);
  }, [accessToken]);

  const fetchTransactions = () => {
    if (!accessToken) return;
    setIsLoading(true);
    // Fetch up to 1000 transactions and do all filtering/pagination locally
    // because the backend doesn't support searching by vendor name.
    listTransactionsApi(accessToken, {
      page: 1,
      limit: 100
    })
      .then((res) => {
        if (res.success) {
          setTransactions(res.data.transactions);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  // Any filter change invalidates the current page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, categoryFilter, vendorFilter]);

  // Fetch once on mount
  useEffect(() => {
    fetchTransactions();
  }, [accessToken]);

  const handleEditClick = (tx: Transaction) => {
    setTxToEdit(tx);
    setIsAddOpen(true);
  };

  const handleAddNewClick = () => {
    setTxToEdit(null);
    setIsAddOpen(true);
  };

  // Local filtering and pagination
  const filteredTransactions = transactions.filter(tx => {
    if (typeFilter !== 'All' && tx.type?.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (categoryFilter !== 'All' && tx.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (vendorFilter !== 'All' && tx.vendor_id?.toString() !== vendorFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description?.toLowerCase().includes(q) || false;
      const matchCat = tx.category?.toLowerCase().includes(q) || false;
      const matchVendor = tx.vendor_name?.toLowerCase().includes(q) || false;
      if (!matchDesc && !matchCat && !matchVendor) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'date-asc') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === 'amount-desc') return parseFloat(b.amount) - parseFloat(a.amount);
    if (sortBy === 'amount-asc') return parseFloat(a.amount) - parseFloat(b.amount);
    return 0;
  });

  const totalFiltered = filteredTransactions.length;
  const totalPageCount = Math.ceil(totalFiltered / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    // No animate-fade-in here: it animates `transform`, which turns this div
    // into a backdrop root and leaves the modal's backdrop-blur with nothing
    // behind it to sample.
    <div className="space-y-stack-lg">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Transactions
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Manage and review categorized transaction entries. AI models have pre-processed recent uploads.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <RippleButton
            type="button"
            onClick={() => setIsImportOpen(true)}
            rippleColor="rgba(87, 100, 0, 0.18)"
            className={SECONDARY_ACTION_CLASSES}
          >
            <DocumentArrowUpIcon aria-hidden="true" className="h-5 w-5" />
            Import Excel
          </RippleButton>
          <RippleButton
            type="button"
            onClick={handleAddNewClick}
            className={PRIMARY_ACTION_CLASSES}
          >
            <PlusIcon aria-hidden="true" className="h-5 w-5" />
            Add Transaction
          </RippleButton>
        </div>
      </header>

      <div className="space-y-stack-md">
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-surface-container-high bg-surface p-4 card-shadow md:flex-row">
          <div className="relative w-full flex-1 md:max-w-sm">
            <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search transactions"
              className={`${FILTER_INPUT_CLASSES} pl-10 pr-4`}
            />
          </div>

          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <FilterSelect
              label="Filter by type"
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-full sm:w-[48%] md:w-32 md:flex-none"
            >
              <option value="All">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </FilterSelect>

            <FilterSelect
              label="Filter by category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              className="w-full sm:w-[48%] md:w-36 md:flex-none"
            >
              <option value="All">All Categories</option>
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </FilterSelect>

            <FilterSelect
              label="Filter by vendor"
              value={vendorFilter}
              onChange={setVendorFilter}
              className="w-full sm:w-[48%] md:w-36 md:flex-none"
            >
              <option value="All">All Vendors</option>
              {allVendors.map(v => <option key={v.id} value={v.id.toString()}>{v.vendor_name}</option>)}
            </FilterSelect>

            <FilterSelect
              label="Sort transactions"
              value={sortBy}
              onChange={setSortBy}
              className="w-full sm:w-[48%] md:w-44 md:flex-none"
            >
              <option value="date-desc">Sort by Date (Newest)</option>
              <option value="date-asc">Sort by Date (Oldest)</option>
              <option value="amount-desc">Sort by Amount (Highest)</option>
              <option value="amount-asc">Sort by Amount (Lowest)</option>
            </FilterSelect>

            <button
              type="button"
              disabled
              aria-label="Export transactions"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowDownTrayIcon aria-hidden="true" className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-surface-container-high bg-surface card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high bg-surface-container-highest/30 font-label-sm text-label-sm text-on-surface-variant">
                <th className="w-12 px-4 py-3 text-center font-semibold">No.</th>
                <th className="px-4 py-3 text-center font-semibold">Date</th>
                <th className="w-[25%] px-4 py-3 text-center font-semibold">Description</th>
                <th className="px-4 py-3 text-center font-semibold">Category</th>
                <th className="px-4 py-3 text-center font-semibold">Type</th>
                <th className="px-4 py-3 text-center font-semibold">Vendor</th>
                <th className="px-4 py-3 text-center font-semibold">Amount</th>
                <th className="w-16 px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-data text-table-data text-on-surface">
              {filteredTransactions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-on-surface-variant">
                    No transactions found matching criteria.
                  </td>
                </tr>
              )}
              {paginatedTransactions.map((tx, idx) => {
                const dateStr = formatDate(tx.created_at);
                const absoluteIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                
                return (
                  <tr key={tx.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3 text-center text-on-surface-variant">
                      {absoluteIndex}
                    </td>
                    <td className="px-4 py-3 text-center text-on-surface-variant">{dateStr}</td>
                    {/* title, not a custom tooltip: the row lives inside an
                        overflow-x-auto scroller that would clip a positioned
                        one, and the native bubble is the only thing that can
                        escape it. */}
                    <td
                      className="max-w-xs truncate px-4 py-3 font-medium"
                      title={tx.description}
                    >
                      {tx.description}
                    </td>
                    <td className="px-4 py-3 text-center">{tx.category}</td>
                    <td className="px-4 py-3 text-center">
                      <TypeChip type={tx.type} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tx.vendor_name ? (
                        <button 
                          type="button"
                          className="font-medium text-secondary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                          onClick={() => setSelectedVendor(tx.vendor_name)}
                        >
                          {tx.vendor_name}
                        </button>
                      ) : (
                        <span className="text-on-surface-variant">-</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${tx.type === 'income' ? 'text-secondary' : ''}`}>
                      {formatCurrency(tx.amount, tx.type)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button 
                          type="button"
                          aria-label="Edit transaction"
                          className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                          onClick={() => handleEditClick(tx)}
                        >
                          <PencilSquareIcon aria-hidden="true" className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPageCount}
          itemsPerPage={itemsPerPage}
          totalItems={totalFiltered}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
        />
      </div>
      </div>

      <ImportDialog isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      <TransactionDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchTransactions} txToEdit={txToEdit} />
      <VendorDrawer isOpen={!!selectedVendor} onClose={() => setSelectedVendor(null)} vendorName={selectedVendor} />
    </div>
  );
}
