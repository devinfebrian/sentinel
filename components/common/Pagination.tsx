'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}: PaginationProps) {
  const [jumpPage, setJumpPage] = useState('');
  const [limitInput, setLimitInput] = useState(itemsPerPage.toString());

  // Keep local states in sync with props if they change externally
  useEffect(() => {
    setLimitInput(itemsPerPage.toString());
  }, [itemsPerPage]);

  const handleLimitSubmit = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if ('key' in e && e.key !== 'Enter') return;
    const newLimit = parseInt(limitInput, 10);
    if (!isNaN(newLimit) && newLimit > 0) {
      onItemsPerPageChange(newLimit);
    } else {
      setLimitInput(itemsPerPage.toString());
    }
  };

  const handleJumpSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(jumpPage, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page);
        setJumpPage('');
      }
    }
  };

  // Generate up to 5 visible pages
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-container-high bg-surface-bright px-4 py-3 sm:flex-row">
      {/* Rows per page & Total items */}
      <div className="flex items-center gap-4 text-sm text-on-surface-variant font-label-sm">
        <span>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}</span>
        
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <div className="relative">
            <input
              type="number"
              min="1"
              aria-label="Rows per page"
              className="h-8 w-20 appearance-none rounded border border-outline-variant/30 bg-surface px-2 text-center tabular-nums focus:border-primary focus:outline-none"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              onKeyDown={handleLimitSubmit}
              onBlur={handleLimitSubmit}
              list="limit-options"
            />
            <datalist id="limit-options">
              <option value="10" />
              <option value="20" />
              <option value="30" />
              <option value="40" />
              <option value="50" />
            </datalist>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-sm text-on-surface-variant">Go to:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            placeholder={currentPage.toString()}
            aria-label="Go to page"
            className="h-8 w-16 appearance-none rounded border border-outline-variant/30 bg-surface px-2 text-center text-sm tabular-nums focus:border-primary focus:outline-none"
            value={jumpPage}
            onChange={(e) => setJumpPage(e.target.value)}
            onKeyDown={handleJumpSubmit}
          />
        </div>

        <div className="flex gap-1">
          <button 
            className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50" 
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeftIcon aria-hidden="true" className="h-[18px] w-[18px]" />
          </button>
          
          {pages.map(p => (
            <button 
              key={p}
              className={`w-8 h-8 rounded font-label-sm font-semibold flex items-center justify-center transition-colors ${
                p === currentPage 
                  ? 'bg-primary-container text-on-primary-container' 
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ))}

          <button 
            className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50" 
            disabled={currentPage >= totalPages || totalPages === 0}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRightIcon aria-hidden="true" className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
