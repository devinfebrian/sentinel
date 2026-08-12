import * as XLSX from 'xlsx';

/**
 * Parses an uploaded spreadsheet (xlsx or csv) into import rows.
 *
 * Kept dependency-light and side-effect free so the mapping and coercion logic
 * is unit-testable without a browser. Only this module touches SheetJS; the
 * dialog consumes plain data.
 *
 * Column matching is by header alias (English + Indonesian), so the same file
 * imports whether it says "amount" or "nominal". Amounts accept both formats —
 * "25.000.000" (ID thousands-separator) and "25,000,000" (US) — and a leading
 * "Rp". Dates are YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or an Excel serial.
 */

export interface ParsedRow {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date?: string;
  invoice_no?: string;
  vendor_name?: string;
}

export interface ImportParseResult {
  rows: ParsedRow[];
  errors: { row: number; message: string }[];
  /** Blank rows dropped without an error. */
  skipped: number;
  /** Original column headers found, in file order. */
  headers: string[];
}

const HEADER_ALIASES: Record<keyof Omit<ParsedRow, 'amount' | 'type' | 'category' | 'description'> | 'amount' | 'type' | 'category' | 'description', string[]> = {
  amount: ['amount', 'nominal', 'jumlah', 'total', 'value', 'nilai'],
  type: ['type', 'jenis', 'tipe'],
  category: ['category', 'kategori'],
  description: ['description', 'deskripsi', 'keterangan', 'note', 'catatan'],
  date: ['date', 'tanggal', 'tgl', 'created_at', 'createdat'],
  invoice_no: ['invoice_no', 'invoiceno', 'invoice', 'faktur', 'no_faktur', 'no_invoice', 'nofaktur', 'noinvoice'],
  vendor_name: ['vendor_name', 'vendorname', 'vendor', 'supplier', 'nama_vendor', 'namavendor'],
};

/** Lowercase + strip non-alphanumerics so header matching is forgiving. */
const normalizeHeader = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Map a raw header to a canonical field name, or undefined if unknown. */
function fieldForHeader(header: string): keyof ParsedRow | undefined {
  const normalized = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.includes(normalized)) return field as keyof ParsedRow;
  }
  return undefined;
}

const pad = (n: number) => String(n).padStart(2, '0');

const toIsoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * SheetJS numeric cells may be an Excel serial date (days since 1899-12-30).
 * Excel dates live roughly in [20000, 80000]; a value there from a date column
 * is treated as one.
 */
function excelSerialToIso(serial: number): string {
  const date = XLSX.SSF.parse_date_code(serial);
  if (!date) return toIsoDate(new Date(Math.round((serial - 25569) * 86400 * 1000)));
  return `${date.y}-${pad(date.m)}-${pad(date.d)}`;
}

/**
 * Coerces a money cell to a number. Accepts raw numbers and the string forms
 * found in real exports — "Rp 25.000.000", "25,000,000", "25.5".
 * Returns null when unparseable.
 */
export function parseAmount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;

  let s = value.trim().replace(/^Rp\s?/i, '').replace(/\s/g, '');
  if (!s) return null;

  // Robust Indonesian format: assume dots are thousands, commas are decimals.
  s = s.replace(/\./g, '').replace(/,/g, '.').replace(/[^0-9.-]+/g, '');

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const EXPENSE_TYPES = new Set(['expense', 'exp', 'pengeluaran', 'biaya', 'keluar']);
const INCOME_TYPES = new Set(['income', 'inc', 'pendapatan', 'pemasukan', 'masuk', 'revenue']);

function parseType(value: unknown): 'income' | 'expense' | null {
  const s = String(value ?? '').trim().toLowerCase();
  if (EXPENSE_TYPES.has(s)) return 'expense';
  if (INCOME_TYPES.has(s)) return 'income';
  return null;
}

function parseDateCell(value: unknown): string | null {
  if (value instanceof Date) return toIsoDate(value);
  if (typeof value === 'number' && value >= 20000 && value < 80000) return excelSerialToIso(value);
  if (typeof value !== 'string') return null;

  const s = value.trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}`;
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
  return null;
}

/** True for cells that carry no data (blanks, "-", "n/a"). */
const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '');

/**
 * Converts a file's raw rows (sheet_to_json output: one object per row, keyed
 * by header) into validated import rows. One logical row in, one parsed row
 * out — no header auto-mapping beyond the alias table above.
 */
export function parseSpreadsheetRows(
  rawRows: Record<string, unknown>[],
  headers: string[] = []
): ImportParseResult {
  const rows: ParsedRow[] = [];
  const errors: { row: number; message: string }[] = [];
  let skipped = 0;

  rawRows.forEach((raw, index) => {
    const line = index + 2; // 1-based, header on row 1
    const get = (field: keyof ParsedRow) => {
      for (const [header, value] of Object.entries(raw)) {
        if (fieldForHeader(header) === field) return value;
      }
      return undefined;
    };

    const amount = parseAmount(get('amount'));
    const type = parseType(get('type'));
    const categoryRaw = String(get('category') ?? '').trim();
    const description = String(get('description') ?? '').trim() || '-';

    // A fully blank line is noise, not an error.
    if (
      amount === null &&
      type === null &&
      categoryRaw === '' &&
      description === '' &&
      isEmpty(get('date')) &&
      isEmpty(get('vendor_name'))
    ) {
      skipped += 1;
      return;
    }

    const rowErrors: string[] = [];
    if (amount === null) rowErrors.push('amount tidak terbaca sebagai angka');
    if (type === null) rowErrors.push('type harus income atau expense');
    if (categoryRaw === '') rowErrors.push('category wajib diisi');

    const dateCell = get('date');
    let date: string | undefined;
    if (!isEmpty(dateCell)) {
      date = parseDateCell(dateCell) ?? undefined;
      if (!date) rowErrors.push('date tidak dikenali (pakai YYYY-MM-DD)');
    }

    const invoiceRaw = String(get('invoice_no') ?? '').trim();
    const vendorRaw = String(get('vendor_name') ?? '').trim();

    if (rowErrors.length > 0) {
      errors.push({ row: line, message: rowErrors.join('; ') });
      return;
    }

    rows.push({
      amount: amount as number,
      type: type as 'income' | 'expense',
      category: categoryRaw,
      description,
      ...(date ? { date } : {}),
      ...(invoiceRaw ? { invoice_no: invoiceRaw } : {}),
      ...(vendorRaw ? { vendor_name: vendorRaw } : {}),
    });
  });

  return { rows, errors, skipped, headers };
}

/**
 * Reads an uploaded File into raw rows. Works for both .xlsx and .csv because
 * SheetJS handles both; the extension only picks how the bytes are read.
 */
export async function parseSpreadsheetFile(file: File): Promise<ImportParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const first = workbook.SheetNames[0];
  if (!first) return { rows: [], errors: [], skipped: 0, headers: [] };

  const sheet = workbook.Sheets[first];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: true,
  });

  const headers = Object.keys(rawRows[0] ?? {});
  return parseSpreadsheetRows(rawRows, headers);
}
