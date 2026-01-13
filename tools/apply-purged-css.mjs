import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const purgedRoot = path.join(repoRoot, 'output', 'purgecss', 'css');
const cssRoot = path.join(repoRoot, 'css');

function walkFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full));
    else out.push(full);
  }
  return out;
}

function ts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

if (!fs.existsSync(purgedRoot)) {
  console.error(`No purge output found at: ${purgedRoot}`);
  console.error('Run: npm run css:purge');
  process.exit(1);
}

const purgedFiles = walkFiles(purgedRoot).filter((p) => p.toLowerCase().endsWith('.css'));
if (purgedFiles.length === 0) {
  console.error(`No .css files found under: ${purgedRoot}`);
  process.exit(1);
}

const backupRoot = path.join(repoRoot, 'output', `css-backup-${ts()}`);
let changed = 0;
let missing = 0;

for (const purgedFile of purgedFiles) {
  const rel = path.relative(purgedRoot, purgedFile); // e.g. homepage.css
  const target = path.join(cssRoot, rel);
  const backup = path.join(backupRoot, rel);

  if (!fs.existsSync(target)) {
    console.warn(`Skipping (no matching source): css/${rel.replaceAll('\\\\', '/')}`);
    missing += 1;
    continue;
  }

  fs.mkdirSync(path.dirname(backup), { recursive: true });
  fs.copyFileSync(target, backup);

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(purgedFile, target);

  changed += 1;
}

console.log(`Applied ${changed} purged CSS file(s).`);
console.log(`Backups written to: ${path.relative(repoRoot, backupRoot).replaceAll('\\\\', '/')}`);
if (missing) console.log(`Skipped ${missing} file(s) with no match under css/.`);
