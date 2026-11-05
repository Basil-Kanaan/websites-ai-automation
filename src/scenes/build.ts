import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { q, qa } from '../env';
import { beats, fade, hold, motion } from '../stage';

/** Wide enough for the 4 steps side by side. */
const ROW = '(min-width: 900px)';

/**
 * 06 How we start. The chapter holds on the hero's drawing while the 4 steps build the
 * bridge: the call measures the gap, the leak map drafts the plan, the build lays it in
 * brass, and once it runs, "The divide" becomes "Bridged" and traffic crosses. Side by
 * side the steps accumulate; on phones each takes the place of the one before. Without
 * motion the drawing is shown built.
 */
export function initBuild() {
  if (!motion) return;
  const section = q('#start');
  const pin = q('[data-pin]', section);
  const steps = qa('[data-step]', pin);
  const world = q('[data-build-world]', pin);
  const dim = q('.scene__dim', world);
  const divide = q('[data-dim="divide"]', world);
  const bridged = q('[data-dim="bridged"]', world);
  const reveal = { clipPath: 'inset(-20% 100% -20% 0%)' };
  const shown = { clipPath: 'inset(-20% 0% -20% 0%)', duration: 0.9 };

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.fromTo(dim, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.out' }, 0.1)
    .fromTo(q('.world__plan', world), reveal, shown, 1.05)
    .fromTo(q('.world__built', world), reveal, shown, 2.05)
    .to(q('.world__plan', world), { opacity: 0, duration: 0.4 }, 2.6)
    .to({}, { duration: 1.5 }, 3);

  // Cars, 2 each way, once the bridge is open.
  const traffic = qa('[data-traffic] i', world).map((dot, i) => {
    const [from, to] = i % 2 ? ['100%', '0%'] : ['0%', '100%'];
    return gsap
      .timeline({ repeat: -1, delay: i * 0.55, paused: true })
      .fromTo(dot, { left: from }, { left: to, duration: 2.6, ease: 'none' }, 0)
      .fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0)
      .to(dot, { opacity: 0, duration: 0.3 }, 2.3);
  });
  let open = false;
  let inView = false;
  const drive = () =>
    traffic.forEach((car) => {
      if (open && inView) car.play();
      else car.pause(0);
    });

  const row = matchMedia(ROW);
  let current = -1;
  // Beats: step 1 (with the gap being measured), the gap labelled, steps 2 to 4.
  const show = (beat: number, first: boolean) => {
    current = beat;
    const step = beat < 0 ? -1 : Math.max(0, beat - 1);
    steps.forEach((el, i) => fade(el, row.matches ? i <= step : i === step, first));
    open = step >= 3;
    world.classList.toggle('is-bridged', open);
    fade(divide, beat >= 1 && !open, first);
    fade(bridged, open, first);
    drive();
  };
  beats(tl, [0, 0.8, 1, 2, 3], show);
  row.addEventListener('change', () => show(current, true));

  hold(pin, { length: 2.6, priority: 3, animation: tl });
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      inView = self.isActive;
      drive();
    },
  });
}
