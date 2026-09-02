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

const stagedFiles = getStagedFiles().filter(isRelevant);

if (stagedFiles.length === 0) {
  console.log(`No relevant staged files for ${mode}; skipping.`);
  process.exit(0);
}

const tempConfigPath = path.join(os.tmpdir(), `copilot-staged-${mode}-${Date.now()}.json`);
const include = stagedFiles.map((file) => path.resolve(repoRoot, file));
const config = {
  extends: path.join(repoRoot, 'tsconfig.json'),
  include,
  exclude: ['dist', 'node_modules', '.astro'],
};

fs.writeFileSync(tempConfigPath, `${JSON.stringify(config, null, 2)}\n`);

try {
  if (mode === 'typecheck') {
    run('npx', ['tsc', '--pretty', 'false', '--noEmit', '--project', tempConfigPath]);
  } else {
    run('npx', ['astro', 'check', '--tsconfig', tempConfigPath]);
  }
} finally {
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
}
