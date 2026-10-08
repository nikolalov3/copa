# COPPA · Specialty Coffee & Tiramisu · strona

Statyczna strona, bez builda: `index.html` + `style.css` + `app.js`. Cała treść (menu, tiramisu, FAQ, dane lokalu) siedzi w HTML, więc jest czytelna dla robotów AI bez JavaScriptu. JS tylko ulepsza: karuzela, „otwarte do”, kopiowanie WiFi, podświetlanie sekcji.

## Podgląd
Z katalogu notaslop: podgląd `coppa` w `.claude/launch.json` (port 4325), albo:

    python3 -m http.server 4325 --directory /Users/nikola/Desktop/NOTASLOP.UP/coppa-web

## Gdzie co zmienić
- Tiramisu: sekcja `#tiramisu` w `index.html`, każdy slajd to `<article class="slide">` ze zdjęciem `img/tiramisu/<slug>-640/1080.webp`. Tylko smaki ze zdjęciem.
- Kawa: sekcja `#kawa`, lista `<dl class="rows">`. Ceny dojdą z kartą menu.
- WiFi: `#wifiPass` (atrybut `data-pass` + tekst).
- Godziny: w trzech miejscach: pasek górny (fallback), tabela `.hours`, JSON-LD i `HOURS` w `app.js`.
- Dane dla AI: dwa bloki JSON-LD w `<head>` (CafeOrCoffeeShop + FAQPage), `llms.txt`, `robots.txt`.

Lista rzeczy do potwierdzenia z klientem: `TODO.md`.
