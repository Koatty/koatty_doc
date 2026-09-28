#!/usr/bin/env node
/**
 * Documentation integrity check for the koatty-doc site (docsify).
 *
 * Replaces the previous `jest --passWithNoTests` stub: koatty-doc has no
 * dependencies at all, so `jest` could not even be resolved and the script
 * failed (CI "Test" job red) instead of checking anything.
 *
 * Zero-dependency checks:
 *   1. required site files exist (index.html / _sidebar.md / CNAME / .nojekyll)
 *   2. every relative markdown link in docs/** resolves to an existing file
 *   3. every markdown page is reachable from _sidebar.md
 *
 * Exit code 0 = docs are consistent, 1 = problems found.
 */

const fs = require('fs');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(PKG_ROOT, 'docs');
const REQUIRED_FILES = ['index.html', '_sidebar.md', 'CNAME', '.nojekyll'];
const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const EXTERNAL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

function listMarkdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdownFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(PKG_ROOT, file);
}

const problems = [];

for (const required of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(DOCS_DIR, required))) {
    problems.push(`missing required site file: docs/${required}`);
  }
}

const markdownFiles = listMarkdownFiles(DOCS_DIR);
let checkedLinks = 0;

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const match of content.matchAll(LINK_RE)) {
    const target = match[1];
    if (EXTERNAL_RE.test(target)) continue; // http(s):, mailto:, //cdn...
    const clean = target.split('#')[0].split('?')[0];
    if (!clean) continue; // pure in-page anchor
    checkedLinks += 1;
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(clean));
    if (!fs.existsSync(resolved)) {
      problems.push(`${rel(file)}: broken link -> ${target}`);
    }
  }
}

// every docs page should be reachable from the sidebar (nav completeness)
const sidebarPath = path.join(DOCS_DIR, '_sidebar.md');
if (fs.existsSync(sidebarPath)) {
  const sidebar = fs.readFileSync(sidebarPath, 'utf8');
  const navTargets = new Set(
    [...sidebar.matchAll(LINK_RE)]
      .map((m) => path.resolve(DOCS_DIR, m[1].split('#')[0].split('?')[0]))
  );
  for (const file of markdownFiles) {
    if (path.basename(file).startsWith('README')) continue; // site home pages
    if (file === sidebarPath) continue; // the sidebar itself is not a nav target
    if (!navTargets.has(file)) {
      problems.push(`${rel(file)}: not linked from docs/_sidebar.md`);
    }
  }
}

if (problems.length > 0) {
  console.error(`❌ koatty-doc: ${problems.length} documentation problem(s):`);
  for (const problem of problems) console.error(`   - ${problem}`);
  process.exit(1);
}

console.log(
  `✅ koatty-doc: ${markdownFiles.length} page(s), ${checkedLinks} relative link(s), ` +
    `${REQUIRED_FILES.length} required site file(s) — all OK`
);
