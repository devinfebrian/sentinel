import { describe, it, expect } from 'vitest';
import { parseAmount, parseSpreadsheetRows } from './parse-file';

describe('parseAmount', () => {
  it('accepts raw numbers', () => {
    expect(parseAmount(25000000)).toBe(25000000);
  });

  it('accepts ID thousands separator', () => {
    expect(parseAmount('25.000.000')).toBe(25000000);
  });

  it('accepts ID thousands with decimal comma', () => {
    expect(parseAmount('25.000.000,50')).toBe(25000000.5);
  });

  it('accepts US thousands separator', () => {
    expect(parseAmount('25,000,000')).toBe(25000000);
  });

  it('accepts leading Rp', () => {
    expect(parseAmount('Rp 25.000.000')).toBe(25000000);
  });

  it('rejects garbage', () => {
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('')).toBeNull();
    expect(parseAmount(null)).toBeNull();
  });
});

describe('parseSpreadsheetRows', () => {
  it('maps aliased headers (English + Indonesian)', () => {
    const { rows, errors } = parseSpreadsheetRows([
      {
        nominal: '45.000.000',
        jenis: 'expense',
        kategori: 'Office Supplies',
        keterangan: 'Pembelian ATK',
        tanggal: '2026-07-15',
        vendor: 'CV. ATK Sejahtera',
      },
    ]);
    expect(errors).toHaveLength(0);
    expect(rows[0]).toEqual({
      amount: 45000000,
      type: 'expense',
      category: 'Office Supplies',
      description: 'Pembelian ATK',
      date: '2026-07-15',
      vendor_name: 'CV. ATK Sejahtera',
    });
  });

  it('skips fully blank lines silently', () => {
    const { rows, errors, skipped } = parseSpreadsheetRows([
      { amount: null, type: null, category: null, description: null },
      { amount: 1000, type: 'expense', category: 'Office Supplies', description: 'x' },
    ]);
    expect(skipped).toBe(1);
    expect(rows).toHaveLength(1);
    expect(errors).toHaveLength(0);
  });

  it('reports per-row errors with 1-based line numbers', () => {
    const { rows, errors } = parseSpreadsheetRows([
      { amount: 1000, type: 'expense', category: 'Office Supplies', description: 'ok' },
      { amount: 'not-a-number', type: 'expense', category: 'Office Supplies', description: 'bad' },
    ]);
    expect(rows).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(3); // header row 1 + two data rows
    expect(errors[0].message).toMatch(/amount/);
  });

  it('interprets DD/MM/YYYY dates', () => {
    const { rows } = parseSpreadsheetRows([
      { amount: 1, type: 'income', category: 'Sales', description: 'x', date: '15/07/2026' },
    ]);
    expect(rows[0].date).toBe('2026-07-15');
  });

  it('derives no date when the cell is empty', () => {
    const { rows } = parseSpreadsheetRows([
      { amount: 1, type: 'income', category: 'Sales', description: 'x', date: null },
    ]);
    expect(rows[0].date).toBeUndefined();
  });

  it('omits invoice and vendor fields when absent', () => {
    const { rows } = parseSpreadsheetRows([
      { amount: 1, type: 'income', category: 'Sales', description: 'x' },
    ]);
    expect(rows[0]).not.toHaveProperty('invoice_no');
    expect(rows[0]).not.toHaveProperty('vendor_name');
  });
});
