/**
 * Entry point: the motion bundle is fetched after the first contentful paint.
 * The page head already chose the held layout (html.motion), so if the bundle cannot load,
 * the page falls back to the plain layout rather than leaving chapters half set up.
 */
export {};

let started = false;
const start = () => {
  if (started) return;
  started = true;
  import('./main').catch(() => document.documentElement.classList.remove('motion'));
};

try {
  const po = new PerformanceObserver((list) => {
    if (list.getEntriesByName('first-contentful-paint').length) {
      po.disconnect();
      requestAnimationFrame(() => setTimeout(start, 0));
    }
  });
  po.observe({ type: 'paint', buffered: true });
} catch {
  // No paint timing support: fall through to the timer.
}
setTimeout(start, 1200);
