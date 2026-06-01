#!/usr/bin/env node
// export-xlsx.mjs — listai data exporter.
//
// Turns CSV/TSV files into a shareable .xlsx (Excel / Google Sheets) workbook.
// Each input file becomes one sheet. Header row is frozen + filtered, columns
// are auto-sized, and numeric cells are written as real numbers.
//
// ZERO DEPENDENCIES — uses only Node built-ins (no `xlsx` package, no install).
// An .xlsx is just a ZIP of XML parts; this builds that package by hand.
//
// Usage:
//   node export-xlsx.mjs <output.xlsx> <input1.csv|tsv> [input2 ...]
//
// Examples:
//   node export-xlsx.mjs output/shortlist.xlsx output/shortlist.csv
//   node export-xlsx.mjs output/listai.xlsx output/shortlist.csv data/scan-history.tsv
//
// Delimiter is inferred from the extension (.tsv => tab, otherwise comma).

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// ---------------------------------------------------------------- CRC32
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------- ZIP writer
// entries: [{ name, data:Buffer }]  ->  Buffer (deflated zip)
function makeZip(entries) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const e of entries) {
    const nameBuf = Buffer.from(e.name, 'utf8');
    const comp = zlib.deflateRawSync(e.data);
    const crc = crc32(e.data);

    const lfh = Buffer.alloc(30);
    lfh.writeUInt32LE(0x04034b50, 0); // local file header sig
    lfh.writeUInt16LE(20, 4);         // version needed
    lfh.writeUInt16LE(0, 6);          // flags
    lfh.writeUInt16LE(8, 8);          // method: deflate
    lfh.writeUInt16LE(0, 10);         // mod time
    lfh.writeUInt16LE(0x21, 12);      // mod date (1980-01-01)
    lfh.writeUInt32LE(crc, 14);
    lfh.writeUInt32LE(comp.length, 18);
    lfh.writeUInt32LE(e.data.length, 22);
    lfh.writeUInt16LE(nameBuf.length, 26);
    lfh.writeUInt16LE(0, 28);
    local.push(lfh, nameBuf, comp);

    const cdr = Buffer.alloc(46);
    cdr.writeUInt32LE(0x02014b50, 0); // central dir sig
    cdr.writeUInt16LE(20, 4);         // version made by
    cdr.writeUInt16LE(20, 6);         // version needed
    cdr.writeUInt16LE(0, 8);
    cdr.writeUInt16LE(8, 10);
    cdr.writeUInt16LE(0, 12);
    cdr.writeUInt16LE(0x21, 14);
    cdr.writeUInt32LE(crc, 16);
    cdr.writeUInt32LE(comp.length, 20);
    cdr.writeUInt32LE(e.data.length, 24);
    cdr.writeUInt16LE(nameBuf.length, 28);
    cdr.writeUInt16LE(0, 30);
    cdr.writeUInt16LE(0, 32);
    cdr.writeUInt16LE(0, 34);
    cdr.writeUInt16LE(0, 36);
    cdr.writeUInt32LE(0, 38);
    cdr.writeUInt32LE(offset, 42);
    central.push(cdr, nameBuf);

    offset += lfh.length + nameBuf.length + comp.length;
  }
  const localBuf = Buffer.concat(local);
  const centralBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(localBuf.length, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([localBuf, centralBuf, eocd]);
}

// ---------------------------------------------------------------- CSV/TSV parse
function parseDelimited(text, delim) {
  const rows = [];
  let row = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') inQ = true;
    else if (ch === delim) { row.push(field); field = ''; }
    else if (ch === '\r') { /* skip */ }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  // drop fully empty rows
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

// ---------------------------------------------------------------- XML helpers
const xmlEsc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function colLetter(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

const isNumeric = (v) => v !== '' && /^-?\d+(\.\d+)?$/.test(v.trim()) && v.trim().length <= 15;

function sheetXml(rows) {
  const nRows = rows.length || 1;
  const nCols = Math.max(1, ...rows.map((r) => r.length));
  const ref = `A1:${colLetter(nCols)}${nRows}`;

  // auto column widths
  let cols = '<cols>';
  for (let c = 0; c < nCols; c++) {
    let w = 8;
    for (const r of rows) w = Math.max(w, String(r[c] ?? '').length + 2);
    cols += `<col min="${c + 1}" max="${c + 1}" width="${Math.min(w, 100)}" customWidth="1"/>`;
  }
  cols += '</cols>';

  let sd = '<sheetData>';
  rows.forEach((r, ri) => {
    sd += `<row r="${ri + 1}">`;
    for (let ci = 0; ci < r.length; ci++) {
      const cellRef = `${colLetter(ci + 1)}${ri + 1}`;
      const val = r[ci] == null ? '' : String(r[ci]);
      if (ri > 0 && isNumeric(val)) {
        sd += `<c r="${cellRef}" t="n"><v>${val.trim()}</v></c>`;
      } else {
        sd += `<c r="${cellRef}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(val)}</t></is></c>`;
      }
    }
    sd += '</row>';
  });
  sd += '</sheetData>';

  const views =
    '<sheetViews><sheetView workbookViewId="0">' +
    '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' +
    '</sheetView></sheetViews>';
  const autofilter = `<autoFilter ref="${ref}"/>`;

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<dimension ref="${ref}"/>${views}${cols}${sd}${autofilter}</worksheet>`
  );
}

function sanitizeSheetName(name, taken) {
  let n = name.replace(/[[\]:*?/\\]/g, ' ').trim().slice(0, 31) || 'Sheet';
  let base = n;
  let i = 2;
  while (taken.has(n.toLowerCase())) n = `${base.slice(0, 28)} ${i++}`;
  taken.add(n.toLowerCase());
  return n;
}

// ---------------------------------------------------------------- main
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node export-xlsx.mjs <output.xlsx> <input1.csv|tsv> [input2 ...]');
  process.exit(1);
}
const outPath = args[0];
const inputs = args.slice(1);
const taken = new Set();

const sheets = inputs.map((f) => {
  if (!fs.existsSync(f)) {
    console.error(`Input not found: ${f}`);
    process.exit(1);
  }
  const delim = f.toLowerCase().endsWith('.tsv') ? '\t' : ',';
  const rows = parseDelimited(fs.readFileSync(f, 'utf8'), delim);
  const name = sanitizeSheetName(path.basename(f).replace(/\.[^.]+$/, ''), taken);
  return { name, rows };
});

const parts = [];
const ct =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/>' +
  '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
  sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('') +
  '</Types>';
parts.push({ name: '[Content_Types].xml', data: Buffer.from(ct) });

parts.push({
  name: '_rels/.rels',
  data: Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
      '</Relationships>'
  ),
});

parts.push({
  name: 'xl/workbook.xml',
  data: Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
      sheets
        .map((s, i) => `<sheet name="${xmlEsc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
        .join('') +
      '</sheets></workbook>'
  ),
});

parts.push({
  name: 'xl/_rels/workbook.xml.rels',
  data: Buffer.from(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      sheets
        .map(
          (_, i) =>
            `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`
        )
        .join('') +
      '</Relationships>'
  ),
});

sheets.forEach((s, i) => {
  parts.push({ name: `xl/worksheets/sheet${i + 1}.xml`, data: Buffer.from(sheetXml(s.rows)) });
});

fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(outPath, makeZip(parts));
const totalRows = sheets.reduce((a, s) => a + s.rows.length, 0);
console.log(
  `Wrote ${outPath} — ${sheets.length} sheet(s): ${sheets.map((s) => `"${s.name}" (${s.rows.length} rows)`).join(', ')}, ${totalRows} rows total.`
);
