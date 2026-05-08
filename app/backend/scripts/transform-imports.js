#!/usr/bin/env node
/*
  Utility to convert TypeScript path-alias imports ("@utils", "@controllers", etc.)
  into relative imports and back again.

  Usage:
    node transform-imports.js transform   # rewrite aliases -> relative paths (.js)
    node transform-imports.js revert      # rewrite relative paths -> aliases

  It reads the `baseUrl` and `paths` mapping from backend/tsconfig.json and
  scans all .ts/.js files under backend/src.  Only the *first* target path for
  each alias is considered.  Wildcards (`/*`) are stripped for simplicity.

  When transforming to relative paths the script converts `.ts` extensions to
  `.js` so the output should match compiled output (you can tweak this if you
  are working in source).
*/

import fs from 'fs';
import path from 'path';

// const backendPath = path.dirname(path.join(process.argv[1] || '', '..'));
// const projectRoot = path.resolve('backend');
const projectRoot = path.dirname(path.join(process.argv[1] || '', '..'));
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
if (!fs.existsSync(tsconfigPath)) {
  console.error('tsconfig.json not found at', tsconfigPath);
  process.exit(1);
}

const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
const baseUrl = tsconfig.compilerOptions?.baseUrl || '.';
const paths = tsconfig.compilerOptions?.paths || {};

// build a map alias -> absolute target file path
const aliasMap = {};
for (const alias in paths) {
  const list = paths[alias];
  if (!Array.isArray(list) || list.length === 0) continue;
  const key = alias.replace(/\/*$/, ''); // strip trailing /* if present
  const target = list[0].replace(/\/*$/, '');
  aliasMap[key] = path.resolve(projectRoot, baseUrl, target);
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      walk(fp, files);
    } else if (/\.tsx?$/.test(name) || /\.jsx?$/.test(name)) {
      files.push(fp);
    }
  }
  return files;
}

function toRelative(fromFile, alias) {
  const target = aliasMap[alias];
  if (!target) return null;
  let rel = path.relative(path.dirname(fromFile), target);
  if (!rel.startsWith('.')) rel = './' + rel;
  rel = rel.replace(/\\/g, '/');
  // when transforming to JS reference the compiled file
  rel = rel.replace(/\.ts$/, '.js');
  return rel;
}

function transformFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  for (const alias of Object.keys(aliasMap)) {
    const rel = toRelative(filePath, alias);
    if (!rel) continue;
    const pattern = `(['\"\\\`])${alias}(/[^'\"\`]+)?\\1`;
    const regex = new RegExp(pattern, 'g');
    content = content.replace(regex, (match, quote, suffix) => {
      modified = true;
      return `${quote}${rel.replace(/\/$/, '')}${suffix || ''}${quote}`;
    });
  }
  if (modified) fs.writeFileSync(filePath, content);
}

function revertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  for (const alias of Object.keys(aliasMap)) {
    const rel = toRelative(filePath, alias);
    if (!rel) continue;
    // escape for regex
    const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = `(['\"\\\`])${escaped}(?:/[^'\"\`]+)?\\1`;
    const regex = new RegExp(pattern, 'g');
    content = content.replace(regex, (match, quote) => {
      modified = true;
      return `${quote}${alias}${quote}`;
    });
  }
  if (modified) fs.writeFileSync(filePath, content);
}

function main() {
  const cmd = process.argv[2];
  if (!cmd || (cmd !== 'transform' && cmd !== 'revert')) {
    console.log('Usage: node transform-imports.js [transform|revert]');
    process.exit(1);
  }

  const sourceDir = path.join(projectRoot, 'src');
  const files = walk(sourceDir);
  files.forEach((f) => {
    if (cmd === 'transform') transformFile(f);
    else revertFile(f);
  });
  console.log(`Completed ${cmd} on ${files.length} files.`);
}

main();
