const fs = require('fs');
const path = require('path');

const tsconfigPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@monaco-editor',
  'react',
  'tsconfig.json'
);

if (!fs.existsSync(tsconfigPath)) {
  process.exit(0);
}

const raw = fs.readFileSync(tsconfigPath, 'utf8');
const config = JSON.parse(raw);
const compilerOptions = config.compilerOptions || {};

if (compilerOptions.ignoreDeprecations === '6.0') {
  process.exit(0);
}

compilerOptions.ignoreDeprecations = '6.0';
config.compilerOptions = compilerOptions;

fs.writeFileSync(tsconfigPath, `${JSON.stringify(config, null, 2)}\n`);
