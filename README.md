# THE REGULARS — website

Site για το **The Regulars**, ανεξάρτητο agency (performance · web · social) με έδρα την Αθήνα.
Στατικό: HTML / CSS / vanilla JS, χωρίς build step, χωρίς dependencies.

```bash
python3 -m http.server 8000     # → http://localhost:8000
```

```
index.html              η ενεργή έκδοση
assets/css/main.css     tokens της ταυτότητας + όλα τα components
assets/js/matrix.js     το scroll-driven γραφικό (canvas)
assets/js/app.js        router, grounds, reveal, charts, φόρμα
versions/<n>/           παγωμένα αντίγραφα κάθε εκδοχής + NOTES.md
```

## Εκδόσεις

| # | Όνομα | Πού | Preview |
|---|-------|-----|---------|
| 1 | ember / the field | `versions/1/` | [link](https://claude.ai/code/artifact/350591da-3eb1-4119-bea0-5573762e844f) |
| **2** | **the dot matrix** | `versions/2/` + **root (ενεργή)** | [link](https://claude.ai/code/artifact/77b39031-2088-4113-a9da-3578901d361b) |

Η ενεργή έκδοση ζει πάντα στο root. Όταν κλειδώνει μια εκδοχή, αντιγράφεται σε
`versions/<n>/` με δικό της `NOTES.md`. Η **1** ήταν πρόταση ταυτότητας πάνω στο αρχικό
brand brief· η **2** υλοποιεί το επίσημο brand package που ακολούθησε.

---

## Έκδοση 2 — τι είναι

Χτισμένη αυστηρά πάνω στο `The Regulars — Website Build Brief` και το
`Brand Presentation` deck. Τίποτα εφευρημένο: χρώματα, τυπογραφία, γεωμετρία του σήματος
και tone of voice έρχονται από εκεί.

- **Χρώμα** Surface `#F6FBFD` · Ink `#12131C` · Blue `#1924E6` · Neon `#D5FA33` ·
  Deep lime `#5A7302`. Ισορροπία 60 / 30 / 10 και **ένα** neon στοιχείο ανά οθόνη.
- **Τυπογραφία** Inter 800–900 (display, wordmark) · Space Mono (κείμενο, UI) ·
  JetBrains Mono tabular (κάθε νούμερο).
- **Σήμα** το R από δώδεκα rounded squares, με τη γεωμετρία του deck αυτούσια
  (viewBox `0 0 53.2 67.2`, dot 11.2, rx 3.4, βήμα 14). Η accent τελεία αλλάζει χρώμα
  ανά φόντο: neon σε ink/blue, deep lime σε light, blue πάνω σε neon.
- **Κίνηση** και τα δύο loops του deck: *colour chase* στο σήμα του nav (hover και σε κάθε
  αλλαγή σελίδας) και *assemble* στη λογική του background field.
- **Κείμενο** στη φωνή του brief. Καμία παύλα em dash, όπως ζητά το brand.

### Το γραφικό που κινείται με το scroll

`assets/js/matrix.js`: ολόκληρο το viewport γίνεται το άτομο της ταυτότητας, ένα πλέγμα
από rounded squares. **Η θέση του scroll διαλέγει κατάσταση, η ταχύτητα δίνει το πλάτος.**

| # | Κατάσταση | Διαβάζεται ως |
|---|-----------|----------------|
| 0 | Το σήμα, σχηματισμένο, με το colour chase να το διατρέχει | ταυτότητα |
| 1 | Μπάντα equalizer, αρμονικές + ενέργεια scroll | η μηχανή μιλάει |
| 2 | Cohorts: σειρές που σβήνουν προς τα δεξιά, λίγοι αντέχουν | retention |
| 3 | Τετράγωνος παλμός ως την άκρη και πίσω | ο πελάτης επιστρέφει |
| 4 | Ξανά το σήμα | κλείσιμο |

Το φόντο ακολουθεί το section: ένας observer βάζει `data-ground` στο document, το CSS κάνει
transition όλα τα tokens και ο καμβάς κάνει ease το χρώμα των dots στα ίδια 340ms, ώστε
τυπογραφία και πλέγμα να μη διαφωνούν ποτέ. Με `prefers-reduced-motion` ζωγραφίζεται ένα
στατικό καρέ.

### Interactive

- **The boring truth** (home): τα ίδια δώδεκα μήνες σε δύο reports. Το «συνηθισμένο»
  δείχνει σωρευτικό τζίρο που πάντα ανεβαίνει· το δικό μας δείχνει τι επέστρεψε, με
  repeat rate, LTV:CAC και το `-8%` στα νέα. Γυρίζει και μόνο του μία φορά, για να πέσει
  το επιχείρημα ακόμα κι αν δεν το πατήσει κανείς. Το **neon εμφανίζεται μόνο στην
  ειλικρινή εκδοχή**.
- **Case study** Yum Tales Supply: μπλε μπάρες, τελευταία neon, ακριβώς όπως το report
  slide του deck.
- Hash routing στις πέντε σελίδες του sitemap, μετρητές που ανεβαίνουν, reveal on scroll,
  mobile menu.

### Πριν πάει live

1. **Στοιχεία επικοινωνίας** `hello@theregulars.gr` υπάρχει· λείπει τηλέφωνο αν χρειάζεται.
2. **Φόρμα** τώρα συνθέτει `mailto:`. Για κανονική παραλαβή, δείξτε το submit handler του
   `assets/js/app.js` σε endpoint (Formspree, Resend, δικό σας API).
3. **Πραγματική δουλειά** τα δύο tiles εκτός Yum Tales είναι placeholders με τίμια
   διατύπωση· αντικαταστήστε τα όταν υπάρχουν αποτελέσματα.
4. **SEO** το site είναι ένα document με hash routes. Αν χρειαστούν πραγματικά URLs,
   κάθε `.route` είναι αυτοτελές: γίνεται split σε πέντε στατικά αρχεία χωρίς rewrite.
5. **Fonts** από Google Fonts. Για self-hosting, κατεβάστε τα και αλλάξτε το `<link>` σε
   `@font-face`.
6. **OG image** υπάρχουν `og:title` / `og:description`, λείπει εικόνα. Το favicon είναι ήδη
   το σήμα σε SVG (blue container, surface R, neon dot).
