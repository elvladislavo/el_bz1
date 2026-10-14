/* ═══════════════════════════════════════════════════════════════════════
   elvladislavo — site behaviour
   ───────────────────────────────────────────────────────────────────────
   Vanilla JS, no dependencies. One rAF loop that sleeps when nothing is
   moving; IntersectionObserver for everything that can be observed rather
   than polled; transforms and opacity only.

   Sections:  01 copy (PL/EN) · 02 split text · 03 reveal · 04 scroll engine
              05 cursor · 06 magnetic · 07 nav · 08 mobile menu
              09 services · 10 form · 11 loader · 12 boot
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var root = document.documentElement;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine   = window.matchMedia('(hover: hover) and (pointer: fine)');
  var REDUCED  = mqReduce.matches;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Safari < 14 only has the deprecated addListener.
  function onMQ(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  /* ══ 01 · Copy ═══════════════════════════════════════════════════════ */

  var COPY = {
    en: {
      'a11y.skip': 'Skip to content', 'a11y.loading': 'Loading', 'a11y.menu': 'Menu',

      'nav.work': 'Work', 'nav.services': 'Services',
      'nav.pricing': 'Pricing', 'nav.contact': 'Contact',

      'hero.eyebrow': 'Independent website studio',
      'hero.title': 'Websites for <em>sensible</em> money.',
      'hero.lede': 'I handle the site from design to launch, so you only pay for the work on it.',
      'hero.cta1': 'Describe your project', 'hero.cta2': 'See pricing',
      'hero.m1k': 'Based in', 'hero.m1v': 'Poland',
      'hero.m2k': 'I speak', 'hero.m3k': 'Status', 'hero.m3v': 'Open for projects',
      'hero.scroll': 'Scroll',

      'work.label': 'Selected work',
      'work.title': 'Two real sites. <em>Click them.</em>',
      'work.lede': 'Both sites are live with their clients. The links go straight to them.',
      'work.cat': 'Website', 'work.visit': 'Visit website',
      'work.cursor': 'VIEW ↗',
      'work.alt1': 'Kameralny Barbershop — website screenshot, linking to kameralnybarbershop.pl',
      'work.alt2': 'Zhyvitsa — website screenshot, linking to zhyvitsa.pl',
      'work.p1': 'The barbershop has been cutting in Piątkowo, Poznań, since 2017, previously as Bishop. The site walks people from the old name to the new one and hands booking to Booksy.',
      'work.p2': 'A floristry studio from Warsaw: bouquets, workshops and decorations. Orders come in by phone and email, and Instagram is the gallery.',

      'svc.label': 'Services',
      'svc.title': 'Five ways to <em>start</em>.',
      'svc.note': "Every project is quoted individually. Pick the closest starting point — I'll shape the rest around your case.",
      'svc.n1': 'Business websites', 'svc.d1': 'A few pages: offer, about, contact. You edit the content yourself.',
      'svc.n2': 'Landing pages',     'svc.d2': 'One page for one offer. The whole case and the form in a single scroll.',
      'svc.n3': 'Custom websites',   'svc.d3': 'Your own layout, typeface and motion, chosen for one brand.',
      'svc.n4': 'WooCommerce shops',   'svc.d4': 'I set up the catalogue, the cart and the payments on WordPress.',
      'svc.d4b': 'You run the shop yourself afterwards: add and edit products, handle orders, change content, set up payments and shipping — all from the WordPress dashboard.',
      'svc.n5': 'Redesigns',         'svc.d5': 'Content and URLs stay. I change the look, the mobile version and the load time.',

      'tag.pages': 'Multi-page structure', 'tag.cms': 'Editable content',
      'tag.seo': 'Technical SEO base', 'tag.forms': 'Contact forms', 'tag.resp': 'Responsive design',
      'tag.single': 'Single-page flow', 'tag.cta': 'Clear call to action', 'tag.speed': 'Fast loading',
      'tag.analytics': 'Analytics-ready', 'tag.art': 'Custom visual direction', 'tag.motion': 'Considered motion',
      'tag.hand': 'Hand-written code', 'tag.a11y': 'Accessibility basics', 'tag.cat': 'Product catalogue',
      'tag.cart': 'Shopping cart', 'tag.checkout': 'Checkout', 'tag.pay': 'Payment integration',
      'tag.ship': 'Shipping configuration', 'tag.prod': 'Product management', 'tag.perf': 'Performance optimisation',
      'tag.audit': 'Structure review', 'tag.rebuild': 'Visual rebuild', 'tag.mobile': 'Mobile repair',
      'tag.redir': 'Clean redirects',

      'app.label': 'Scope of work',
      'app.title': 'What you get',
      'app.h1': 'Design',      'app.p1': 'I set the visual direction from scratch',
      'app.h2': 'Code',        'app.p2': 'Semantic HTML and orderly CSS',
      'app.h3': 'SEO',         'app.p3': 'I sort out titles, structure and sitemap',
      'app.h4': 'Performance', 'app.p4': 'I optimise images and code size',
      'app.h5': 'Mobile',      'app.p5': 'I start from the mobile layout',
      'app.h6': 'Launch',      'app.p6': 'Files and access stay with you',

      'incl.title': 'Standard where the project calls for it',
      'incl.1': 'Responsive design', 'incl.2': 'Semantic HTML', 'incl.3': 'Heading hierarchy',
      'incl.4': 'SEO titles', 'incl.5': 'Meta descriptions', 'incl.6': 'Canonical URLs',
      'incl.7': 'Open Graph', 'incl.8': 'Image alt text', 'incl.9': 'Optimised images',
      'incl.10': 'webp and avif formats', 'incl.11': 'Lazy loading', 'incl.12': 'Accessibility basics',
      'incl.13': 'Mobile navigation', 'incl.14': 'Favicon', 'incl.15': '404 page',
      'incl.16': 'robots.txt', 'incl.17': 'sitemap.xml', 'incl.18': 'Search Console ready',
      'incl.19': 'Analytics-ready', 'incl.20': 'Schema.org / JSON-LD', 'incl.21': 'Clean redirects',
      'incl.22': 'Security basics', 'incl.23': 'Form validation', 'incl.24': 'Spam protection',
      'incl.25': 'Core Web Vitals',
      'incl.badge': 'Worth saying plainly',
      'incl.body': 'Hosting, domain costs, premium plugins or themes, payment-provider fees and third-party services are not automatically included unless we agree otherwise.',
      'incl.seo': 'SEO here means a strong technical foundation — correct structure, speed and crawlability. Nobody honest can guarantee rankings.',

      'pr.label': 'Pricing',
      'pr.title': 'Starting points, <em>not</em> packages.',
      'pr.n1': 'Landing page', 'pr.n2': 'Business websites',
      'pr.n3': 'WooCommerce shops', 'pr.n4': 'Custom websites', 'pr.n5': 'Redesigns',
      'pr.from': 'from',
      'pr.stat': 'I quote after a conversation. <em>You get the range before we start.</em>',
      'pr.fine': 'Prices are approximate quotes. The final cost depends on the available timeframe, complexity, required functionality, integrations, amount of content and amount of work required.',

      'pc.label': 'Process',
      'pc.title': 'Three steps.',
      'pc.h1': 'Tell me what you need', 'pc.p1': 'You describe the project, I ask about the goal and the budget.',
      'pc.h2': 'Design & build',        'pc.p2': 'I present the layout first, then I write the code.',
      'pc.h3': 'Polish & launch',       'pc.p3': 'I test, fix and move it to your hosting.',

      'ct.label': 'Contact',
      'ct.title': "Have an idea? <em>Let's make it real.</em>",
      'ct.name': 'Name', 'ct.email': 'Email', 'ct.need': 'What do you need?',
      'ct.pick': 'Choose one', 'ct.other': 'Something else', 'ct.msg': 'Message', 'ct.send': 'Send',
      'ct.direct': 'Prefer email?', 'ct.langs': 'Service languages',
      'ct.reply': 'Reply time', 'ct.replyv': 'Usually within one working day.',
      'ct.start': 'Start a project',

      'foot.privacy': 'Privacy Policy', 'foot.made': 'Independent website studio',
      'foot.top': 'Back to top',

      'err.name': 'Please add your name.',
      'err.email': 'Please enter a valid email address.',
      'err.need': 'Pick one option.',
      'err.msg': 'Tell me a little about the project.',
      'form.bad': "Something's missing — check the highlighted fields.",
      'form.sending': 'Preparing your message…',
      'form.ok': 'Your message is ready in your email app — hit send and it’s on its way.',
      'form.fail': 'That didn’t go through. Email hello@elvladislavo.com directly and I’ll pick it up.'
    },

    pl: {
      'a11y.skip': 'Przejdź do treści', 'a11y.loading': 'Ładowanie', 'a11y.menu': 'Menu',

      'nav.work': 'Realizacje', 'nav.services': 'Usługi',
      'nav.pricing': 'Cennik', 'nav.contact': 'Kontakt',

      'hero.eyebrow': 'Niezależne studio stron internetowych',
      'hero.title': 'Strony internetowe za <em>rozsądne</em> pieniądze.',
      'hero.lede': 'Zajmuję się stroną od projektu po wdrożenie, więc płacisz tylko za pracę nad nią.',
      'hero.cta1': 'Opisz projekt', 'hero.cta2': 'Zobacz ceny',
      'hero.m1k': 'Lokalizacja', 'hero.m1v': 'Polska',
      'hero.m2k': 'Rozmawiam w', 'hero.m3k': 'Status', 'hero.m3v': 'Przyjmuję projekty',
      'hero.scroll': 'Przewiń',

      'work.label': 'Wybrane realizacje',
      'work.title': 'Dwie prawdziwe strony. <em>Kliknij.</em>',
      'work.lede': 'Obie strony pracują u klientów. Linki prowadzą prosto do nich.',
      'work.cat': 'Strona internetowa', 'work.visit': 'Zobacz stronę',
      'work.cursor': 'ZOBACZ ↗',
      'work.alt1': 'Kameralny Barbershop — zrzut strony internetowej, prowadzi do kameralnybarbershop.pl',
      'work.alt2': 'Zhyvitsa — zrzut strony internetowej, prowadzi do zhyvitsa.pl',
      'work.p1': 'Barbershop tnie na poznańskim Piątkowie od 2017 roku, wcześniej jako Bishop. Strona przeprowadza klientów ze starej nazwy na nową, a rezerwację oddaje do Booksy.',
      'work.p2': 'Pracownia florystyczna z Warszawy: bukiety, warsztaty i dekoracje. Zamówienia przyjmuje telefonicznie i mailowo, a galerią jest Instagram.',

      'svc.label': 'Usługi',
      'svc.title': 'Pięć sposobów, żeby <em>zacząć</em>.',
      'svc.note': 'Każdy projekt wyceniam indywidualnie. Wybierz najbliższy punkt wyjścia — resztę dopasuję do Twojego przypadku.',
      'svc.n1': 'Strony dla firm',  'svc.d1': 'Kilka podstron: oferta, o firmie, kontakt. Treści zmieniasz samodzielnie.',
      'svc.n2': 'Landing page',     'svc.d2': 'Jedna strona pod jedną ofertę. Cała treść i formularz w jednym przewinięciu.',
      'svc.n3': 'Strony autorskie', 'svc.d3': 'Własny układ, krój pisma i animacje, dobrane pod jedną markę.',
      'svc.n4': 'Sklepy WooCommerce', 'svc.d4': 'Katalog, koszyk i płatności uruchamiam na WordPressie.',
      'svc.d4b': 'Sklep prowadzisz potem samodzielnie: dodajesz i edytujesz produkty, obsługujesz zamówienia, zmieniasz treści, ustawiasz płatności i wysyłkę — wszystko z panelu WordPressa.',
      'svc.n5': 'Redesign',         'svc.d5': 'Treści i adresy zostają. Zmieniam wygląd, wersję mobilną i czas ładowania.',

      'tag.pages': 'Struktura wielostronicowa', 'tag.cms': 'Edytowalne treści',
      'tag.seo': 'Techniczna baza SEO', 'tag.forms': 'Formularze kontaktowe', 'tag.resp': 'Responsywny design',
      'tag.single': 'Jedna strona', 'tag.cta': 'Jasne wezwanie do działania', 'tag.speed': 'Szybkie ładowanie',
      'tag.analytics': 'Gotowe pod analitykę', 'tag.art': 'Autorski kierunek wizualny', 'tag.motion': 'Przemyślana animacja',
      'tag.hand': 'Kod pisany ręcznie', 'tag.a11y': 'Podstawy dostępności', 'tag.cat': 'Katalog produktów',
      'tag.cart': 'Koszyk', 'tag.checkout': 'Proces zakupowy', 'tag.pay': 'Integracja płatności',
      'tag.ship': 'Konfiguracja wysyłki', 'tag.prod': 'Zarządzanie produktami', 'tag.perf': 'Optymalizacja wydajności',
      'tag.audit': 'Przegląd struktury', 'tag.rebuild': 'Przebudowa wizualna', 'tag.mobile': 'Naprawa wersji mobilnej',
      'tag.redir': 'Czyste przekierowania',

      'app.label': 'Zakres prac',
      'app.title': 'Co dostajesz',
      'app.h1': 'Design',     'app.p1': 'Kierunek wizualny ustalam od zera',
      'app.h2': 'Kod',        'app.p2': 'Semantyczny HTML i uporządkowany CSS',
      'app.h3': 'SEO',        'app.p3': 'Porządkuję tytuły, strukturę i mapę strony',
      'app.h4': 'Wydajność',  'app.p4': 'Optymalizuję obrazy i rozmiar kodu',
      'app.h5': 'Mobile',     'app.p5': 'Projektowanie zaczynam od wersji mobilnej',
      'app.h6': 'Wdrożenie',  'app.p6': 'Pliki i dostępy zostają u Ciebie',

      'incl.title': 'Standard tam, gdzie projekt tego wymaga',
      'incl.1': 'Responsywny design', 'incl.2': 'Semantyczny HTML', 'incl.3': 'Hierarchia nagłówków',
      'incl.4': 'Tytuły SEO', 'incl.5': 'Meta description', 'incl.6': 'Adresy kanoniczne',
      'incl.7': 'Open Graph', 'incl.8': 'Atrybuty alt', 'incl.9': 'Zoptymalizowane obrazy',
      'incl.10': 'Formaty webp i avif', 'incl.11': 'Lazy loading', 'incl.12': 'Podstawy dostępności',
      'incl.13': 'Nawigacja mobilna', 'incl.14': 'Favicon', 'incl.15': 'Strona 404',
      'incl.16': 'robots.txt', 'incl.17': 'sitemap.xml', 'incl.18': 'Gotowe pod Search Console',
      'incl.19': 'Gotowe pod analitykę', 'incl.20': 'Schema.org / JSON-LD', 'incl.21': 'Czyste przekierowania',
      'incl.22': 'Podstawy bezpieczeństwa', 'incl.23': 'Walidacja formularzy', 'incl.24': 'Ochrona przed spamem',
      'incl.25': 'Core Web Vitals',
      'incl.badge': 'Warto powiedzieć wprost',
      'incl.body': 'Hosting, koszty domeny, płatne wtyczki i motywy, prowizje operatorów płatności oraz usługi zewnętrzne nie są automatycznie wliczone, chyba że ustalimy inaczej.',
      'incl.seo': 'SEO oznacza tu mocny fundament techniczny — poprawną strukturę, szybkość i indeksowalność. Nikt uczciwy nie zagwarantuje pozycji w wynikach.',

      'pr.label': 'Cennik',
      'pr.title': 'Punkty wyjścia, <em>nie</em> pakiety.',
      'pr.n1': 'Landing page', 'pr.n2': 'Strony dla firm',
      'pr.n3': 'Sklepy WooCommerce', 'pr.n4': 'Strony autorskie', 'pr.n5': 'Redesign',
      'pr.from': 'od',
      'pr.stat': 'Wyceniam po rozmowie. <em>Widełki podaję przed startem.</em>',
      'pr.fine': 'Podane ceny są orientacyjne. Końcowa cena zależy od dostępnego czasu, złożoności projektu, wymaganych funkcji, integracji, ilości treści oraz zakresu prac.',

      'pc.label': 'Proces',
      'pc.title': 'Trzy kroki.',
      'pc.h1': 'Opowiedz, czego potrzebujesz', 'pc.p1': 'Opisujesz projekt, ja pytam o cel i budżet.',
      'pc.h2': 'Projekt i budowa',             'pc.p2': 'Najpierw przedstawiam układ, potem piszę kod.',
      'pc.h3': 'Dopracowanie i publikacja',    'pc.p3': 'Testuję, poprawiam i przenoszę na Twój hosting.',

      'ct.label': 'Kontakt',
      'ct.title': 'Masz pomysł? <em>Zróbmy z niego coś konkretnego.</em>',
      'ct.name': 'Imię', 'ct.email': 'E-mail', 'ct.need': 'Czego potrzebujesz?',
      'ct.pick': 'Wybierz', 'ct.other': 'Coś innego', 'ct.msg': 'Wiadomość', 'ct.send': 'Wyślij',
      'ct.direct': 'Wolisz mail?', 'ct.langs': 'Języki obsługi',
      'ct.reply': 'Czas odpowiedzi', 'ct.replyv': 'Zwykle w ciągu jednego dnia roboczego.',
      'ct.start': 'Zacznijmy projekt',

      'foot.privacy': 'Polityka prywatności', 'foot.made': 'Niezależne studio stron internetowych',
      'foot.top': 'Do góry',

      'err.name': 'Podaj imię.',
      'err.email': 'Podaj poprawny adres e-mail.',
      'err.need': 'Wybierz jedną opcję.',
      'err.msg': 'Napisz kilka słów o projekcie.',
      'form.bad': 'Czegoś brakuje — sprawdź zaznaczone pola.',
      'form.sending': 'Przygotowuję wiadomość…',
      'form.ok': 'Wiadomość czeka w Twoim programie pocztowym — wyślij ją i gotowe.',
      'form.fail': 'Nie udało się wysłać. Napisz bezpośrednio na hello@elvladislavo.com.'
    }
  };

  /* The scrolling bands. Proper nouns (WordPress, WooCommerce, Core Web
     Vitals) are the same in both languages; everything else is translated,
     so a Polish visitor never sees an English term drift past. */
  var META = {
    en: {
      title: 'elvladislavo — websites for sensible money',
      desc: "Independent website studio. Websites for companies, landing pages and WooCommerce shops. I design and write the code myself, with no agency in between.",
      locale: 'en_GB', alt: 'pl_PL'
    },
    pl: {
      title: 'elvladislavo — strony internetowe za rozsądne pieniądze',
      desc: 'Niezależne studio stron internetowych. Strony dla firm, landing page i sklepy WooCommerce. Projektuję i piszę kod sam, bez agencji po drodze.',
      locale: 'pl_PL', alt: 'en_GB'
    }
  };

  var lang = (root.lang === 'pl' || root.lang === 'en') ? root.lang : 'en';
  var langWasExplicit = /[?&]lang=(pl|en)\b/.test(location.search);
  try { langWasExplicit = langWasExplicit || !!localStorage.getItem('elv-lang'); } catch (e) {}

  function t(key) { return (COPY[lang] && COPY[lang][key]) || COPY.en[key] || ''; }

  function setMeta(sel, attr, value) {
    var el = $(sel);
    if (el) el.setAttribute(attr, value);
  }

  function applyLang(next, remember) {
    if (!COPY[next]) return;
    lang = next;
    root.lang = next;
    var dict = COPY[next];

    $$('[data-i18n]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n')];
      if (v != null) el.textContent = v;
    });

    $$('[data-i18n-html]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n-html')];
      if (v == null) return;
      el.innerHTML = v;
      el.removeAttribute('data-split-done');
      el.classList.remove('is-split');
    });

    $$('[data-i18n-alt]').forEach(function (el) {
      var v = dict[el.getAttribute('data-i18n-alt')];
      if (v != null) el.setAttribute('alt', v);
    });

    var m = META[next];
    document.title = m.title;
    setMeta('meta[name="description"]', 'content', m.desc);
    setMeta('meta[property="og:title"]', 'content', m.title);
    setMeta('meta[property="og:description"]', 'content', m.desc);
    setMeta('meta[property="og:locale"]', 'content', m.locale);
    setMeta('meta[property="og:locale:alternate"]', 'content', m.alt);
    setMeta('meta[name="twitter:title"]', 'content', m.title);
    setMeta('meta[name="twitter:description"]', 'content', m.desc);

    $$('.lang__btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === next;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    splitAll();
    // Only an explicit pick (a click, or ?lang= in the URL) is remembered;
    // an auto-detected language must stay re-detectable on the next visit.
    if (remember) { try { localStorage.setItem('elv-lang', next); } catch (e) {} }
  }

  /* ══ 02 · Split text ═════════════════════════════════════════════════
     Words, never characters: a screen reader still gets whole words, and
     the stagger reads as intentional rather than jittery.                 */

  function splitWords(el) {
    if (el.getAttribute('data-split-done') === '1') return;
    var frag = document.createDocumentFragment();
    var i = 0;

    function walk(node, target) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          child.textContent.split(/(\s+)/).forEach(function (tok) {
            if (tok === '') return;
            if (!tok.trim()) { target.appendChild(document.createTextNode(' ')); return; }
            var outer = document.createElement('span');
            outer.className = 'sw';
            var inner = document.createElement('span');
            inner.className = 'sw__i';
            inner.style.setProperty('--d', (i * 58) + 'ms');
            inner.textContent = tok;
            outer.appendChild(inner);
            target.appendChild(outer);
            i++;
          });
        } else if (child.nodeType === 1) {
          var copy = document.createElement(child.tagName.toLowerCase());
          Array.prototype.slice.call(child.attributes).forEach(function (a) {
            copy.setAttribute(a.name, a.value);
          });
          walk(child, copy);
          target.appendChild(copy);
        }
      });
    }

    walk(el, frag);
    el.textContent = '';
    el.appendChild(frag);
    el.setAttribute('data-split-done', '1');
    el.classList.add('is-split');
  }

  // Headings already revealed keep their `is-in` class through a language
  // swap, so re-split words show at once instead of replaying the stagger.
  function splitAll() {
    $$('[data-split]').forEach(splitWords);
  }

  /* ══ 03 · Reveal ═════════════════════════════════════════════════════ */

  var revealIO = null;

  function initReveal() {
    if (REDUCED || !('IntersectionObserver' in window)) {
      $$('[data-split], .reveal, [data-cell], .proj, .step, .foot__mark')
        .forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    // Per-group stagger for grids of cells.
    $$('.grid6, .prices, .steps').forEach(function (group) {
      $$('[data-cell], .step', group).forEach(function (cell, i) {
        cell.style.setProperty('--d', (i * 90) + 'ms');
      });
    });

    $$('.reveal[data-delay]').forEach(function (el) {
      el.style.setProperty('--d', el.getAttribute('data-delay') + 'ms');
    });

    $$('[data-split], .reveal, [data-cell], .proj, .step, .foot__mark')
      .forEach(function (el) { revealIO.observe(el); });
  }

  /* ══ 04 · Scroll engine ══════════════════════════════════════════════
     One rAF loop for parallax, drift, variable-font stretch and the nav.
     It stops itself as soon as everything has settled.                   */

  var frameId = 0;
  var scrollDirty = true;
  var settle = 0;
  var motion = [];     // parallax / drift targets currently near the viewport
  var stretchers = [];

  function collectMotion() {
    if (REDUCED) return;
    var index = new WeakMap();

    motion = $$('[data-par], [data-drift]').map(function (el) {
      var item = {
        el: el,
        par: parseFloat(el.getAttribute('data-par')) || 0,
        drift: parseFloat(el.getAttribute('data-drift')) || 0,
        live: false
      };
      index.set(el, item);
      return item;
    });

    if ('IntersectionObserver' in window) {
      var liveIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var item = index.get(e.target);
          if (item) item.live = e.isIntersecting;
        });
        scrollDirty = true; settle = 2; wake();
      }, { rootMargin: '25% 0px 25% 0px' });
      motion.forEach(function (m) { liveIO.observe(m.el); });
    } else {
      motion.forEach(function (m) { m.live = true; });
    }

    stretchers = $$('[data-stretch]').map(function (el) {
      return { el: el, last: -1 };
    });
  }

  function runScroll() {
    var vh = window.innerHeight || 1;

    /* --- read phase (no writes in between, so layout flushes once) --- */
    var live = motion.filter(function (m) { return m.live; });
    var rects = live.map(function (m) { return m.el.getBoundingClientRect(); });
    var stretchRects = stretchers.map(function (s) { return s.el.getBoundingClientRect(); });

    /* --- write phase --- */
    live.forEach(function (m, i) {
      var r = rects[i];
      var p = (r.top + r.height / 2 - vh / 2) / vh;   // ~ -1 … 1
      if (m.par) m.el.style.setProperty('--py', (p * m.par * 150).toFixed(1) + 'px');
      if (m.drift) m.el.style.setProperty('--px', (p * m.drift).toFixed(1) + 'px');
    });

    stretchers.forEach(function (s, i) {
      var r = stretchRects[i];
      if (r.bottom < -200 || r.top > vh + 200) return;
      var p = 1 - Math.min(1, Math.max(0, (r.top + r.height / 2) / vh));  // 0 … 1
      var w = Math.round(74 + p * 46);                                     // wdth 74 … 120
      if (Math.abs(w - s.last) < 1) return;
      s.last = w;
      s.el.style.fontVariationSettings = '"wdth" ' + w;
    });

    updateNav();
  }

  function wake() {
    if (!frameId) frameId = requestAnimationFrame(frame);
  }

  function frame() {
    frameId = 0;
    var more = false;

    if (scrollDirty || settle > 0) {
      scrollDirty = false;
      if (settle > 0) settle--;
      runScroll();
      more = settle > 0;
    }
    if (stepCursor()) more = true;
    if (more) frameId = requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', function () {
    scrollDirty = true; settle = 2; wake();
  }, { passive: true });

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      measureNavIndicator();
      scrollDirty = true; settle = 2; wake();
    }, 140);
  }, { passive: true });

  /* ══ 05 · Cursor ═════════════════════════════════════════════════════ */

  var cursor = $('#cursor');
  var cDot = cursor && $('.cursor__dot', cursor);
  var cRing = cursor && $('.cursor__ring', cursor);
  var mx = -100, my = -100, rx = -100, ry = -100;
  var cursorOn = false;

  function initCursor() {
    if (REDUCED || !mqFine.matches || !cursor) return;
    cursorOn = true;
    root.classList.add('has-cursor');

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      cursor.classList.remove('is-hidden');
      wake();
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      cursor.classList.add('is-hidden');
    });

    document.addEventListener('pointerover', function (e) {
      var view = e.target.closest && e.target.closest('[data-cursor="view"]');
      var link = e.target.closest && e.target.closest('a, button, input, select, textarea, label');
      cursor.classList.toggle('is-view', !!view);
      cursor.classList.toggle('is-link', !!link && !view);
    }, { passive: true });
  }

  function stepCursor() {
    if (!cursorOn) return false;
    var dx = mx - rx, dy = my - ry;
    rx += dx * 0.18; ry += dy * 0.18;
    cDot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    cRing.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
    return Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4;
  }

  /* ══ 06 · Magnetic elements ══════════════════════════════════════════ */

  function initMagnets() {
    if (REDUCED || !mqFine.matches) return;
    $$('.magnet').forEach(function (el) {
      var pending = false, tx = 0, ty = 0;

      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.34;
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          el.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0)';
        });
      }, { passive: true });

      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform .5s cubic-bezier(.16,1.02,.3,1)';
        el.style.transform = '';
        setTimeout(function () { el.style.transition = ''; }, 520);
      });
    });
  }

  /* ══ 07 · Navigation ═════════════════════════════════════════════════ */

  var nav = $('#nav');
  var navLinks = $$('[data-nav]');
  var navInd = $('.nav__ind');
  var lightSec = $('.sec--light');
  var sections = navLinks.map(function (a) { return $(a.getAttribute('href')); });
  var activeLink = null;
  var indMetrics = [];
  var navH = 72;
  var sectionTops = [];

  // All layout reads happen here, never inside the scroll loop.
  function measureNavIndicator() {
    if (nav) navH = nav.offsetHeight || 72;
    sectionTops = sections.map(function (s) { return s ? s.offsetTop : Infinity; });

    if (!navInd || !navLinks.length) return;
    var base = navInd.parentNode.getBoundingClientRect();
    indMetrics = navLinks.map(function (a) {
      var r = a.getBoundingClientRect();
      return { x: r.left - base.left, w: r.width };
    });
    if (activeLink) placeIndicator(navLinks.indexOf(activeLink));
  }

  function placeIndicator(i) {
    if (!navInd || !indMetrics[i]) return;
    navInd.style.transform = 'translateX(' + indMetrics[i].x + 'px) scaleX(' + indMetrics[i].w + ')';
  }

  function updateNav() {
    if (!nav) return;
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('is-stuck', y > 40);

    if (lightSec) {
      var lr = lightSec.getBoundingClientRect();
      nav.classList.toggle('is-invert', lr.top <= navH * 0.55 && lr.bottom >= navH * 0.45);
    }

    var probe = y + navH + window.innerHeight * 0.22;
    var current = -1;
    sectionTops.forEach(function (top, i) {
      if (top <= probe) current = i;
    });

    var next = current >= 0 ? navLinks[current] : null;
    if (next !== activeLink) {
      navLinks.forEach(function (a) { a.classList.remove('is-active'); });
      activeLink = next;
      if (next) {
        next.classList.add('is-active');
        placeIndicator(current);
        if (navInd) navInd.style.opacity = '1';
      } else if (navInd) {
        navInd.style.opacity = '0';
      }
    }
  }

  /* ══ 08 · Mobile menu ════════════════════════════════════════════════ */

  function initMobileMenu() {
    var burger = $('#burger');
    var menu = $('#mobile-menu');
    if (!burger || !menu) return;

    function setOpen(open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.removeAttribute('inert');
        var first = $('a', menu);
        if (first) setTimeout(function () { first.focus(); }, 320);
      } else {
        menu.setAttribute('inert', '');
      }
    }

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });

    // A resize past the breakpoint should never leave the menu stuck open.
    onMQ(window.matchMedia('(min-width: 981px)'), function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ══ 09 · Services ═══════════════════════════════════════════════════ */

  function initServices() {
    $$('.svc__row').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.svc__item');
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        item.classList.toggle('is-open', !open);
      });
    });
  }

  /* ══ 10 · Form ═══════════════════════════════════════════════════════
     No back end is wired up: the form validates, then hands a fully
     composed message to the visitor's mail client. Point ENDPOINT at a
     POST handler (Formspree, Basin, your own script) to send it directly. */

  var ENDPOINT = '';
  var MAIL = 'hello@elvladislavo.com';

  function initForm() {
    var form = $('#contactForm');
    if (!form) return;
    var status = $('#formStatus');
    var btn = $('#sendBtn');
    var checked = false;

    var rules = [
      { id: 'f-name',  err: 'err.name',  test: function (v) { return v.trim().length >= 2; } },
      { id: 'f-email', err: 'err.email', test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } },
      { id: 'f-need',  err: 'err.need',  test: function (v) { return !!v; } },
      { id: 'f-msg',   err: 'err.msg',   test: function (v) { return v.trim().length >= 10; } }
    ];

    function validateOne(rule) {
      var input = document.getElementById(rule.id);
      var field = input.closest('.field');
      var msg = field.querySelector('.field__err');
      var ok = rule.test(input.value);
      field.classList.toggle('is-bad', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      msg.textContent = ok ? '' : t(rule.err);
      return ok;
    }

    rules.forEach(function (rule) {
      var input = document.getElementById(rule.id);
      input.addEventListener('blur', function () { if (checked) validateOne(rule); });
      input.addEventListener('input', function () { if (checked) validateOne(rule); });
      input.addEventListener('change', function () { if (checked) validateOne(rule); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      checked = true;

      // Honeypot: a real person never fills this in.
      var el = form.elements;
      if (el.company && el.company.value) return;

      var bad = rules.filter(function (r) { return !validateOne(r); });
      if (bad.length) {
        status.textContent = t('form.bad');
        status.className = 'form__status is-bad';
        var first = document.getElementById(bad[0].id);
        if (first) first.focus();
        return;
      }

      status.textContent = t('form.sending');
      status.className = 'form__status';
      btn.disabled = true;

      var payload = {
        name: el.name.value.trim(),
        email: el.email.value.trim(),
        need: el.need.value,
        message: el.message.value.trim(),
        lang: lang
      };

      var done = function (ok) {
        btn.disabled = false;
        status.textContent = ok ? t('form.ok') : t('form.fail');
        status.className = 'form__status ' + (ok ? 'is-ok' : 'is-bad');
        if (ok) { form.reset(); checked = false; }
      };

      if (ENDPOINT) {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (r) { done(r.ok); }).catch(function () { done(false); });
        return;
      }

      var subject = 'Project enquiry — ' + payload.name;
      var body = [
        payload.message, '', '—',
        'Name: ' + payload.name,
        'Email: ' + payload.email,
        'Needs: ' + payload.need
      ].join('\n');

      window.location.href = 'mailto:' + MAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      setTimeout(function () { done(true); }, 400);
    });
  }

  /* ══ 11 · Loader ═════════════════════════════════════════════════════ */

  function bootDone() {
    root.classList.remove('is-preload');
    var l = $('#loader');
    if (l) l.classList.add('is-done');
  }

  function runLoader(next) {
    var loader = $('#loader');
    var seen = false;
    try { seen = sessionStorage.getItem('elv-seen') === '1'; } catch (e) {}

    if (!loader || REDUCED || seen) {
      if (loader) loader.classList.add('is-done');
      next();
      return;
    }
    try { sessionStorage.setItem('elv-seen', '1'); } catch (e) {}

    // Stagger the wordmark letters (decorative, so aria-hidden already).
    var mark = $('#loaderMark');
    var word = mark.textContent;
    mark.textContent = '';
    word.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'lc';
      s.textContent = ch;
      s.style.animationDelay = (i * 34) + 'ms';
      mark.appendChild(s);
    });

    var bar = $('#loaderBar');
    var num = $('#loaderNum');
    var start = performance.now();
    var DUR = 900;

    (function tick(now) {
      var p = Math.min(1, (now - start) / DUR);
      var eased = 1 - Math.pow(1 - p, 3);
      bar.style.transform = 'scaleX(' + eased + ')';
      num.textContent = String(Math.round(eased * 100)).padStart(2, '0');
      if (p < 1) { requestAnimationFrame(tick); return; }

      loader.classList.add('is-out');
      next();
      setTimeout(function () { loader.classList.add('is-done'); }, 1000);
    })(start);
  }

  /* ══ 12 · Boot ═══════════════════════════════════════════════════════ */

  function init() {
    var yr = $('#yr');
    if (yr) yr.textContent = new Date().getFullYear();

    applyLang(lang, langWasExplicit);
    initReveal();
    collectMotion();
    initCursor();
    // initMagnets();
    initMobileMenu();
    initServices();
    initForm();

    $$('.lang__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        applyLang(b.getAttribute('data-lang'), true);
        measureNavIndicator();
        scrollDirty = true; settle = 2; wake();
      });
    });

    onMQ(mqReduce, function (e) {
      REDUCED = e.matches;
      if (REDUCED) {
        root.classList.remove('has-cursor');
        cursorOn = false;
      }
    });

    measureNavIndicator();
    scrollDirty = true; settle = 2; wake();

    runLoader(function () {
      root.classList.remove('is-preload');
      // Fonts change metrics; re-measure once they land.
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          measureNavIndicator();
          scrollDirty = true; settle = 2; wake();
        });
      }
    });
  }

  // Never let a scripting error leave the page hidden behind the gate.
  setTimeout(bootDone, 3000);

  function safeInit() {
    try {
      init();
    } catch (err) {
      bootDone();
      if (window.console) console.error(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }
})();
