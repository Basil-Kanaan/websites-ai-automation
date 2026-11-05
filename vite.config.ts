import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

/**
 * Inlines each page's stylesheet into its HTML at build time. The CSS is small, and
 * inlining removes a render-blocking request before the hero can paint.
 */
function inlineCss(): Plugin {
  return {
    name: 'bridge:inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const inlined = new Set<string>();
      for (const page of Object.values(bundle)) {
        if (page.type !== 'asset' || !page.fileName.endsWith('.html')) continue;
        let source = String(page.source);
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type !== 'asset' || !fileName.endsWith('.css')) continue;
          const linkRe = new RegExp(`<link rel="stylesheet"[^>]*href="[^"]*${fileName.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"[^>]*>`);
          if (!linkRe.test(source)) continue;
          source = source.replace(linkRe, () => `<style>${String(chunk.source)}</style>`);
          inlined.add(fileName);
        }
        page.source = source;
      }
      inlined.forEach((fileName) => delete bundle[fileName]);
    },
  };
}

/**
 * `<!-- include:partials/x.html key=value -->` pastes a partial into index.html, with
 * {{key}} replaced by value (underscores become spaces).
 */
function partials(): Plugin {
  return {
    name: 'bridge:partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!--\s*include:(\S+)((?:\s+\w+=\S+)*)\s*-->/g, (_match, file: string, args: string) => {
          let source = fs.readFileSync(path.join(ROOT, file), 'utf8');
          for (const [, key, value] of args.matchAll(/(\w+)=(\S+)/g)) {
            source = source.replaceAll(`{{${key}}}`, value.replaceAll('_', ' '));
          }
          return source.replace(/\{\{\w+\}\}/g, '').trim();
        });
      },
    },
    configureServer(server) {
      server.watcher.add(path.join(ROOT, 'partials'));
      server.watcher.on('change', (file) => {
        if (file.includes(`${path.sep}partials${path.sep}`)) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}

export default defineConfig({
  base: '/websites-ai-automation/',
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
    reportCompressedSize: true,
  },
  plugins: [partials(), inlineCss()],
});
