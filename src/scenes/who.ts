import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { q, qa } from '../env';
import { beats, fade, hold, motion } from '../stage';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * 03 Who's building it, background. The chapter holds while the network is wired one
 * layer per line of background: each credential that appears adds a layer, and the lines
 * after the last layer follow once it is complete. Then the caption explains it and
 * signals run through it from input to output, lighting each node they reach.
 */
export function initWho() {
  if (!motion) return;
  const section = q('#me');
  const pin = q('[data-pin]', section);
  const svg = q<SVGSVGElement>('[data-net] svg', pin);
  const rows = qa('.spec__row', pin);
  const labels = qa('.net__label', pin);
  const caption = q('.net__caption', pin);
  const layers = JSON.parse(svg.dataset.layers!) as number[][];
  const xs = JSON.parse(svg.dataset.xs!) as number[];
  const edges = qa<SVGLineElement>('.net__edge', svg);
  const nodes = qa<SVGCircleElement>('.net__node', svg);
  const inLayer = <T extends SVGElement>(els: T[], l: number) => els.filter((el) => el.dataset.l === String(l));

  const tl = gsap.timeline();
  const rowAt: number[] = [];
  layers.forEach((_, l) => {
    const t = l * 1.1;
    if (l > 0) tl.from(inLayer(edges, l - 1), { drawSVG: 0, duration: 0.6, stagger: 0.008, ease: 'none' }, t);
    tl.from(inLayer(nodes, l), { scale: 0, transformOrigin: '50% 50%', duration: 0.4, stagger: 0.05, ease: 'back.out(2)' }, t + (l > 0 ? 0.45 : 0));
    rowAt.push(t + 0.1);
  });
  tl.from(labels[0], { opacity: 0, duration: 0.3 }, 0.2)
    .from(labels[1], { opacity: 0, duration: 0.3 }, 1.6)
    .from(labels[2], { opacity: 0, duration: 0.3 }, 3.8);
  const wired = tl.duration();
  tl.to({}, { duration: 1.6 });
  // Lines of background past the network's layers come in once it is wired.
  for (let i = layers.length; i < rows.length; i++) rowAt.push(wired + 0.1 + (i - layers.length) * 0.35);
  const done = rowAt[rowAt.length - 1] + 0.4;

  const signals = runSignals(svg, layers, xs, nodes);
  let complete = false;
  let inView = false;
  const play = () => signals(complete && inView);
  beats(tl, [...rowAt, done], (beat, first) => {
    rows.forEach((row, i) => fade(row, i <= beat, first));
    complete = beat >= rows.length;
    fade(caption, complete, first);
    play();
  });

  hold(pin, { length: 2.8, priority: 6, animation: tl });
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      inView = self.isActive;
      play();
    },
  });
}

/** Signals from input to output, on a loop while switched on. */
function runSignals(svg: SVGSVGElement, layers: number[][], xs: number[], nodes: SVGCircleElement[]) {
  const host = q('[data-signals]', svg);
  const flash = (l: number, i: number) => {
    const node = nodes.find((n) => n.dataset.l === String(l) && n.dataset.i === String(i));
    if (!node) return;
    node.classList.add('is-hot');
    gsap.delayedCall(0.28, () => node.classList.remove('is-hot'));
  };
  const runs = Array.from({ length: 4 }, (_, k) => {
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('r', '4.5');
    dot.setAttribute('opacity', '0');
    host.append(dot);
    let path: number[] = [];
    const tl = gsap.timeline({ repeat: -1, repeatRefresh: true, delay: k * 0.6, paused: true });
    tl.call(() => {
      path = layers.map((ys) => Math.floor(Math.random() * ys.length));
      gsap.set(dot, { attr: { cx: xs[0], cy: layers[0][path[0]] }, opacity: 1 });
      flash(0, path[0]);
    });
    for (let l = 1; l < layers.length; l++) {
      tl.to(dot, {
        attr: { cx: xs[l], cy: () => layers[l][path[l]] },
        duration: 0.55,
        ease: 'power1.inOut',
        onComplete: () => flash(l, path[l]),
      });
    }
    tl.to(dot, { opacity: 0, duration: 0.25 }).to({}, { duration: 0.3 + k * 0.1 });
    return { dot, tl };
  });
  let on = false;
  return (next: boolean) => {
    if (next === on) return;
    on = next;
    runs.forEach(({ dot, tl }) => {
      if (on) tl.play();
      else {
        tl.pause();
        gsap.set(dot, { opacity: 0 });
      }
    });
  };
}
