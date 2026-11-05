import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { q, qa } from '../env';
import { beats, fade, hold, motion } from '../stage';

/**
 * The statement after the numbers holds the screen and is read in word by word at your
 * scrolling pace. Then a drawing shows why: 6 kinds of business wired to the work they all
 * have, and what that work comes back as once AI and automation take a share of it. Then
 * "If that's you" takes its place, with one owner growing an arm for every job. The words
 * are plain spans, so screen readers read the sentence as it is; the dim start keeps 3:1
 * contrast for text this size.
 */
export function initRead() {
  if (!motion) return;
  const pin = q('#read [data-pin]');
  const first = q('.s2__a', pin);
  const readline = q('[data-readline]', pin);
  const jobs = q('[data-jobs]', pin);
  const [wires, gainWires] = qa('.jobs__wires', jobs);
  const you = q('[data-you]', pin);
  const busy = q('[data-busy]', you);

  // Split once: words wrap on their own when the font or width changes.
  const { words } = SplitText.create(readline, { type: 'words', tag: 'span', aria: 'none' });
  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.fromTo(words, { opacity: 0.4 }, { opacity: 1, duration: 0.6, stagger: 0.1 }, 0.2);
  const read = tl.duration();
  tl.from(q('.jobs__title', jobs), { opacity: 0, y: 10, duration: 0.3 }, read + 0.1)
    .from(qa('.jobs__biz li', jobs), { opacity: 0, y: 14, duration: 0.4, stagger: 0.08 }, read + 0.2)
    .from(qa('line', wires), { opacity: 0, duration: 0.25, stagger: 0.02 }, read + 0.8)
    .from(qa('.jobs__list li', jobs), { opacity: 0, y: 14, duration: 0.4, stagger: 0.1 }, read + 1.4)
    .from(qa('line', gainWires), { opacity: 0, duration: 0.25, stagger: 0.06 }, read + 2)
    .from(q('.jobs__hub', jobs), { opacity: 0, duration: 0.3 }, read + 2.2)
    .from(qa('.jobs__gain li', jobs), { opacity: 0, y: 14, duration: 0.4, stagger: 0.15 }, read + 2.5);
  const swap = tl.duration() + 1.4;

  // The owner, then a pair of arms for each kind of work, then everything asking at once.
  tl.from(qa('.busy__body, .busy__head', busy), { opacity: 0, duration: 0.3 }, swap + 0.3);
  [0, 1, 2].forEach((pair) => {
    const at = swap + 0.6 + pair * 0.5;
    tl.from(qa(`.busy__arm[data-pair="${pair}"]`, busy), { drawSVG: 0, duration: 0.35, ease: 'power1.out' }, at)
      .from(qa(`.busy__item[data-pair="${pair}"]`, busy), { scale: 0, transformOrigin: '50% 50%', duration: 0.35, ease: 'back.out(2)' }, at + 0.25);
  });
  tl.from(qa('.busy__badge', busy), { scale: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.12, ease: 'back.out(2.5)' }, swap + 2.2)
    .from(q('.busy__stress', busy), { opacity: 0, duration: 0.3 }, swap + 2.4)
    .to({}, { duration: 1.4 });

  beats(tl, [swap], (beat, isFirst) => {
    fade(first, beat < 0, isFirst);
    fade(you, beat >= 0, isFirst);
  });
  hold(pin, { length: 3.6, priority: 9, animation: tl });
}
