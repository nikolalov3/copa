# COPPA · strona · stan i rzeczy do zrobienia

v0.2 (2026-10-07): nowy design (minimalizm, zdjęcia niosą kolor), treści od Kasi i Tomka, 8 zdjęć tiramisu, prawdziwe logo.

## Decyzje Mikołaja (2026-10-08)
- Cen NIE podajemy. Sekcja Menu: tak, ale jako tekst w HTML (pozycje bez cen), przepisana ze zdjęcia karty, które Mikołaj robi w lokalu. Zdjęcie karty może być dodatkiem, nie źródłem treści.
- Zdjęć wnętrza nie robimy, hero zostaje z tiramisu klasycznym.
- Logo zostaje jako PNG wycięte z tła.
- Ogródek i wydarzenia potwierdzone, zostają.
- Opisy dwóch sezonowych (brzoskwinia+tymianek, pralina) dopisane w stylu Kasi, PL i EN.

## Od klienta, czeka
- [ ] Zdjęcie karty menu (Mikołaj, w lokalu) → sekcja Menu bez cen + link w nawigacji i doku.
- [ ] Zdjęcie tiramisu śliwka z kruszonką → dziewiąty slajd w galerii.
- [ ] Mail kontaktowy (opcjonalnie) → stopka + `email` w JSON-LD.

## Logo
- Oryginały od klienta w `img/_src/`. Wycięte do webu w `img/logo/`. Zostaje tak.

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
