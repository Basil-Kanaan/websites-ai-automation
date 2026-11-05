import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { loadTextFont } from './fonts';
import { initContact } from './ui/contact';
import { initMenu } from './scenes/menu';
import { initBar } from './ui/bar';
import { initDivide } from './scenes/divide';
import { initRead } from './scenes/read';
import { initTruth } from './scenes/truth';
import { initExperience } from './scenes/experience';
import { initWho } from './scenes/who';
import { initSystems } from './scenes/systems';
import { initLeaks } from './scenes/leaks';
import { initBuild } from './scenes/build';
import { initReveals } from './scenes/reveals';
import { createHolds, goTo } from './stage';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
// Phones show and hide their address bar while scrolling; that must not re-measure the holds.
ScrollTrigger.config({ ignoreMobileResize: true });
loadTextFont();

// The story, in reading order. One scene per task keeps a slow phone's main thread free;
// only the hero is on screen while this runs. The holds the scenes ask for are created
// together at the end.
const scenes = [initBar, initContact, initDivide, initRead, initTruth, initExperience, initWho, initSystems, initLeaks, initMenu, initBuild, initReveals];
const nextTask = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
(async () => {
  for (const init of scenes) {
    await nextTask();
    init();
  }
  // Line breaks and hold positions depend on the web fonts, so the holds are created and
  // the page is measured once they are in.
  await document.fonts?.ready;
  createHolds();
  // A link into the page (or the form's no-JS redirect to #sent) was scrolled to before
  // the holds added their space, so go there again now.
  const id = decodeURIComponent(location.hash.slice(1));
  if (id) goTo(id, 'auto');
})();
