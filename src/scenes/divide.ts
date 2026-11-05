import { gsap } from 'gsap';
import { q, qa } from '../env';
import { anchors, at, beats, fade, hold, motion, revealOnFocus } from '../stage';

/** 19.2% used AI: 19 whole businesses and a fifth of the 20th. */
const CROSS = 20;
/** 40.0% said AI isn't relevant to their business. */
const OUT = 40;
/** 90% of office and admin tasks are ones AI could do or speed up, in theory. */
const COULD = 90;
/** 34% are covered by real use so far. */
const USED = 34;
/** Each crossing dot's share of the crossing; the rest staggers their starts. */
const SPAN = 0.3;

type Arc = { cx: number; cy: number; dx: number; dy: number };

/**
 * 01 The divide. The hero holds the screen and its drawing becomes the evidence. The
 * business side turns into 100 Canadian businesses, the 19.2% that used AI cross the
 * gap, then the 40.0% who said AI isn't relevant to them are marked. Then the dots count
 * office and admin work instead, which every business has: they come home and turn into
 * 100 tasks, the 90% AI could do or speed up cross over, and the 34% it already covers in
 * real use fill in. Each figure is set in type only once its drawing is complete, so a
 * reader never stops on a half-drawn claim.
 */
export function initDivide() {
  if (!motion) return;
  const section = q('#top');
  const pin = q('[data-pin]', section);
  const world = q('[data-world]', section);
  const hero = q('[data-layer="hero"]', section);
  const facts = q('[data-layer="facts"]', section);
  const [stats, relevant, reach] = qa('.s1__pane', facts);
  const [used, irrelevant] = qa('[data-fact]', stats);
  const [, covered] = qa('[data-fact]', reach);
  const [statsSource, reachSource] = qa('.source', facts);
  const [bizTag, taskTag, usedTag, couldTag] = qa('[data-tag]', world);

  const grid = q('[data-dots]', world);
  const dots = fill(grid, 100);
  const [slotsA, slotsB] = qa('[data-slots]', world);
  const slots = fill(slotsA, CROSS);
  const slots2 = fill(slotsB, COULD);
  // A fixed scattered order, so the businesses that cross read as businesses, not a block.
  const order = scatter(100, 7).map((i) => dots[i]);
  const crossing = order.slice(0, CROSS);
  const out = order.slice(CROSS, CROSS + OUT);
  // The tasks AI could take on come from all over the grid. They fill the other bank from
  // the bottom row up, so the share already covered reads as a level.
  const tasks = scatter(100, 11).slice(0, COULD).map((i) => dots[i]);
  const landing = tasks.map((_, j) => slots2[(8 - Math.floor(j / 10)) * 10 + (j % 10)]);
  const asBusiness = new Map(crossing.map((dot, k) => [dot, k]));
  const asOut = new Map(out.map((dot, k) => [dot, k]));
  const asTask = new Map(tasks.map((dot, j) => [dot, j]));

  // Each crossing dot flies an arc over the gap to its slot. Positions are layout offsets
  // inside the drawing, which transforms never change; they are measured on refresh.
  let arcs: Arc[] = [];
  let arcs2: Arc[] = [];
  const measure = () => {
    const lift = world.offsetWidth * 0.14;
    const arc = (from: HTMLElement, to: HTMLElement): Arc => {
      const a = center(from, world);
      const b = center(to, world);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      return { cx: dx / 2, cy: Math.min(0, dy) - lift, dx, dy };
    };
    arcs = crossing.map((dot, k) => arc(dot, slots[k]));
    arcs2 = tasks.map((dot, j) => arc(dot, landing[j]));
  };

  const ease = gsap.parseEase('power2.inOut');
  /** How far a dot is along its arc, 0 at home and 1 landed, given its place in the line. */
  const along = (progress: number, k: number, n: number) =>
    ease(gsap.utils.clamp(0, 1, (progress - (k / (n - 1)) * (1 - SPAN)) / SPAN));
  const p = { cross: 0, hollow: 0, home: 0, could: 0, used: 0 };
  const render = () => {
    const counted = p.home >= 0.5;
    grid.classList.toggle('is-tasks', counted);
    dots.forEach((dot) => {
      const k = asBusiness.get(dot);
      const j = asTask.get(dot);
      const o = asOut.get(dot);
      let arc: Arc | undefined;
      let e = 0;
      // Phase 2 starts only once every business is home, so a dot is on one arc at a time.
      if (p.could > 0 && j !== undefined) {
        arc = arcs2[j];
        e = along(p.could, j, COULD);
      } else if (k !== undefined) {
        arc = arcs[k];
        e = along(p.cross, k, CROSS) * (1 - along(p.home, k, CROSS));
      }
      if (!arc || e === 0) dot.style.transform = '';
      else {
        const u = 1 - e;
        const x = 2 * u * e * arc.cx + e * e * arc.dx;
        const y = 2 * u * e * arc.cy + e * e * arc.dy;
        dot.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      }
      const business = k !== undefined && !counted && e > 0.5;
      dot.classList.toggle('is-ai', business && k !== CROSS - 1);
      dot.classList.toggle('is-part', business && k === CROSS - 1);
      dot.classList.toggle('is-out', o !== undefined && !counted && p.hollow * OUT > o + 0.5);
      const task = j !== undefined && p.could > 0 && e > 0.5;
      dot.classList.toggle('is-could', task);
      dot.classList.toggle('is-used', task && j < USED && p.used * USED > j + 0.5);
    });
  };

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.to(hero, { y: () => -0.12 * window.innerHeight, opacity: 0, duration: 1 }, 0)
    .to(q('[data-split-half]', hero), { '--split': 0.12, duration: 0.8 }, 0)
    .to(qa('[data-now]', world), { opacity: 0, duration: 0.5 }, 0.6)
    .to(qa('[data-count]', world), { opacity: 1, duration: 0.5 }, 0.9)
    .addLabel('facts', 1.4)
    .to(p, { cross: 1, duration: 3.4, onUpdate: render }, 1.6)
    .addLabel('crossed')
    .to(p, { hollow: 1, duration: 1.4, onUpdate: render }, '+=0.5')
    .addLabel('hollowed')
    .addLabel('relevant', '+=1.2')
    .to(p, { home: 1, duration: 1.2, onUpdate: render }, 'relevant')
    .to(p, { could: 1, duration: 2.8, onUpdate: render }, '+=0.3')
    .addLabel('could')
    .to(p, { used: 1, duration: 1.2, onUpdate: render }, '+=0.4')
    .addLabel('covered')
    .to({}, { duration: 1.4 });

  const { labels } = tl;
  beats(tl, [0.5, labels.facts, labels.crossed, labels.hollowed, labels.relevant, labels.could, labels.covered], (beat, first) => {
    hero.classList.toggle('is-live', beat < 0);
    fade(facts, beat >= 1, first);
    fade(stats, beat >= 1 && beat < 4, first);
    fade(used, beat >= 2, first);
    fade([irrelevant, statsSource], beat >= 3, first);
    fade(relevant, beat === 4, first);
    fade(reach, beat >= 5, first);
    fade([covered, reachSource], beat >= 6, first);
    fade([bizTag, usedTag], beat < 4, first);
    fade([taskTag, couldTag], beat >= 4, first);
  });

  // The arcs are first measured when the holds are, so setting up costs no extra layout.
  const st = hold(pin, {
    length: 5.4,
    priority: 10,
    animation: tl,
    // The hero rises by a share of the screen height, so it is recorded again after a resize.
    invalidateOnRefresh: true,
    onRefresh: () => {
      measure();
      render();
    },
  });

  // "See how it works" lands where the numbers begin; tabbing to a hidden link shows it.
  const share = (label: string) => (tl.labels[label] + 0.05) / tl.duration();
  anchors.set('divide', () => at(st, share('facts')));
  // With ?for=web the website chapter comes first; its button lands on the hero.
  anchors.set('hero', () => at(st, 0));
  revealOnFocus(hero, () => 0);
  revealOnFocus(stats, () => at(st, share('hollowed')));
  revealOnFocus(reach, () => at(st, share('covered')));
}

function fill(box: HTMLElement, n: number) {
  const items = Array.from({ length: n }, () => document.createElement('i'));
  box.append(...items);
  return items;
}

/** The centre of el in root's coordinates, from layout offsets. */
function center(el: HTMLElement, root: HTMLElement) {
  let x = el.offsetWidth / 2;
  let y = el.offsetHeight / 2;
  for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) {
    x += n.offsetLeft;
    y += n.offsetTop;
  }
  return { x, y };
}

/** A fixed shuffle of 0..n-1 (Park-Miller), so the pattern is the same on every visit. */
function scatter(n: number, seed: number) {
  const out = Array.from({ length: n }, (_, i) => i);
  let s = seed;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
