import { gsap } from 'gsap';
import { q, qa } from '../env';
import { hold, motion, setText } from '../stage';

/**
 * 03 One person, the output of a team. The chapter holds while the 3 systems slide past
 * sideways, and each one runs while it is in front of you: scrolling is the clock, so
 * stopping pauses it and scrolling back runs it backwards. Without motion each shows one
 * representative moment instead.
 */
export function initSystems() {
  const renders = [pipeline(q('[data-ui="pipeline"]')), dialer(q('[data-ui="dialer"]')), mockup(q('[data-ui="mockup"]'))];
  if (!motion) {
    [0.7, 0.24, 1].forEach((p, i) => renders[i](p, true));
    return;
  }
  const pin = q('#systems [data-pin]');
  const viewport = q('.s5__viewport', pin);
  const track = q('[data-track]', pin);

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  renders.forEach((render, i) => {
    const proxy = { p: 0 };
    render(0, true);
    tl.to(proxy, { p: 1, duration: 2.2, onUpdate: () => render(proxy.p) }, '+=0.25');
    tl.to(track, { x: () => -viewport.clientWidth * (i + 1), duration: 0.9, ease: 'power2.inOut' }, '+=0.35');
  });
  tl.to({}, { duration: 0.8 });
  // The slides move by the viewport's width, so the timeline is recorded again after a resize.
  hold(pin, { length: 4.2, priority: 5, animation: tl, invalidateOnRefresh: true });
}

type Render = (p: number, instant?: boolean) => void;

/** Cold email engine: each business is found, researched, written to and sent, in turn. */
function pipeline(el: HTMLElement): Render {
  const cells = qa('.pipeline__rows li', el).map((row) => qa('i', row));
  const count = q('[data-pipe-count]', el);
  const total = cells.flat().length;
  return (p) => {
    const lit = Math.round(p * total);
    let sent = 0;
    cells.forEach((row, r) => {
      row.forEach((cell, k) => cell.classList.toggle('is-on', r * row.length + k < lit));
      if ((r + 1) * row.length <= lit) sent++;
    });
    setText(count, `${sent} sent`);
  };
}

/**
 * Power dialer: dial, and while it rings, open the lead's website and CRM notes; connect,
 * read the script, pick the outcome, log it, next. The businesses are made up.
 */
function dialer(el: HTMLElement): Render {
  const ring = q('.dialer__ring', el);
  const status = q('[data-dial-status]', el);
  const name = q('[data-dial-name]', el);
  const time = q('[data-dial-time]', el);
  const count = q('[data-dial-count]', el);
  const lead = q('[data-dial-lead]', el);
  const site = q('[data-dial-site]', el);
  const reviews = q('[data-dial-reviews]', el);
  const web = q('[data-dial-web]', el);
  const last = q('[data-dial-last]', el);
  const bars = qa('.dialer__script i', el);
  const outcomes = qa('[data-outcome]', el);
  const logged = q('[data-dial-logged]', el);
  const calls = [
    { who: 'Landscaping · Caledon', outcome: 0, answered: true, colour: '#2c3a33', reviews: '4.7 from 52', web: 'No online booking', last: 'None yet' },
    { who: 'HVAC · Vaughan', outcome: 2, answered: false, colour: '#2e3a52', reviews: '4.2 from 18', web: 'Slow on phones', last: 'None yet' },
    { who: 'Bakery · Oakville', outcome: 1, answered: true, colour: '#5a3b2e', reviews: '4.8 from 210', web: 'Menu is a PDF', last: 'Emailed in May' },
    { who: 'Roofing · Brampton', outcome: 3, answered: true, colour: '#3d3a52', reviews: '4.9 from 64', web: 'Last updated 2019', last: 'None yet' },
  ];
  let shown = -1;
  return (p) => {
    const n = Math.min(calls.length - 1, Math.floor(p * calls.length));
    const t = p * calls.length - n; // how far into call n
    const call = calls[n];
    let state = 'Calling';
    let ringing = true;
    let secs = 0;
    let read = 0;
    let picked = -1;
    if (call.answered) {
      if (t >= 0.2) {
        state = 'Connected';
        ringing = false;
        secs = Math.floor(Math.min(1, (t - 0.2) / 0.55) * (24 + n * 9));
      }
      if (t >= 0.3) read = Math.min(bars.length, Math.floor((t - 0.3) / 0.12) + 1);
      if (t >= 0.7) picked = call.outcome;
    } else if (t >= 0.45) {
      state = 'No answer';
      ringing = false;
      picked = call.outcome;
    }
    if (n !== shown) {
      shown = n;
      setText(name, call.who);
      setText(count, `Call ${n + 1} of 40`);
      site.style.setProperty('--site', call.colour);
      setText(reviews, call.reviews);
      setText(web, call.web);
      setText(last, call.last);
    }
    // The research loads in the first moments of each call.
    lead.classList.toggle('is-loading', t < 0.1);
    setText(status, state);
    setText(time, `00:${String(secs).padStart(2, '0')}`);
    ring.classList.toggle('is-ringing', ringing);
    bars.forEach((b, k) => b.classList.toggle('is-read', k < read));
    outcomes.forEach((o, k) => o.classList.toggle('is-picked', k === picked));
    logged.classList.toggle('is-shown', t >= 0.82);
  };
}

/** Mockup video generator: the site scrolls down and back in both devices, then posts. */
function mockup(el: HTMLElement): Render {
  const sites = qa('[data-mock-site]', el);
  const status = q('[data-mock-status]', el);
  const fresh = q('.mockup__feed .is-new', el);
  const ease = gsap.parseEase('power1.inOut');
  let posted: boolean | undefined;
  return (p, instant = false) => {
    const down = ease(gsap.utils.clamp(0, 1, p / 0.45));
    const up = ease(gsap.utils.clamp(0, 1, (p - 0.5) / 0.35));
    gsap.set(sites, { yPercent: -42 * (down - up) });
    const ready = p >= 0.9;
    setText(status, ready ? 'Ready to post' : 'Rendering');
    if (ready === posted) return;
    posted = ready;
    fresh.classList.toggle('is-new', ready);
    gsap.to(fresh, {
      scale: ready ? 1 : 0.2,
      opacity: ready ? 1 : 0,
      duration: instant ? 0 : ready ? 0.6 : 0.25,
      ease: ready ? 'back.out(2)' : 'power1.in',
      overwrite: true,
    });
  };
}
