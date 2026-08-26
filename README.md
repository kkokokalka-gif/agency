# THE REGULARS — website

Site για το **The Regulars**, ανεξάρτητο agency (performance · web · social) με έδρα την Αθήνα.
Στατικό: HTML / CSS / vanilla JS, χωρίς build step, χωρίς dependencies.

```bash
python3 -m http.server 8000     # → http://localhost:8000
```

```
index.html              η ενεργή έκδοση
assets/css/main.css     tokens της ταυτότητας + όλα τα components
assets/js/backdrop.js   το γραφικό του φόντου (canvas)
assets/js/app.js        router, γλώσσα, θέμα, grounds, reveal, φόρμα
assets/video/           το βίντεο του hero (δείτε το README εκεί)
versions/<n>/           παγωμένα αντίγραφα κάθε εκδοχής + NOTES.md
```

## Εκδόσεις

| # | Όνομα | Πού | Preview |
|---|-------|-----|---------|
| 1 | ember / the field | `versions/1/` | [link](https://claude.ai/code/artifact/350591da-3eb1-4119-bea0-5573762e844f) |
| 2 | the dot matrix | `versions/2/` | [link](https://claude.ai/code/artifact/77b39031-2088-4113-a9da-3578901d361b) |
| 3 | the signal | `versions/3/` | [link](https://claude.ai/code/artifact/0db45aa3-8896-48fb-859d-c82b8fa33202) |
| **4** | **σοβαρό προφίλ** | `versions/4/` + **root (ενεργή)** | [link](https://claude.ai/code/artifact/dd3600e2-b64c-4984-adc4-c8d933ea2c65) |

Η ενεργή έκδοση ζει πάντα στο root. Όταν κλειδώνει μια εκδοχή, αντιγράφεται σε
`versions/<n>/` με δικό της `NOTES.md`. Η **1** ήταν πρόταση ταυτότητας πάνω στο αρχικό
brand brief· η **2** υλοποίησε το επίσημο brand package· η **3** συνδυάζει το layout της 1 με την παλέτα της 2.

---

## Έκδοση 4 — τι είναι

Αναθεώρηση της 3 σε τρία μέτωπα.

**Τυπογραφία, πίσω στις γραμματοσειρές της 1.** Inter Tight στους τίτλους, Inter στο σώμα
κειμένου, Literata italic στον ορισμό και τα παραθέματα, IBM Plex Mono στις ετικέτες και
τους αριθμούς. Το σώμα κειμένου έφυγε από monospace.

**Κείμενο με εταιρικό τόνο.** Αφαιρέθηκαν όλες οι διατυπώσεις τύπου «βαρετή αλήθεια» και
«ποτέ υπερπώληση», η ενότητα «ο εχθρός», οι «κανόνες του σπιτιού», το «τι δεν κάνουμε», το
«λέμε / δεν λέμε», το marquee με τα συνθήματα, **και όλα τα εφευρημένα στατιστικά** (41%,
3.1×, 44%, 31%, 3.4×, το case study και το γράφημά του). Στη θέση τους: η μέθοδος σε
τέσσερις αρχές λειτουργίας, οι τέσσερις δείκτες της μηνιαίας αναφοράς ως ορισμοί, τρεις
τύποι συνεργασίας με παραδοτέα και προϋποθέσεις, και FAQ για διάρκεια, ιδιοκτησία
λογαριασμών, τιμολόγηση και χρόνο μέχρι να διαβαστούν αποτελέσματα. Παντού πληθυντικός
ευγενείας.

**Φόντο χωρίς τελείες.** Το `assets/js/backdrop.js` ζωγραφίζει μόνο δύο απαλά wash στο μπλε
του brand που μετακινούνται με το scroll, και μία λεπτή γραμμή χαμηλά στην οθόνη που λυγίζει
με την ταχύτητα του scroll, με μία μικρή neon ένδειξη πάνω της. Το πρώτο section της αρχικής
παίζει βίντεο (`assets/video/hero.mp4`, δείτε το README εκεί).

Σελίδες: `#/` · `#/system` · `#/services` · `#/engagements` · `#/process` · `#/company` ·
`#/contact`. Παραμένουν οι διακόπτες EL/EN και φωτεινού/σκοτεινού. Παλέτα και σήμα από το
brand package. Πλήρεις σημειώσεις: `versions/4/NOTES.md`.

### Πριν πάει live

1. **Βίντεο** αντικαταστήστε το placeholder με το δικό σας `hero.mp4`.
2. **Φόρμα** τώρα συνθέτει `mailto:`. Για κανονική παραλαβή, δείξτε το submit handler του
   `assets/js/app.js` σε endpoint (Formspree, Resend, δικό σας API).
3. **Στοιχεία** το `hello@theregulars.gr` είναι placeholder.
4. **SEO** ένα document με hash routes. Κάθε `.route` είναι αυτοτελές: γίνεται split σε
   επτά στατικά αρχεία χωρίς rewrite.
5. **Fonts** από Google Fonts. Για self-hosting, κατεβάστε τα και αλλάξτε το `<link>` σε
   `@font-face`.
6. **OG image** υπάρχουν `og:title` / `og:description`, λείπει εικόνα.
