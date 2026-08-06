'use client';

import React, { useState, useEffect } from 'react';
import { listVendorsApi, createVendorApi, updateVendorApi, type Vendor } from '@/lib/services/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import Pagination from '@/components/common/Pagination';

function VendorDialog({
  isOpen,
  onClose,
  onSuccess,
  vendorToEdit
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendorToEdit?: Vendor | null;
}) {
  const [vendorName, setVendorName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (vendorToEdit) {
      setVendorName(vendorToEdit.vendor_name);
      setBankAccount(vendorToEdit.bank_account);
    } else {
      setVendorName('');
      setBankAccount('');
    }
    setError('');
  }, [vendorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setIsSubmitting(true);
    setError('');

    try {
      if (vendorToEdit) {
        const res = await updateVendorApi(
          vendorToEdit.id,
          { vendor_name: vendorName, bank_account: bankAccount },
          accessToken
        );
        if (res.success) {
          onSuccess();
          onClose();
        }
      } else {
        const res = await createVendorApi(
          { vendor_name: vendorName, bank_account: bankAccount, status: 'active' },
          accessToken
        );
        if (res.success) {
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient-lvl-2 border border-outline-variant/30 w-full max-w-md relative z-10 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-variant flex justify-between items-center bg-surface">
          <h3 className="font-headline-md text-[20px] font-bold text-on-surface">
            {vendorToEdit ? 'Edit Vendor' : 'Register New Vendor'}
          </h3>
          <button className="text-on-surface-variant hover:bg-surface-container p-1 rounded transition-colors" onClick={onClose}>
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 bg-background">
          {error && <div className="text-error font-body-sm bg-error-container/20 p-3 rounded-lg">{error}</div>}
          
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface">Vendor Name</label>
            <input
              required
              className="px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g., PT Sejahtera"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-sm text-label-sm font-semibold text-on-surface">Bank Account</label>
            <input
              required
              className="px-3 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g., BCA 12345678"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 mt-2">
            <button
              type="button"
              className="px-5 py-2 rounded-lg text-on-surface-variant font-label-sm text-label-sm font-semibold hover:bg-surface-container transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold hover:bg-primary-fixed transition-colors shadow-ambient-lvl-1 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (vendorToEdit ? 'Save Changes' : 'Register Vendor')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('join-desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const accessToken = useAuthStore((s) => s.accessToken);

  const fetchVendors = () => {
    if (!accessToken) return;
    setIsLoading(true);
    listVendorsApi(accessToken)
      .then((res) => {
        if (res.success) {
          setVendors(res.data.vendors);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchVendors();
  }, [accessToken]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  const handleToggleStatus = async (vendor: Vendor) => {
    if (!accessToken) return;
    const newStatus = vendor.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await updateVendorApi(vendor.id, { status: newStatus }, accessToken);
      if (res.success) {
        fetchVendors();
      }
    } catch (err) {
      console.error('Failed to update vendor status', err);
    }
  };

  const handleEditClick = (vendor: Vendor) => {
    setVendorToEdit(vendor);
    setIsDialogOpen(true);
  };

  const handleAddNewClick = () => {
    setVendorToEdit(null);
    setIsDialogOpen(true);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const term = searchQuery.toLowerCase();
    const joinDateStr = new Date(vendor.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
    
    const matchesSearch = 
      vendor.vendor_name.toLowerCase().includes(term) || 
      vendor.bank_account.toLowerCase().includes(term) ||
      vendor.status.toLowerCase().includes(term) ||
      vendor.id.toString().includes(term) ||
      joinDateStr.includes(term);

    const matchesStatus = statusFilter === 'All Status' || vendor.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name-asc') return a.vendor_name.localeCompare(b.vendor_name);
    if (sortBy === 'name-desc') return b.vendor_name.localeCompare(a.vendor_name);
    if (sortBy === 'join-desc') return new Date(b.join_date).getTime() - new Date(a.join_date).getTime();
    if (sortBy === 'join-asc') return new Date(a.join_date).getTime() - new Date(b.join_date).getTime();
    return 0;
  });

  const totalItems = filteredVendors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Vendor Management
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Manage your registered vendor details
          </p>
        </div>

        <button 
          type="button"
          onClick={handleAddNewClick}
          className="inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 rounded-lg font-label-lg text-label-lg uppercase hover:bg-primary-fixed transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Vendor
        </button>
      </header>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40">
          <div className="flex-1 md:max-w-sm relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
              search
            </span>
            <input 
              type="text" 
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <select 
                className="appearance-none bg-surface-container-lowest border border-outline-variant rounded pl-3 pr-9 py-2.5 font-body-md text-body-md text-on-surface-variant focus:outline-none focus:border-primary-container"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select 
                className="appearance-none bg-surface-container-lowest border border-outline-variant rounded pl-3 pr-9 py-2.5 font-body-md text-body-md text-on-surface-variant focus:outline-none focus:border-primary-container"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="join-desc">Sort by Join Date (Newest)</option>
                <option value="join-asc">Sort by Join Date (Oldest)</option>
                <option value="name-asc">Sort by Name (A-Z)</option>
                <option value="name-desc">Sort by Name (Z-A)</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                expand_more
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-highest/30 border-b border-surface-container-high">
                  <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-semibold w-16 text-center">No.</th>
                  <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">Vendor Name</th>
                  <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">Bank Account</th>
                  <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">Status</th>
                  <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">Join Date</th>
                  <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-table-data text-table-data text-on-surface divide-y divide-surface-container-high">
                {paginatedVendors.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                      No vendors found matching your filters.
                    </td>
                  </tr>
                )}
                {paginatedVendors.map((vendor, idx) => {
                  const isActive = vendor.status === 'active';
                  const initials = vendor.vendor_name.substring(0, 2).toUpperCase();
                  const absoluteIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const colorIndex = idx % 3;
                  let color = 'bg-secondary-container text-on-secondary-container';
                  if (colorIndex === 1) color = 'bg-surface-container-highest text-on-surface-variant';
                  if (colorIndex === 2) color = 'bg-surface-container text-on-surface-variant/50';
                  if (!isActive) color = 'bg-surface-container text-on-surface-variant/50';

                  const joinDateStr = new Date(vendor.join_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <tr key={vendor.id} className={`hover:bg-surface-container-low transition-colors group ${!isActive ? 'bg-surface-bright/50' : ''}`}>
                      <td className="py-4 px-4 text-center text-sm font-mono text-on-surface-variant">{absoluteIndex}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${color}`}>
                            {initials}
                          </div>
                          <div>
                            <div className={`font-semibold ${!isActive ? 'text-on-surface-variant/70' : ''}`}>{vendor.vendor_name}</div>
                            <div className={`text-xs ${!isActive ? 'text-on-surface-variant/50' : 'text-on-surface-variant'}`}>ID: V-{vendor.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-mono text-sm ${!isActive ? 'text-on-surface-variant/50' : 'text-on-surface-variant'}`}>
                          {vendor.bank_account}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`flex items-center gap-2 ${!isActive ? 'opacity-60' : ''}`}>
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#8bc34a]' : 'bg-outline-variant'}`} />
                          <span className="text-sm capitalize">{vendor.status}</span>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-sm ${!isActive ? 'text-on-surface-variant/50' : 'text-on-surface-variant'}`}>
                        {joinDateStr}
                      </td>
                      <td className="py-4 px-4 text-right transition-opacity">
                        <div className="flex justify-end gap-1">
                          <button 
                            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-container" 
                            title="Edit Details"
                            onClick={() => handleEditClick(vendor)}
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {isActive ? (
                            <button 
                              onClick={() => handleToggleStatus(vendor)}
                              className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-md hover:bg-error-container/50" 
                              title="Deactivate"
                            >
                              <span className="material-symbols-outlined text-[18px]">block</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(vendor)}
                              className="p-1.5 text-on-surface-variant hover:text-[#8bc34a] transition-colors rounded-md hover:bg-[#8bc34a]/10" 
                              title="Activate"
                            >
                              <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            </button>
                          )}
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

      <VendorDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSuccess={fetchVendors}
        vendorToEdit={vendorToEdit}
      />
    </div>
  );
}
