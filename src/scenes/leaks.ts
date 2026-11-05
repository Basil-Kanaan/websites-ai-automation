import { gsap } from 'gsap';
import { q, qa } from '../env';
import { beats, fade, hold, motion, setText } from '../stage';

/**
 * 04 Where you're losing. The chapter holds while it plays in place: the intro with the 6
 * leaks at a glance, then each leak in 2 steps, then the close. A leak's first step shows
 * its example (made-up numbers, labelled so): the people or money that slip away drop
 * out of the row. Its second step brings in the fix, and the same row is handled, in
 * brass. A tally at the top counts the leaks fixed; scrolling back undoes them in order.
 * Without motion the leaks are listed in turn, each example with both outcomes.
 */
export function initLeaks() {
  if (!motion) return;
  const pin = q('#leaks [data-pin]');
  const layers = qa('[data-step]', pin);
  const leaks = qa('.s6__leak', pin);
  const vigs = leaks.map((li) => q('[data-vig]', li));
  const fixes = leaks.map((li) => q('[data-fix]', li));
  const ticks = qa('.s6__ticks i', pin);
  const sealed = q('[data-sealed]', pin);

  // Steps: the intro, a problem and a fix for each leak, the close.
  const steps = 2 + leaks.length * 2;
  const leakOf = (step: number) => (step > 0 && step < steps - 1 ? Math.floor((step - 1) / 2) : -1);
  const fixedAt = (step: number) => (step === 0 ? 0 : step === steps - 1 ? leaks.length : Math.floor(step / 2));

  let current = -1;
  const show = (step: number, first = false) => {
    if (step === current) return;
    current = step;
    const here = leakOf(step);
    const fixed = fixedAt(step);
    const layer = step === 0 ? 0 : here >= 0 ? here + 1 : layers.length - 1;
    layers.forEach((el, i) => fade(el, i === layer, first));
    leaks.forEach((_, j) => {
      fade(fixes[j], j < fixed, first || j !== here);
      // A leak's example drops its losses once it is on screen, so the drop is seen.
      const vig = vigs[j];
      vig.classList.toggle('is-fixed', j < fixed);
      if (j !== here && j >= fixed) vig.classList.remove('is-leak');
      else if (!vig.classList.contains('is-leak')) {
        if (first) vig.classList.add('is-leak');
        else gsap.delayedCall(0.3, () => (leakOf(current) === j || j < fixedAt(current)) && vig.classList.add('is-leak'));
      }
    });
    ticks.forEach((tick, i) => tick.classList.toggle('is-on', i < fixed));
    setText(sealed, String(fixed));
  };
  // One second of timeline per step; a beat at each step after the intro.
  const tl = gsap.timeline().to({}, { duration: steps });
  beats(tl, Array.from({ length: steps - 1 }, (_, i) => i + 1), (beat, first) => show(beat + 1, first));
  hold(pin, { length: 4.8, priority: 4, animation: tl });
}
