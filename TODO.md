# COPPA · strona · stan i rzeczy do zrobienia

v0.2 (2026-10-07): nowy design (minimalizm, zdjęcia niosą kolor), treści od Kasi i Tomka, 8 zdjęć tiramisu, prawdziwe logo.

## Od klienta, czeka
- [ ] Karta menu sezonowego z cenami (klient: „w przyszłym tygodniu”). Dopisać ceny do galerii tiramisu, do sekcji Kawa i do JSON-LD (`offers`).
- [ ] Zdjęcia wnętrza / baru / ogródka (do hero i sekcji Miejsce). Teraz hero używa zdjęcia tiramisu klasycznego.
- [ ] Zdjęcie tiramisu śliwka z kruszonką: smak jest w karcie, ale bez zdjęcia NIE wchodzi na stronę (decyzja Mikołaja).
- [ ] Opisy dla sezonowych bez opisu: białe brzoskwinie z tymiankiem cytrynowym, pralina z orzecha laskowego (teraz jedno zdanie z nazwy).
- [ ] Ogródek i wydarzenia: wzięte z wyróżnionych relacji na IG, klient nie potwierdził w mailu. Potwierdzić w czwartek.
- [ ] Telefon i mail do kontaktu (klient nie podał, telefon nie musi być publiczny).
- [x] Domena: coppaspecialty.cafe (placeholdery podmienione 2026-10-08).

## Logo
- Oryginały od klienta: `img/COPPA_LOGO.png`, `img/COPPA_LOGOObszar roboczy 1_11.png`, `img/COPPA_LOGOObszar roboczy 6_5.png` (PNG z tłem).
- Wycięte z tła do webu: `img/logo/coppa-wordmark-rose.png` (pasek górny), `coppa-stack-cream.png` (stopka), `coppa-mark-rose.png` / `coppa-mark-cream.png` (znak), `coppa-lockup-rose.png` (z taglinem). Ikony `img/icon-180.png`, `icon-512.png` z prawdziwego znaku.
- Jeśli klient ma SVG, podmienić, bo PNG z wycięcia ma miękkie krawędzie przy dużym powiększeniu.

## Zdjęcia
- Oryginały w `img/*.JPG` (do 4,6 MB, nie linkowane ze strony). Wersje webowe w `img/tiramisu/<slug>-640.webp` i `-1080.webp`.
- Przy nowych zdjęciach: ten sam skrypt PIL (resize 640/1080, WebP q82), slug jak w `index.html`.

## SEO: zrobione (2026-10-08)
- Schema CafeOrCoffeeShop (geo, godziny, menu z opisami, założyciele, knowsAbout, priceRange 20-40 zł) + FAQPage, osobno PL i EN.
- Head: robots max-image-preview, OG/Twitter z wymiarami i alt, geo meta, favicon.ico + PNG, manifest, preload hero.
- robots.txt (AI boty allow), sitemap z hreflang i obrazkami, llms.txt, WebP + srcset + lazy, width/height na obrazkach.
- Opis meta skrócony do ~155 znaków. Zero myślników i buzzwordów (sprawdzane skryptem).
- Jeszcze do zrobienia wymaga domeny albo danych od klienta (niżej).

## Technicznie, po wykupieniu domeny
- [ ] Po domenie: w `index.html` i `en/index.html` podmienić `DOMENA` i odkomentować blok canonical/hreflang/og:url (jeden `sed`). To samo w `robots.txt` i `sitemap.xml` (sitemap ma już hreflang i 8 obrazków).
- [ ] `robots.txt` i `sitemap.xml`: podmienić `https://DOMENA/`.
- [x] Wersja `/en/` zrobiona (2026-10-08), przełącznik PL/EN w pasku. `hreflang` i `canonical` czekają w komentarzu w `<head>` obu stron na domenę.
- [ ] Deploy: Vercel jak Belmont, potem pomiar toodip.
- [ ] Opinie gości: dopiero z prawdziwymi cytatami z Google.
