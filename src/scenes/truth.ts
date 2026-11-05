import { gsap } from 'gsap';
import { q, qa, WIDE } from '../env';
import { beats, fade, fromEach, hold, motion } from '../stage';

/** When each line of the copy comes in, with its part of the drawing (timeline seconds). */
const PEOPLE = 0.6;
const AI = 1.8;
const GUESS = 3;
const SORT = 4.2;

/**
 * 02 What AI really is. One short line at a time, each with its part of the drawing: the
 * work in a business, people across almost all of it, AI as a tall narrow spike, and the
 * guesses outside it. Then what to give it and what to keep: one jumbled pile of claims,
 * the way AI reaches most owners, sorted card by card into the two. On phones the AI list
 * is dealt in, then the person's list takes its place. Then the whole stage gives way to
 * what that adds up to: one person in front of a formation of AI.
 */
export function initTruth() {
  if (!motion) return;
  const pin = q('#ai [data-pin]');
  const stage = [q('.s3__copy', pin), q('.s3__stage', pin)];
  const lines = qa('[data-beat]', pin);
  const reach = q('[data-reach]', pin);
  const sort = q('[data-sort]', pin);
  const army = q('[data-layer="army"]', pin);
  const [strongCol, weakCol] = qa('.sort__col', sort);
  const strong = qa('.card', strongCol);
  const weak = qa('.card', weakCol);
  const heads = qa('.sort__head, .sort__sub', sort);
  const [peopleLabel, aiLabel, guessLabel] = qa('.reach__label', reach);

  // Alternate the sides: AI 1, person 1, AI 2, person 2, ...
  const order: HTMLElement[] = [];
  for (let i = 0; i < Math.max(strong.length, weak.length); i++) {
    if (strong[i]) order.push(strong[i]);
    if (weak[i]) order.push(weak[i]);
  }
  const tilt = order.map((_, i) => ((i * 37) % 15) - 7);
  const reset = (els: HTMLElement[]) => {
    gsap.killTweensOf(els);
    gsap.set(els, { clearProps: 'opacity,transform' });
  };

  // The drawing is the same on every screen, one part per line of copy.
  const drawReach = (tl: gsap.core.Timeline) => {
    tl.from(q('.reach__base', reach), { drawSVG: 0, duration: 0.5, ease: 'none' }, 0)
      .from(q('.reach__axis', reach), { opacity: 0, duration: 0.3 }, 0.2)
      .from(q('.reach__people', reach), { drawSVG: 0, duration: 0.7, ease: 'none' }, PEOPLE)
      .from(q('.reach__people', reach), { fillOpacity: 0, duration: 0.3 }, PEOPLE + 0.6)
      .from(peopleLabel, { opacity: 0, y: 8, duration: 0.3 }, PEOPLE + 0.6)
      .from(q('.reach__ai', reach), { drawSVG: 0, duration: 0.6, ease: 'none' }, AI)
      .from(q('.reach__ai', reach), { fillOpacity: 0, duration: 0.3 }, AI + 0.5)
      .from(aiLabel, { opacity: 0, y: 8, duration: 0.3 }, AI + 0.5);
    fromEach(tl, qa('.reach__guesses text', reach), { opacity: 0, y: 8, duration: 0.3 }, GUESS, 0.07);
    return tl.from(guessLabel, { opacity: 0, y: 8, duration: 0.3 }, GUESS + 0.5);
  };

  // The army: the person in front first, then the ranks behind, nearest first.
  const assemble = (tl: gsap.core.Timeline, at: number) => {
    tl.from(q('.army__lead', army), { scale: 0.6, opacity: 0, duration: 0.4, ease: 'back.out(2)' }, at);
    const ranks = qa('.army__rank', army).reverse().flatMap((rank) => qa('i', rank));
    fromEach(tl, ranks, { scale: 0.4, opacity: 0, duration: 0.35, ease: 'back.out(2)' }, at + 0.3, 0.05);
    return tl.to({}, { duration: 1.4 });
  };

  const mm = gsap.matchMedia();
  mm.add(WIDE, () => {
    // Offsets are measured against .sort (the cards' offsetParent), which transforms do
    // not affect, so the pile is right after a resize. It sits in the middle of the board,
    // each card a little off the one under it so it reads as a heap.
    const pileX = (el: HTMLElement, i: number) => sort.offsetWidth / 2 + ((i * 53) % 48) - 24 - (el.offsetLeft + el.offsetWidth / 2);
    const pileY = (el: HTMLElement, i: number) => sort.offsetHeight / 2 + ((i * 29) % 40) - 20 - (el.offsetTop + el.offsetHeight / 2);
    const tl = drawReach(gsap.timeline());
    fromEach(tl, heads, { opacity: 0, y: 14, duration: 0.4 }, SORT + 0.2, 0.1);
    order.forEach((card, i) => {
      tl.from(card, { x: () => pileX(card, i), y: () => pileY(card, i), rotation: tilt[i], duration: 1, ease: 'power2.inOut' }, SORT + 0.4 + i * 0.35);
    });
    const close = tl.duration() + 1;
    assemble(tl, close + 0.3);
    beats(tl, [PEOPLE, AI, GUESS, SORT, close], (beat, first) => {
      lines.forEach((el, i) => fade(el, i === Math.min(beat + 1, 4), first));
      fade(reach, beat < 3, first);
      fade(sort, beat === 3, first);
      fade(stage, beat < 4, first);
      fade(army, beat >= 4, first);
    });
    // The pile is measured from the layout, so it is recorded again after a resize.
    const held = hold(pin, { length: 4.6, priority: 8, animation: tl, invalidateOnRefresh: true });
    // A hold created after this ran is not this context's to revert, so it is killed here,
    // and so are fades still running, which would otherwise finish on the other layout.
    return () => {
      held.kill();
      reset([...lines, ...stage, reach, sort, army]);
    };
  });

  mm.add(`not all and ${WIDE}`, () => {
    const tl = drawReach(gsap.timeline());
    tl.from(strong, { x: -28, opacity: 0, duration: 0.6, stagger: 0.3, ease: 'power2.out' }, SORT + 0.3);
    const swap = tl.duration() + 0.4;
    tl.from(weak, { x: 28, opacity: 0, duration: 0.6, stagger: 0.3, ease: 'power2.out' }, swap + 0.5);
    const close = tl.duration() + 1;
    assemble(tl, close + 0.3);
    beats(tl, [PEOPLE, AI, GUESS, SORT, swap, close], (beat, first) => {
      lines.forEach((el, i) => fade(el, i === Math.min(beat + 1, 4), first));
      fade(reach, beat < 3, first);
      fade(sort, beat === 3 || beat === 4, first);
      fade(strongCol, beat < 4, first);
      fade(weakCol, beat >= 4, first);
      fade(stage, beat < 5, first);
      fade(army, beat >= 5, first);
    });
    const held = hold(pin, { length: 4.8, priority: 8, animation: tl });
    return () => {
      held.kill();
      reset([...lines, ...stage, reach, sort, strongCol, weakCol, army]);
    };
  });
}
