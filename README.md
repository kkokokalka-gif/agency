# THE REGULARS — website

Site για το **The Regulars**, ανεξάρτητο agency (performance · web · social) με έδρα την Αθήνα.
Στατικό: HTML / CSS / vanilla JS, χωρίς build step, χωρίς dependencies.

```bash
python3 -m http.server 8000     # → http://localhost:8000
```

```
index.html              η ενεργή έκδοση
assets/css/main.css     tokens της ταυτότητας + όλα τα components
assets/js/signal.js     το scroll-driven γραφικό (canvas)
assets/js/app.js        router, γλώσσα, θέμα, grounds, reveal, φόρμα
assets/video/           το βίντεο του hero (δείτε το README εκεί)
versions/<n>/           παγωμένα αντίγραφα κάθε εκδοχής + NOTES.md
```

## Εκδόσεις

| # | Όνομα | Πού | Preview |
|---|-------|-----|---------|
| 1 | ember / the field | `versions/1/` | [link](https://claude.ai/code/artifact/350591da-3eb1-4119-bea0-5573762e844f) |
| 2 | the dot matrix | `versions/2/` | [link](https://claude.ai/code/artifact/77b39031-2088-4113-a9da-3578901d361b) |
| **3** | **the signal** | `versions/3/` + **root (ενεργή)** | [link](https://claude.ai/code/artifact/0db45aa3-8896-48fb-859d-c82b8fa33202) |

Η ενεργή έκδοση ζει πάντα στο root. Όταν κλειδώνει μια εκδοχή, αντιγράφεται σε
`versions/<n>/` με δικό της `NOTES.md`. Η **1** ήταν πρόταση ταυτότητας πάνω στο αρχικό
brand brief· η **2** υλοποίησε το επίσημο brand package· η **3** συνδυάζει το layout της 1 με την παλέτα της 2.

---

## Έκδοση 3 — τι είναι

Το **layout της 1** (hero με τον ορισμό του θαμώνα, marquee, δύο κατευθύνσεις, ο εχθρός,
κύκλος LTV, accordion, βήματα, «τι δεν κάνουμε», quote, FAQ, φόρμα) με τα **χρώματα και το
σήμα της 2**, **χωρίς** το section των μαθηματικών, και με:

- **Σελίδα ανά επιλογή μενού** `#/` · `#/system` · `#/services` · `#/work` · `#/process` ·
  `#/about` · `#/contact`.
- **EL / EN** και **φωτεινό / σκοτεινό**, και τα δύο από την έκδοση 1, με μνήμη στον browser.
- **Βίντεο στο hero** βάλτε `assets/video/hero.mp4` και παίζει αυτόματα. Υπάρχει ήδη ένα
  placeholder `hero.webm` για το preview. Οδηγίες: `assets/video/README.md`.
- **Ήσυχο γραφικό** αντί για το πυκνό πλέγμα της 2, ένα σχεδόν αόρατο grid και μία γραμμή
  οριζόντα που αλλάζει σχήμα με το scroll, με **μία** neon τελεία πάνω της.

Παλέτα, τυπογραφία, σήμα και κανόνες (60/30/10, ένα neon ανά οθόνη) όπως στο brand package.
Πλήρεις σημειώσεις: `versions/3/NOTES.md`. Για τις προηγούμενες: `versions/1/NOTES.md`,
`versions/2/NOTES.md`.

### Πριν πάει live

1. **Βίντεο** αντικαταστήστε το placeholder με το δικό σας `hero.mp4`.
2. **Φόρμα** τώρα συνθέτει `mailto:`. Για κανονική παραλαβή, δείξτε το submit handler του
   `assets/js/app.js` σε endpoint (Formspree, Resend, δικό σας API).
3. **Πραγματική δουλειά** τα δύο tiles εκτός Yum Tales είναι placeholders με τίμια
   διατύπωση· αντικαταστήστε τα όταν υπάρχουν αποτελέσματα.
4. **SEO** ένα document με hash routes. Αν χρειαστούν πραγματικά URLs, κάθε `.route` είναι
   αυτοτελές: γίνεται split σε επτά στατικά αρχεία χωρίς rewrite.
5. **Fonts** από Google Fonts (Inter, Space Mono, JetBrains Mono). Για self-hosting,
   κατεβάστε τα και αλλάξτε το `<link>` σε `@font-face`.
6. **OG image** υπάρχουν `og:title` / `og:description`, λείπει εικόνα. Το favicon είναι ήδη
   το σήμα σε SVG.
