'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import { listVendorsApi, createVendorApi, updateVendorApi, type Vendor } from '@/lib/services/api';
import { useAuthStore } from '@/lib/stores/auth.store';
import { formatDate } from '@/lib/format/datetime';
import { FilterSelect, FILTER_INPUT_CLASSES } from '@/components/common/FilterControls';
import Pagination from '@/components/common/Pagination';
import Modal from '@/components/common/Modal';
import RippleButton, { PRIMARY_ACTION_CLASSES } from '@/components/common/RippleButton';
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

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
    <Modal
      open={isOpen}
      onClose={onClose}
      title={vendorToEdit ? 'Edit Vendor' : 'Register New Vendor'}
      size="md"
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
            form="vendor-form"
            disabled={isSubmitting}
            className="flex h-10 items-center gap-2 rounded-lg bg-primary-container px-5 font-label-sm text-label-sm text-on-primary-container transition-colors hover:bg-primary-fixed disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : vendorToEdit ? 'Save Changes' : 'Register Vendor'}
          </button>
        </>
      }
    >
      <form id="vendor-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
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
      </form>
    </Modal>
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
    const joinDateStr = formatDate(vendor.join_date).toLowerCase();
    
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
    // No animate-fade-in here: it animates `transform`, which turns this div
    // into a backdrop root and leaves the modal's backdrop-blur with nothing
    // behind it to sample.
    <div className="space-y-stack-lg">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            Vendor Management
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Manage your registered vendor details
          </p>
        </div>

        <RippleButton
          type="button"
          onClick={handleAddNewClick}
          className={`${PRIMARY_ACTION_CLASSES} w-full md:w-auto`}
        >
          <PlusIcon aria-hidden="true" className="h-5 w-5" />
          Add Vendor
        </RippleButton>
      </header>

      <div className="space-y-stack-md">
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-surface-container-high bg-surface p-4 card-shadow md:flex-row">
          <div className="relative w-full flex-1 md:max-w-sm">
            <MagnifyingGlassIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search vendors"
              className={`${FILTER_INPUT_CLASSES} pl-10 pr-4`}
            />
          </div>

          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <FilterSelect
              label="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full sm:w-[48%] md:w-36 md:flex-none"
            >
              <option value="All Status">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </FilterSelect>

            <FilterSelect
              label="Sort vendors"
              value={sortBy}
              onChange={setSortBy}
              className="w-full sm:w-[48%] md:w-48 md:flex-none"
            >
              <option value="join-desc">Sort by Join Date (Newest)</option>
              <option value="join-asc">Sort by Join Date (Oldest)</option>
              <option value="name-asc">Sort by Name (A-Z)</option>
              <option value="name-desc">Sort by Name (Z-A)</option>
            </FilterSelect>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-surface-container-high bg-surface card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-highest/30 border-b border-surface-container-high">
                  <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-semibold w-16 text-center">No.</th>
                  <th className="py-3 px-4 text-center font-label-sm text-label-sm text-on-surface-variant font-semibold">Vendor Name</th>
                  <th className="py-3 px-4 font-label-sm text-label-sm text-on-surface-variant font-semibold">Bank Account</th>
                  <th className="py-3 px-4 text-center font-label-sm text-label-sm text-on-surface-variant font-semibold">Status</th>
                  <th className="py-3 px-4 text-center font-label-sm text-label-sm text-on-surface-variant font-semibold">Join Date</th>
                  <th className="py-3 px-4 text-center font-label-sm text-label-sm text-on-surface-variant font-semibold">Actions</th>
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

                  const joinDateStr = formatDate(vendor.join_date);

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
                      <td className="py-4 px-4 text-center">
                        <div className={`flex items-center justify-center gap-2 ${!isActive ? 'opacity-60' : ''}`}>
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-success' : 'bg-outline-variant'}`} />
                          <span className="text-sm capitalize">{vendor.status}</span>
                        </div>
                      </td>
                      <td className={`py-4 px-4 text-center text-sm ${!isActive ? 'text-on-surface-variant/50' : 'text-on-surface-variant'}`}>
                        {joinDateStr}
                      </td>
                      <td className="py-4 px-4 text-center transition-opacity">
                        <div className="flex justify-center gap-1">
                          <button 
                            className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-md hover:bg-surface-container" 
                            title="Edit Details"
                            onClick={() => handleEditClick(vendor)}
                          >
                            <PencilSquareIcon aria-hidden="true" className="h-[18px] w-[18px]" />
                          </button>
                          {isActive ? (
                            <button 
                              onClick={() => handleToggleStatus(vendor)}
                              className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-md hover:bg-error-container/50" 
                              title="Deactivate"
                            >
                              <NoSymbolIcon aria-hidden="true" className="h-[18px] w-[18px]" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(vendor)}
                              className="p-1.5 text-on-surface-variant hover:text-success transition-colors rounded-md hover:bg-success/10" 
                              title="Activate"
                            >
                              <CheckCircleIcon aria-hidden="true" className="h-[18px] w-[18px]" />
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
