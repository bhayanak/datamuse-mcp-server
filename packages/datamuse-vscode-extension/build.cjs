const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function build() {
  // Build the extension
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src', 'extension.ts')],
    bundle: true,
    outfile: path.join(__dirname, 'dist', 'extension.js'),
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    minify: true,
  });

  // Copy server bundle into extension
  const serverSrc = path.join(__dirname, '..', 'datamuse-server', 'dist', 'index.js');
  const serverDest = path.join(__dirname, 'server', 'index.js');
  fs.mkdirSync(path.dirname(serverDest), { recursive: true });
  if (fs.existsSync(serverSrc)) {
    fs.copyFileSync(serverSrc, serverDest);
    console.log('Server bundle copied to extension');
  } else {
    console.warn('Warning: Server bundle not found at', serverSrc);
    console.warn('Build the server first: cd ../datamuse-server && pnpm run build');
  }

  console.log('Extension built successfully');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
