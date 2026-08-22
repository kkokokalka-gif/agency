# Version 2 · "the dot matrix"

Built to the supplied brand package: `The Regulars — Website Build Brief` and the
`Brand Presentation` deck. Everything here comes from those two files, nothing invented.

- **Colour:** Surface `#F6FBFD` · Ink `#12131C` · Blue `#1924E6` · Neon `#D5FA33` · Deep lime `#5A7302`.
  Balance 60 / 30 / 10, and at most one neon element per viewport.
- **Type:** Inter 800–900 (display and wordmark) · Space Mono 400/700 (body, UI) ·
  JetBrains Mono 700–800 tabular (every number).
- **Mark:** the R of twelve rounded-square dots, geometry copied verbatim from the deck
  (viewBox `0 0 53.2 67.2`, dot 11.2, rx 3.4, pitch 14). Accent dot bottom right:
  neon on dark and blue grounds, deep lime on light, blue on neon.
- **Motion:** the deck's two loops. "Colour chase" runs in the nav mark on hover and on
  every route change; "assemble" logic drives the mark state of the background field.
- **Copy:** the brief's voice. No em dashes anywhere, per the brand preference.

## The scroll graphic

`assets/js/matrix.js` renders the whole viewport as the brand's own atom: a grid of
rounded squares. Scroll position selects the state, scroll speed sets its amplitude.

| # | State | Reads as |
|---|-------|----------|
| 0 | The mark, held, with the colour chase running through it | identity |
| 1 | Equalizer band, harmonics plus scroll energy | the machine talking |
| 2 | Cohorts: rows decaying left to right, a few holding on | retention |
| 3 | A square pulse out to the edge and back | the customer returning |
| 4 | The mark again | close |

Ground colour follows the section you are in: an observer sets `data-ground` on the
document, CSS transitions every token, and the matrix eases its dot colour over the same
340ms so type and field never disagree.

## Structure

Single document, hash routes (`#/work`, `#/case`, `#/services`, `#/about`, `#/contact`)
matching the brief's sitemap. Each route is a self-contained block, so splitting this into
five static pages later is a copy and paste, not a rewrite.

`standalone.html` = the whole site in one file (what the shared preview runs).

- **Live preview:** https://claude.ai/code/artifact/77b39031-2088-4113-a9da-3578901d361b
