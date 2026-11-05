import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * What the held chapters share. The page head sets html.motion when motion is welcome;
 * without it (no JavaScript, or reduced motion) every chapter is laid out as a plain page
 * and the scenes only put their drawings in their finished state.
 */
export const motion = document.documentElement.classList.contains('motion');

/** Where in-page links land when their target sits inside a held chapter. */
export const anchors = new Map<string, () => number>();

type HoldVars = ScrollTrigger.StaticVars & {
  /** The chapter's timeline, which scrolling plays. */
  animation: gsap.core.Timeline;
  /** How long the chapter holds the screen, in screen heights of scrolling. */
  length: number;
  /**
   * Refresh order. Holding adds scroll space below a chapter, so chapters higher on the
   * page must be measured first: they get the larger number.
   */
  priority: number;
};

/**
 * A held chapter. Its ScrollTriggers exist once the holds are created (see createHolds):
 * `st` pins the chapter and `play` plays its timeline over the same stretch of scrolling.
 */
export type Hold = { st?: ScrollTrigger; play?: ScrollTrigger; kill: () => void };

let created = false;
const queued: (() => void)[] = [];

/**
 * Holds a chapter on screen while scrolling plays it. Scrolling itself stays native. A link
 * to the chapter lands where the hold begins, with the whole stage on screen.
 *
 * Every hold makes ScrollTrigger measure the whole page again, so while the scenes are
 * being set up, holds wait in a queue and are created together, then measured once. A
 * timeline that sizes itself from the layout passes invalidateOnRefresh, so it is recorded
 * again after a resize; its staggered from() tweens are built with fromEach().
 *
 * The pin and the timeline get a ScrollTrigger each. A pin that carries a timeline plays
 * all of it to the end and back at every measure, to see whether it moves the pin; these
 * never do, and that pass cost more than the rest of setting up. The pin gets an empty
 * timeline instead, because a ScrollTrigger with no timeline measures the page as soon as
 * it is made.
 */
export function hold(pin: HTMLElement, { length, priority, ...vars }: HoldVars): Hold {
  // The timeline waits for the scroll position to drive it.
  vars.animation.pause();
  let killed = false;
  const held: Hold = {
    kill: () => {
      killed = true;
      held.st?.kill();
      held.play?.kill();
      held.st = held.play = undefined;
    },
  };
  const create = () => {
    if (killed) return;
    held.st = ScrollTrigger.create({
      trigger: pin,
      pin: true,
      start: 'top top',
      end: `+=${Math.round(length * 100)}%`,
      anticipatePin: 1,
      refreshPriority: priority,
      animation: gsap.timeline({ paused: true }),
    });
    // The player takes the pin's start and end rather than measuring the pinned element,
    // which sits at the end of its stretch while its pin is active. Sharing the trigger
    // keeps it measured just after its pin.
    held.play = ScrollTrigger.create({
      trigger: pin,
      start: () => held.st?.start ?? 0,
      end: () => held.st?.end ?? 0,
      refreshPriority: priority,
      scrub: 0.6,
      ...vars,
    });
  };
  if (created) create();
  else queued.push(create);
  const id = pin.closest('section')?.id;
  if (id) anchors.set(id, () => held.st?.start ?? 0);
  return held;
}

/** Creates the queued holds, then measures the page once, top chapter first. */
export function createHolds() {
  created = true;
  queued.splice(0).forEach((create) => create());
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}

/**
 * A staggered from(), built as one tween per target. When a refresh invalidates a timeline
 * (invalidateOnRefresh), ScrollTrigger puts its plain from() tweens back at their start but
 * not staggered ones, which would show finished until the playhead reached them.
 */
export function fromEach(tl: gsap.core.Timeline, targets: Element[], vars: gsap.TweenVars, at: number, gap: number) {
  targets.forEach((el, i) => tl.from(el, { ...vars }, at + i * gap));
  return tl;
}

/** The scroll position at which a held chapter has played to `progress`. */
export const at = ({ st }: Hold, progress: number) => (st ? Math.ceil(st.start + (st.end - st.start) * progress) : 0);

/**
 * Calls show(beat) each time the playhead moves into a different beat. Beats are timeline
 * times, and before the first one the beat is -1. Text changes only on beats, in its own
 * time, so a reader who stops scrolling never sees a statement half faded or a figure
 * half drawn. `first` is true for the call that sets the starting state.
 */
export function beats(tl: gsap.core.Timeline, times: number[], show: (beat: number, first: boolean) => void) {
  let current: number | undefined;
  const update = () => {
    const t = tl.time() + 1e-6;
    let beat = -1;
    while (beat + 1 < times.length && t >= times[beat + 1]) beat++;
    if (beat === current) return;
    const first = current === undefined;
    current = beat;
    show(beat, first);
  };
  tl.eventCallback('onUpdate', update);
  update();
}

/**
 * Fades text in or out. Hidden text stays in the page for screen readers (opacity, not
 * visibility); a hidden layer also takes no clicks.
 */
export function fade(targets: gsap.TweenTarget, on: boolean, instant = false) {
  const els = gsap.utils.toArray<HTMLElement>(targets);
  els.forEach((el) => el.hasAttribute('data-layer') && el.classList.toggle('is-live', on));
  gsap.to(els, {
    opacity: on ? 1 : 0,
    y: on ? 0 : 12,
    duration: instant ? 0 : on ? 0.6 : 0.3,
    ease: on ? 'power3.out' : 'power1.in',
    overwrite: true,
  });
}

/**
 * When keyboard focus lands on a link in a layer that is not showing, scroll to where it
 * shows. Focus given to the layer itself comes from an in-page link that is already
 * scrolling there, so it is left alone.
 */
export function revealOnFocus(layer: HTMLElement, where: () => number) {
  layer.addEventListener('focusin', (e) => {
    if (e.target !== layer && !layer.classList.contains('is-live')) window.scrollTo({ top: where(), behavior: 'auto' });
  });
}

/** Scrolls to an in-page target, landing inside a held chapter where its anchor says. */
export function goTo(id: string, behavior: ScrollBehavior) {
  const where = id === 'top' ? () => 0 : anchors.get(id);
  if (where) window.scrollTo({ top: where(), behavior });
  else document.getElementById(id)?.scrollIntoView({ block: 'start', behavior });
}

/** Sets text only when it changes, so a render on every frame costs nothing when idle. */
export function setText(el: Element, text: string) {
  if (el.textContent !== text) el.textContent = text;
}
