'use client';

import React, { useState, useEffect } from 'react';
import ImportDialog from '@/components/transactions/ImportDialog';
import VendorDrawer from '@/components/transactions/VendorDrawer';
import Pagination from '@/components/common/Pagination';
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

  const [date, setDate] = useState('');
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
      setDate(new Date(txToEdit.transaction_date).toISOString().split('T')[0]);
      setAmount(txToEdit.amount);
      setType(txToEdit.type);
      setCategory(txToEdit.category);
      setDescription(txToEdit.description);
      setVendorId(txToEdit.vendor_id ? txToEdit.vendor_id.toString() : '');
    } else {
      setDate('');
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !user) return;
    setIsSubmitting(true);
    setError('');

    try {
      const payload: any = {
        transaction_date: new Date(date).toISOString(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient-lvl-2 border border-outline-variant/30 w-full max-w-lg relative z-10 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-4 border-b border-surface-variant flex justify-between items-center bg-surface">
          <h3 className="font-headline-md text-[20px] font-bold text-on-surface">
            {txToEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button className="text-on-surface-variant hover:bg-surface-container p-1 rounded transition-colors" onClick={onClose} type="button">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <form id="tx-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="text-error font-body-sm bg-error-container/20 p-3 rounded-lg">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface">Date</label>
                <input
                  type="date"
                  required
                  className="px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
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
        </div>
        
        <div className="px-6 py-4 border-t border-surface-variant bg-surface flex justify-end gap-3">
          <button
            type="button"
            className="px-5 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="tx-form"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold hover:bg-primary-fixed transition-colors shadow-ambient-lvl-1 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </div>
    </div>
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
    listTransactionsApi(accessToken, {
      page: currentPage,
      limit: itemsPerPage,
      type: typeFilter,
      category: categoryFilter,
      search: debouncedSearch || undefined
    })
      .then((res) => {
        if (res.success) {
          setTransactions(res.data.transactions);
          setTotalItems(res.data.pagination?.total ?? res.data.transactions.length);
          setTotalPages(res.data.pagination?.totalPages ?? 1);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  // Debounce search input before it drives a server request
  useEffect(() => {
    const delay = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Any filter change invalidates the current page
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, typeFilter, categoryFilter]);

  // Server is the source of truth for what's on the page — page/limit/type/category/search are all sent, not re-derived client-side
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, itemsPerPage, debouncedSearch, typeFilter, categoryFilter, accessToken]);

  const handleEditClick = (tx: Transaction) => {
    setTxToEdit(tx);
    setIsAddOpen(true);
  };

  const handleAddNewClick = () => {
    setTxToEdit(null);
    setIsAddOpen(true);
  };

  // Type/category/search/pagination are already applied server-side (see fetchTransactions).
  // Vendor filter and sort have no backend query support yet, so they only refine
  // what's on the current server-fetched page rather than the full result set.
  const filteredTransactions = transactions.filter(tx => {
    if (vendorFilter !== 'All' && tx.vendor_id?.toString() !== vendorFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
    if (sortBy === 'date-asc') return new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
    if (sortBy === 'amount-desc') return parseFloat(b.amount) - parseFloat(a.amount);
    if (sortBy === 'amount-asc') return parseFloat(a.amount) - parseFloat(b.amount);
    return 0;
  });

  const paginatedTransactions = filteredTransactions;

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Transactions
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Manage and review categorized ledger entries. AI models have pre-processed recent uploads.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button 
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-5 font-label-lg text-label-lg text-primary shadow-ambient-lvl-1 transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">upload_file</span>
            Import Excel
          </button>
          <button 
            type="button"
            onClick={handleAddNewClick}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-primary-container bg-primary-container px-5 font-label-lg text-label-lg text-on-primary-container shadow-ambient-lvl-1 transition-colors hover:bg-primary-fixed"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Transaction
          </button>
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-ambient-lvl-1">
          <div className="flex shrink-0 items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              filter_alt
            </span>
            <span className="font-label-lg text-label-lg">Filters</span>
          </div>

          <div className="relative min-w-0 flex-[1_1_16rem]">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant" aria-hidden="true">
              search
            </span>
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search transactions"
              className="h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline transition-all focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-container/20"
            />
          </div>

          <div className="relative min-w-0 flex-[1_1_10rem] md:flex-none">
              <select 
                aria-label="Filter by type"
                className="h-12 w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-lowest pl-3 pr-9 font-body-md text-body-md text-on-surface-variant focus:border-primary-container focus:outline-none md:min-w-[9rem]"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                expand_more
              </span>
          </div>

          <div className="relative min-w-0 flex-[1_1_10rem] md:flex-none">
              <select 
                aria-label="Filter by category"
                className="h-12 w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-lowest pl-3 pr-9 font-body-md text-body-md text-on-surface-variant focus:border-primary-container focus:outline-none md:min-w-[10rem]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                expand_more
              </span>
          </div>

          <div className="relative min-w-0 flex-[1_1_10rem] md:flex-none">
              <select 
                aria-label="Filter by vendor"
                className="h-12 w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-lowest pl-3 pr-9 font-body-md text-body-md text-on-surface-variant focus:border-primary-container focus:outline-none md:min-w-[10rem]"
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
              >
                <option value="All">All Vendors</option>
                {allVendors.map(v => <option key={v.id} value={v.id.toString()}>{v.vendor_name}</option>)}
              </select>
              <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                expand_more
              </span>
          </div>

          <div className="relative min-w-0 flex-[1_1_12rem] md:flex-none">
              <select 
                aria-label="Sort transactions"
                className="h-12 w-full appearance-none rounded-xl border border-outline-variant bg-surface-container-lowest pl-3 pr-9 font-body-md text-body-md text-on-surface-variant focus:border-primary-container focus:outline-none md:min-w-[12rem]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">Sort by Date (Newest)</option>
                <option value="date-asc">Sort by Date (Oldest)</option>
                <option value="amount-desc">Sort by Amount (Highest)</option>
                <option value="amount-asc">Sort by Amount (Lowest)</option>
              </select>
              <span aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                expand_more
              </span>
          </div>

          <span className="basis-full font-body-md text-sm text-on-surface-variant md:ml-auto md:basis-auto">
            Showing {totalItems} records
          </span>

          <button
            type="button"
            disabled
            aria-label="Export transactions"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant shadow-ambient-lvl-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">download</span>
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-ambient-lvl-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-tertiary-fixed-dim bg-tertiary-fixed font-label-sm text-label-sm text-on-tertiary-fixed-variant">
                <th className="w-12 px-4 py-3 text-center font-semibold">No.</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="w-[25%] px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="w-16 px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/70 text-[14px] leading-5 text-on-surface">
              {filteredTransactions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-on-surface-variant">
                    No transactions found matching criteria.
                  </td>
                </tr>
              )}
              {paginatedTransactions.map((tx, idx) => {
                const dateStr = new Date(tx.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const absoluteIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                
                return (
                  <tr key={tx.id} className="group transition-colors hover:bg-surface-container/50">
                    <td className="px-4 py-3 text-center font-mono text-sm text-on-surface-variant">
                      {absoluteIndex}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">{dateStr}</td>
                    <td className="max-w-xs truncate px-4 py-3 font-medium">{tx.description}</td>
                    <td className="px-4 py-3">{tx.category}</td>
                    <td className="px-4 py-3 capitalize">{tx.type}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                        <button 
                          type="button"
                          aria-label="Edit transaction"
                          className="rounded-md p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
                          onClick={() => handleEditClick(tx)}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
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
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
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
