# Bridge

A one-page story for cold outreach: AI, automation and websites for businesses in Brampton and across Ontario. It lives at `basil-kanaan.github.io/websites-ai-automation/` and is built with Vite, TypeScript and GSAP (ScrollTrigger, SplitText, DrawSVG).

## The story

Each chapter answers the question the one before it raises. Most chapters hold the screen while scrolling plays them through (pinned with ScrollTrigger); with reduced motion or without JavaScript, every chapter is laid out as a plain page in its finished state.

| # | Chapter | What the reader gets |
|---|---------|----------------------|
| 01 | The divide | The hero drawing: their business on one bank, what exists today on the other. Then the evidence (Statistics Canada, Q2 2026): 19.2% of Canadian businesses used AI to produce goods or deliver services, and 40.0% said it isn't relevant to them. Then "AI is relevant to far more businesses than that": the same dots count office and admin tasks instead, the 90% AI could do or speed up in theory cross over, and the 34% covered by real use fill in (Anthropic, March 2026). Then "Most owners were simply never shown what it can do for a business like theirs", drawn as 6 kinds of business wired to the work they all have and what it gives back (+ Credibility, + Money, + Time), and "If that's you, it isn't your fault", with one owner holding a job in every hand. |
| 02 | What AI really is | One short line at a time, each with its part of a chart: "AI isn't magic", people across almost any kind of work, AI as a tall narrow spike, and its guesses outside that slice. "So what do you give it, and what do you keep?" Cards sort into "Give it to AI" and "Keep it with a person". Then the close, on its own: "So I build systems that turn one person into an army", drawn as one person in front of a formation of AI. |
| 03 | Who's building it | "AI agents and automations need testing", told as an agent's run on a customer email: 2 steps fine, a guess, 2 more built on it, the message the customer would get, a test pass that catches the 3, then the golden run with the owner approving the message. Then background (Honours BSc, Computer Science Specialist, University of Toronto, with High Distinction; acting CTO; AI training at Outlier) wiring a small neural network, and 3 systems I run on myself: cold email engine, power dialer (opens each lead's website and CRM notes as it rings), mockup video generator. |
| 04 | Where you're losing | 6 leaks, one at a time. Each has an example with made-up numbers, labelled "Example": the customers or money that slip through drop below a line, crossed out, with the count without the fix. Then the fix, everyone back in the row, and the count with it. |
| 05 | What I'd build | 18 services in 5 groups, with a filter by kind of business. |
| 06 | How we start | 4 steps, drawn as a bridge deck laid on piers. Then the same drawing as the hero, bridged, and the contact block. |

An earlier version scrolled natively with one held scene. It was retired on October 29, 2026; a zip of the project as it was then is in `review/` (not committed).

## Run it

```bash
npm ci
npm run dev       # http://localhost:5173/websites-ai-automation/
npm run build     # typecheck, then build to dist/
npm run preview   # serve dist/
```

`scripts/net.mjs` regenerates `partials/net.html` (the neural network drawing). Partials are included at build time with `<!-- include:partials/x.html key=value -->`; underscores in a value become spaces.

## Outreach links

Give every opener its own slug, one parameter instead of five UTM tags:

```
https://basil-kanaan.github.io/websites-ai-automation/?s=<campaign>.<content>
https://basil-kanaan.github.io/websites-ai-automation/?s=trades-oct.e1-missed-calls
https://basil-kanaan.github.io/websites-ai-automation/?s=trades-oct.e1-missed-calls&src=linkedin
```

- **No-website batch:** add `for=web`, e.g. `?for=web&s=trades-nov.e1-no-site`. The page then opens on a website chapter ("Before they call, they look you up.", 2 Statistics Canada figures, what a missing website leaves unanswered), and the hero after it reads "Past the website". Without `for=web` the page is unchanged. GA4 gets `page_variant: web`, and the parameter stays in the address bar, so a forwarded link opens the same version.
- The part before the first dot becomes `utm_campaign`, the rest `utm_content`; source is `email` (or `src`), medium is `outreach`. The slug is removed from the address bar, so a forwarded link is not counted as the same opener.
- GA4 property `G-LQ5PKB2K76` (shared with the portfolio). Everything from this page has the content group `bridge`.
- Events: `book_click` (with where on the page), `section_view` (how far they read), `industry_select` (the filter in 05), `generate_lead` (form sent).
- `?notrack=1` stops tracking in your own browser; `?notrack=0` turns it back on. Nothing is tracked on localhost.

## Contact

- No phone number or email on the page or in this repo, by choice: every contact button books a call, and the form is the written option.
- The form posts to Web3Forms (the same access key as the portfolio) and works without JavaScript; with JavaScript it sends in place.
- **Booking link:** the "Book a time" button (`[data-book]` in `index.html`) points to https://cal.com/qurra-basil/discovery and opens in a new tab.

## Sources

- Statistics Canada, [Canadian Internet Use Survey, 2022, table 22-10-0137-01](https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=2210013701), released July 20, 2023 (website chapter, `?for=web` only): 76.3% of Canadians 15 and older researched information about goods or services online, and 58.5% booked appointments online. The table's notes: percentage of Canadians; the question went to people who used the Internet in the past 3 months.

- Statistics Canada, [Canadian Survey on Business Conditions, second quarter of 2026](https://www150.statcan.gc.ca/n1/pub/11-621-m/11-621-m2026010-eng.htm), released June 11, 2026: 19.2% of businesses used AI to produce goods or deliver services in the past 12 months; 40.0% said AI isn't relevant to their business.
- Anthropic, [Labor market impacts of AI: A new measure and early evidence](https://www.anthropic.com/research/labor-market-impacts), Massenkoff and McCrory, March 5, 2026 (US jobs). The text gives Office and Admin's theoretical share as 90%. Its observed share (34%) is only drawn, in Figure 2: measured from the chart at 34.6%, and printed as 34.3% by [Euronews](https://www.euronews.com/business/2026/03/14/how-ai-will-reshape-work-anthropic-identifies-the-most-exposed-jobs) on March 14, 2026. "Observed" means work-related use of Anthropic's model, Claude, so it is one company's view of real use.
- The theoretical side of that chart is Eloundou, Manning, Mishkin and Rock, [GPTs are GPTs](https://arxiv.org/abs/2303.10130) (OpenAI and the University of Pennsylvania, 2023): a task counts if an AI model could make it at least twice as fast, half if it needs other software built on the model.

## Deploy

Pushing to `master` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages. The repository's Pages source must be set to GitHub Actions.

The page expects to live at `/websites-ai-automation/`, so the repository must be named `websites-ai-automation`. To use another name, change `base` in `vite.config.ts` and the full addresses in `index.html` (canonical, Open Graph, the Newsreader font and the form's redirect).

## Checks before a release

- Local Lighthouse (October 29, 2026, 3 mobile runs and 2 desktop runs): mobile 98 / 100 / 100 / 100 (total blocking time 160 to 170 ms), desktop 100 / 100 / 100 / 100 (total blocking time 20 to 30 ms), no layout shift (performance, accessibility, best practices, SEO).
- Blocking time comes from setting up the holds. `hold()` in `src/stage.ts` queues them and `createHolds()` makes them all at once, because ScrollTrigger measures the whole page again for every hold. Off-screen stages use `content-visibility: auto`. Using the section as the pin spacer (`pinSpacer`) was tried and dropped: Chrome reported it as a full-screen layout shift.
- Each hold is 2 ScrollTriggers: one pins the chapter and one plays its timeline over the same stretch. A pin that carries a timeline plays all of it to the end and back at every measure (gsap 3.15, `ScrollTrigger.js` around line 1522), which cost more than the rest of setting up. The pin still gets an empty timeline, because a ScrollTrigger without one measures the page the moment it is made. The player takes its start and end from the pin instead of measuring the pinned element, which sits at the end of its stretch while its pin is active (chapter 01's timeline stood still until this was fixed). In a timeline that passes `invalidateOnRefresh`, build staggered `from()` tweens with `fromEach()`: after a refresh, ScrollTrigger puts plain `from()` tweens back at their start but not staggered ones.
- Reduced motion shows every chapter in its finished state; with JavaScript off the whole story still reads.
- Crossing 1024 px (chapter 02 switches layouts) must leave exactly 8 `.pin-spacer` elements and both columns of cards.
- Copy rules: no em dashes, no emojis, numerals for numbers, no promised results. The location is Brampton, Ontario or the Greater Toronto Area.
