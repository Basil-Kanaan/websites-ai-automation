/** Shared runtime facts, computed once. */
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

export const base = import.meta.env.BASE_URL;

/** Desktop layouts, where the sorting and side-by-side scenes have room. */
export const WIDE = '(min-width: 1024px)';

export function q<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T {
  const el = scope.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export function qa<T extends Element = HTMLElement>(selector: string, scope: ParentNode = document): T[] {
  return Array.from(scope.querySelectorAll<T>(selector));
}

declare global {
  interface Window {
    track?: (name: string, params?: Record<string, unknown>) => void;
  }
}

/** Sends a GA4 event through the snippet in index.html; a no-op when analytics is off. */
export function track(name: string, params?: Record<string, unknown>) {
  window.track?.(name, params);
}
