import { base } from './env';

/**
 * Newsreader sets prose that mostly appears below the fold, so it is requested after first
 * paint instead of competing with the hero. Until it arrives, the metric-matched Georgia
 * fallback holds the same line lengths. Adding the face to document.fonts before loading
 * fires the font events SplitText listens to, so line splits are redone with the real font.
 */
export function loadTextFont() {
  if (!('FontFace' in window)) return;
  const face = new FontFace('Newsreader', `url(${base}fonts/newsreader.woff2) format('woff2')`, {
    weight: '400 500',
    display: 'swap',
  });
  document.fonts.add(face);
  face.load().catch(() => document.fonts.delete(face));
}
