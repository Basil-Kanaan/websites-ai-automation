import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { q, qa, reduceMotion, track } from '../env';

/**
 * The service list, with a filter by kind of business: the services that fit stay
 * lit and the rest dim, so an owner sees their own shortlist without reading all 18.
 */
export function initMenu() {
  const menu = q('#build');
  const chips = qa<HTMLButtonElement>('[data-fit-key]', menu);
  const services = qa('.svc', menu);
  const count = q('[data-fit-count]', menu);

  const choose = (chip: HTMLButtonElement) => {
    const key = chip.dataset.fitKey!;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const all = key === 'all';
    menu.classList.toggle('is-filtered', !all);
    let fits = 0;
    services.forEach((svc) => {
      const fit = all || svc.dataset.for!.split(' ').includes(key);
      svc.classList.toggle('is-fit', fit);
      if (fit) fits++;
    });
    if (all) count.textContent = '';
    else {
      const strong = document.createElement('strong');
      strong.textContent = String(fits);
      count.replaceChildren(strong, ` of ${services.length} fit ${chip.textContent!.toLowerCase()}.`);
    }
  };
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      choose(chip);
      track('industry_select', { industry: chip.dataset.fitKey });
    }),
  );

  // The reveal moves what is inside each service: the service itself has a CSS opacity
  // transition for the filter, and GSAP and a CSS transition on one property fight.
  // Everything is hidden in one pass, then each group plays as it scrolls in.
  if (reduceMotion) return;
  const parts = (group: Element) => qa('.group__title, .svc > *', group);
  const groups = qa('.group', menu);
  gsap.set(groups.flatMap(parts), { y: 16, autoAlpha: 0 });
  ScrollTrigger.batch(groups, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      batch.forEach((group, i) =>
        gsap.to(parts(group), { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: i * 0.12 }),
      ),
  });
}
