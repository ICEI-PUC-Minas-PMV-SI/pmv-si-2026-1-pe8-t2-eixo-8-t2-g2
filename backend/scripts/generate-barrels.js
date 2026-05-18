import { readdir, writeFile } from 'fs/promises';
import { join, extname, basename } from 'path';

const IGNORED_EXT = new Set(['.d.ts']);
const FILE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);

async function generate(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  const dirs = [];
  const files = [];

  for (const ent of entries) {
    if (ent.name === 'index.ts' || ent.name === 'index.tsx' || ent.name === 'index.js') continue;
    if (ent.isDirectory()) dirs.push(ent.name);
    if (ent.isFile()) {
      const ext = extname(ent.name);
      if (IGNORED_EXT.has(ext + (ent.name.endsWith('.d.ts') ? '.d.ts' : ''))) continue;
      if (FILE_EXTS.has(ext)) files.push(ent.name);
    }
  }

  // Recurse into subdirectories first
  const ignoredDirs = ['src', 'api', 'generated'];
  for (const d of dirs) {
    if (!ignoredDirs.includes(d)) {
      await generate(join(dir, d));
    }
  }

  const exports = [];

  for (const f of files) {
    // skip test/spec files
    if (f.includes('.spec.') || f.includes('.test.')) continue;
    const name = basename(f, extname(f));
    exports.push(`export * from './${name}.js';`);
  }

  for (const d of dirs) {
    exports.push(`export * from './${d}/index.js';`);
  }

  if (exports.length === 0) return;

  const content = exports.join('\n') + '\n';
  if (dir !== 'src' && !dir.includes('prisma')) {
    await writeFile(join(dir, 'index.ts'), content, 'utf8');
    console.log('Wrote', join(dir, 'index.ts'));
  }
}

const target = process.argv[2] || 'src';
generate(target).catch((err) => {
  console.error(err);
  process.exit(1);
});
