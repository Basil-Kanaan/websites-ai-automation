import { gsap } from 'gsap';
import { q, qa } from '../env';
import { beats, fade, hold, motion, setText } from '../stage';

/** When each line of the copy comes in, with its part of the run (timeline seconds). */
const RUN = 0.8;
const INFER = 2.4;
const CHAIN = 3.6;
const SENT = 5;
const TEST = 6.2;
const GOLD = 7.8;
const CLOSE = 9.2;

/**
 * 03 Who's building it, opening: why AI needs testing. The chapter holds on an AI agent's
 * run at an ordinary business task, one line of copy per moment. Its steps come in one by
 * one: 2 fine, then a guess, then 2 more built on it. Then what the customer would get.
 * Then a test pass marks the 3 bad steps, and the golden run redoes them, with the owner
 * approving the message before it goes out. Without motion the first run is shown with
 * its reasons and its message.
 */
export function initExperience() {
  if (!motion) return;
  const pin = q('#experience [data-pin]');
  const lines = qa('.xp__swap [data-beat]', pin);
  const trace = q('[data-trace]', pin);
  const status = q('[data-trace-status]', trace);
  const sum = q('[data-trace-sum]', trace);
  const out = q('[data-out]', trace);
  const scan = q('[data-scan]', trace);
  const rows = qa('.trace__steps li', trace);

  const tl = gsap.timeline();
  const enter = (row: HTMLElement, at: number) => tl.from(row, { opacity: 0, x: -12, duration: 0.4, ease: 'power2.out' }, at);
  // The title stands alone first; the agent's window opens with the next line.
  tl.from(trace, { opacity: 0, y: 16, duration: 0.4 }, RUN - 0.4)
    .from(q('.trace__task', trace), { opacity: 0, y: 10, duration: 0.4 }, RUN);
  enter(rows[0], RUN + 0.3);
  enter(rows[1], RUN + 0.7);
  enter(rows[2], INFER + 0.1);
  enter(rows[3], CHAIN + 0.1);
  enter(rows[4], CHAIN + 0.5);
  // One pass down the run, the way a test goes through it. Positions are shares of the
  // run's height, so they hold at any size.
  tl.set(scan, { opacity: 1 }, TEST + 0.1)
    .fromTo(scan, { top: '0%' }, { top: '100%', duration: 1.1, ease: 'none', immediateRender: false }, TEST + 0.1)
    .set(scan, { opacity: 0 }, TEST + 1.25)
    .to({}, { duration: 1.6 }, CLOSE);

  beats(tl, [RUN, INFER, CHAIN, SENT, TEST, GOLD, CLOSE], (beat, first) => {
    lines.forEach((el, i) => fade(el, i === beat + 1, first));
    rows.forEach((row, i) => row.classList.toggle('is-why', beat < 5 && ((i === 2 && beat >= 1) || (i > 2 && beat >= 2))));
    fade(out, beat >= 3, first);
    trace.classList.toggle('is-test', beat === 4);
    trace.classList.toggle('is-gold', beat >= 5);
    setText(status, beat >= 5 ? 'Golden run' : beat === 4 ? 'Testing' : 'First run');
    setText(sum, beat >= 5 ? '5 of 5 steps right' : '3 of 5 steps wrong');
  });
  hold(pin, { length: 4.2, priority: 7, animation: tl });
}
