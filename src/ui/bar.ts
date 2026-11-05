import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { q, qa, reduceMotion } from '../env';
import { goTo, motion } from '../stage';

/**
 * The header: it names the chapter you are in, and its bottom edge is a bridge
 * deck laid plank by plank as you read. Its triggers are measured last, after every held
 * chapter has added its scroll space. In-page links land inside held chapters where their
 * anchors say.
 */
export function initBar() {
  const bar = q('[data-bar]');
  const label = q('[data-chapter-label]');
  const fill = q('[data-progress]');
  const last = { refreshPriority: -1 };

  ScrollTrigger.create({
    ...last,
    start: 8,
    end: 'max',
    onToggle: (self) => bar.classList.toggle('is-solid', self.isActive),
  });
  ScrollTrigger.create({
    ...last,
    start: 0,
    end: 'max',
    onUpdate: (self) => fill.style.setProperty('--p', self.progress.toFixed(4)),
  });

  // The chapter whose section straddles the middle of the screen.
  let current = '';
  const setChapter = (value: string) => {
    if (value === current) return;
    current = value;
    const [num, name] = value.split('|');
    const b = document.createElement('b');
    b.textContent = num;
    const span = document.createElement('span');
    span.textContent = name;
    label.replaceChildren(b, span);
  };
  const sections = qa('[data-chapter]');
  setChapter(sections[0].dataset.chapter!);
  sections.forEach((section) => {
    ScrollTrigger.create({
      ...last,
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => self.isActive && setChapter(section.dataset.chapter!),
    });
  });
  // Past the hero, the chapter label shows (and on phones replaces the name). With motion
  // the hero holds the screen, so that is a distance scrolled rather than a position.
  ScrollTrigger.create({
    ...last,
    ...(motion ? { trigger: '#top', start: 'top -35%' } : { trigger: '.s1__facts', start: 'top 70%' }),
    onEnter: () => bar.classList.add('is-reading'),
    onLeaveBack: () => bar.classList.remove('is-reading'),
  });

  qa<HTMLAnchorElement>('a[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!id || !target) return;
      e.preventDefault();
      goTo(id, reduceMotion ? 'auto' : 'smooth');
      (id === 'top' ? q('#main') : target).focus({ preventScroll: true });
      history.replaceState(null, '', id === 'top' ? location.pathname + location.search : `#${id}`);
    });
  });
}
