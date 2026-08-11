#!/usr/bin/env node
/**
 * Menarik kontrak temuan dari snapshot OpenAPI agent server dan men-generate
 * lib/contract/findings.contract.ts — satu-sumber untuk tipe enum dan bentuk
 * baris temuan di sisi klien.
 *
 *   npm run contract:pull       tulis ulang contract (dikomit)
 *   npm run contract:check      bandingkan fingerprint tersimpan dengan sumber
 *
 * Sumber snapshot:
 *   AGENT_CONTRACT_URL   URL http(s) atau path file. Default: sibling repo
 *   ../sentinel-agent-server/openapi/snapshot.json.
 *
 * Snapshot dihasilkan agent server lewat `python scripts/export_openapi.py`.
 * Agent server adalah sumber kebenaran; berkas ini hanya menyalin enum dan
 * skema barisnya.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'lib', 'contract', 'findings.contract.ts');
const CHECK = process.argv.includes('--check');

/** Deskripsi field yang dipertahankan dari api.ts; menyatu dengan kontrak. */
const FIELD_DOCS = {
  related_transaction_ids: 'Every transaction this one finding covers, anchor included.',
  risk_label: 'Indonesian display text. The UI renders `risk_level` instead.',
  recommended_action: 'Indonesian, one sentence per risk band.',
  description: 'Indonesian. The LLM narrative, or a fact-assembled fallback when it failed.',
  narrative_stale:
    'More transactions joined after the narrative was written: the numbers are current, the sentence is not.',
  clear_rate: 'Null when no finding exists yet — which is not the same as zero percent cleared.',
};

async function loadSnapshot() {
  const src =
    process.env.AGENT_CONTRACT_URL ||
    path.join(path.dirname(ROOT), 'sentinel-agent-server', 'openapi', 'snapshot.json');

  if (/^https?:\/\//.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`AGENT_CONTRACT_URL ${src} -> HTTP ${res.status}`);
    return res.text();
  }
  return await readFile(src, 'utf-8');
}

function enumValues(prop) {
  if (prop?.enum) return prop.enum;
  if (Array.isArray(prop?.anyOf)) return prop.anyOf.find((o) => o.enum)?.enum;
  return undefined;
}

function toTsType(prop) {
  if (prop.enum) {
    return prop.enum.map((v) => JSON.stringify(v)).join(' | ');
  }
  if (prop.propertyNames?.enum) {
    const keyUnion = prop.propertyNames.enum.map((v) => JSON.stringify(v)).join(' | ');
    return `Partial<Record<${keyUnion}, number>>`;
  }
  if (prop.anyOf) {
    const nullable = prop.anyOf.some((o) => o.type === 'null');
    const types = prop.anyOf.filter((o) => o.type !== 'null').map(toTsType);
    return `(${types.join(' | ')})${nullable ? ' | null' : ''}`;
  }
  switch (prop.type) {
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return `${toTsType(prop.items)}[]`;
    case 'object':
      return 'Record<string, unknown>';
    default:
      return 'string';
  }
}

function renderInterface(name, schema, extraInterface) {
  const lines = [`export interface ${name} {`];
  for (const [field, prop] of Object.entries(schema.properties ?? {})) {
    if (FIELD_DOCS[field]) lines.push(`  /** ${FIELD_DOCS[field]} */`);
    lines.push(`  ${field}: ${toTsType(prop)};`);
  }
  lines.push('}');
  if (extraInterface) lines.push(extraInterface);
  return lines.join('\n');
}

function render(raw, fingerprint) {
  const spec = JSON.parse(raw);
  const row = spec.components?.schemas?.FindingRow;
  const summary = spec.components?.schemas?.FindingSummary;
  if (!row || !summary) throw new Error('Skema FindingRow/FindingSummary tidak ada di snapshot');

  const statusParam = spec.paths?.['/api/findings']?.get?.parameters?.find(
    (p) => p.name === 'status'
  );
  const status = statusParam?.schema?.enum;
  const risk = enumValues(row.properties?.risk_level);
  const resolution = enumValues(row.properties?.resolution);
  if (!status || !risk || !resolution) {
    throw new Error('Enum risk_level/resolution/status tidak ditemukan di snapshot');
  }

  const arr = (a) => `[${a.map((v) => JSON.stringify(v)).join(', ')}]`;
  const union = (a) => `(typeof ${a})[number]`;
  const body = [
    '// AUTO-GENERATED. Jangan edit. Sumber: snapshot OpenAPI sentinel-agent-server.',
    '// Regenerasi: npm run contract:pull',
    `// Fingerprint: ${fingerprint}`,
    '',
    `export const RISK_LEVELS = ${arr(risk)} as const;`,
    `export const RESOLUTIONS = ${arr(resolution)} as const;`,
    `export const FINDING_STATUS_FILTERS = ${arr(status)} as const;`,
    '',
    `export type RiskLevel = ${union('RISK_LEVELS')};`,
    `export type Resolution = ${union('RESOLUTIONS')};`,
    `export type FindingStatusFilter = ${union('FINDING_STATUS_FILTERS')};`,
    '',
    '/** One finding row as served by the agent server. */',
    renderInterface('FindingRow', row),
    '',
    '/** Headline counts for the findings page. */',
    renderInterface('SummaryRow', summary),
    '',
  ].join('\n');
  return body;
}

const raw = await loadSnapshot();
// Fingerprint the LF-normalized text, not the raw bytes: a Windows checkout
// smudges CRLF into the snapshot while Linux CI reads LF, so hashing the raw
// file makes the same snapshot hash differently per platform and trips
// contract:check spuriously.
const normalized = raw.replace(/\r\n/g, '\n');
const fingerprint = createHash('sha256').update(normalized).digest('hex').slice(0, 16);

if (CHECK) {
  let stored;
  try {
    const file = await readFile(OUT, 'utf-8');
    stored = file.match(/Fingerprint: ([0-9a-f]+)/)?.[1];
  } catch {
    stored = null;
  }
  if (stored !== fingerprint) {
    console.error(`contract STALE: tersimpan ${stored ?? '(tidak ada)'}, sumber ${fingerprint}.`);
    console.error('Jalankan npm run contract:pull lalu komit hasilnya.');
    process.exit(1);
  }
  console.log(`contract OK (fingerprint ${fingerprint})`);
  process.exit(0);
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, render(raw, fingerprint), 'utf-8');
console.log(`contract -> ${OUT} (fingerprint ${fingerprint})`);
