// Writes partials/net.html: the small neural network drawn in the "Who's building it"
// chapter. Every node in a layer connects to every node in the next, as in a real dense
// network. Usage: node scripts/net.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const xs = [70, 215, 360, 500];
const layers = [
  [110, 190, 270],
  [62, 126, 190, 254, 318],
  [62, 126, 190, 254, 318],
  [150, 230],
];

let edges = '';
for (let l = 0; l < layers.length - 1; l++) {
  for (const [i, y1] of layers[l].entries()) {
    for (const [j, y2] of layers[l + 1].entries()) {
      edges += `<line class="net__edge" data-l="${l}" data-from="${i}" data-to="${j}" x1="${xs[l]}" y1="${y1}" x2="${xs[l + 1]}" y2="${y2}" />`;
    }
  }
}
let nodes = '';
layers.forEach((ys, l) =>
  ys.forEach((y, i) => {
    nodes += `<circle class="net__node" data-l="${l}" data-i="${i}" cx="${xs[l]}" cy="${y}" r="9" />`;
  }),
);

const html = `<svg class="net__svg" viewBox="0 0 570 380" aria-hidden="true" data-layers='${JSON.stringify(layers)}' data-xs='${JSON.stringify(xs)}'>
  <g class="net__edges">${edges}</g>
  <g class="net__signals" data-signals></g>
  <g class="net__nodes">${nodes}</g>
</svg>
`;
fs.writeFileSync(path.join(ROOT, 'partials', 'net.html'), html);
console.log(`partials/net.html: ${layers.flat().length} nodes, ${(edges.match(/<line/g) || []).length} edges`);
