import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = process.cwd();
const mode = process.argv[2] === '--typecheck' ? 'typecheck' : 'lint';

function run(command, args) {
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

function getStagedFiles() {
  const output = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '--relative'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
    }
  );

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isRelevant(file) {
  return /\.(ts|tsx|js|jsx|mjs|cjs|astro)$/i.test(file);
}

function writeTempConfig(files, fileType) {
  const tempConfigPath = path.join(os.tmpdir(), `copilot-staged-${Date.now()}-${fileType}.json`);
  const include = files.map((file) => path.resolve(repoRoot, file));
  const config = {
    extends: path.join(repoRoot, 'tsconfig.json'),
    include,
    exclude: ['dist', 'node_modules', '.astro'],
  };

  fs.writeFileSync(tempConfigPath, `${JSON.stringify(config, null, 2)}\n`);
  return tempConfigPath;
}

const stagedFiles = getStagedFiles().filter(isRelevant);

if (stagedFiles.length === 0) {
  console.log(`No relevant staged files for ${mode}; skipping.`);
  process.exit(0);
}

const tsFiles = stagedFiles.filter((file) => /\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(file));
const astroFiles = stagedFiles.filter((file) => /\.astro$/i.test(file));

try {
  if (mode === 'typecheck') {
    if (tsFiles.length > 0) {
      const tempConfigPath = writeTempConfig(tsFiles, 'typecheck');
      try {
        run('npx', ['tsc', '--pretty', 'false', '--noEmit', '--skipLibCheck', '--project', tempConfigPath]);
      } finally {
        fs.unlinkSync(tempConfigPath);
      }
    } else {
      console.log('No TypeScript staged files for typecheck; skipping.');
    }
  } else {
    if (tsFiles.length > 0) {
      const tempConfigPath = writeTempConfig(tsFiles, 'lint');
      try {
        run('npx', ['tsc', '--pretty', 'false', '--noEmit', '--skipLibCheck', '--project', tempConfigPath]);
      } finally {
        fs.unlinkSync(tempConfigPath);
      }
    }

    if (astroFiles.length > 0) {
      const tempConfigPath = writeTempConfig(astroFiles, 'astro');
      try {
        run('npx', ['astro', 'check', '--tsconfig', tempConfigPath]);
      } finally {
        fs.unlinkSync(tempConfigPath);
      }
    }
  }
} finally {
  // no-op
}
