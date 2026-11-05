import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { qa } from '../env';
import { motion } from '../stage';

/**
 * The 2 chapters that scroll natively (the service list and the contact block) reveal as
 * you reach them: titles rise line by line out of masks, and the lines under them follow. Each
 * title is split only when it comes within half a screen of the viewport.
 */
export function initReveals() {
  if (!motion) return;
  qa('#build .title, #contact .title').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom+=50%',
      once: true,
      onEnter: () => splitTitle(el),
    });
  });

  const fades = qa('#build .kicker, #build .lede, #contact .lede');
  gsap.set(fades, { y: 18, autoAlpha: 0 });
  ScrollTrigger.batch(fades, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.95, ease: 'power3.out', stagger: 0.08 }),
  });
}

function splitTitle(el: HTMLElement) {
  let played = false;
  SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    aria: 'auto',
    autoSplit: true,
    onSplit(self) {
      if (played) return;
      return gsap.from(self.lines, {
        yPercent: 115,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onComplete: () => {
          played = true;
        },
      });
    },
  });
}
