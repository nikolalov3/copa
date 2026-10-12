/* Vercel Edge Middleware: wykrywa boty AI czytające stronę i zapisuje je w toodip stats (zakładka Boty AI).
   Tylko obserwuje: nic nie zwraca, więc strona serwuje się normalnie. Ludzi liczy skrypt s.js w przeglądarce.
   Wzór z Belmontu; tu dodatkowo liczymy odczyty llms.txt, robots.txt i sitemap.xml (ważny sygnał przy GEO). */

const SITE_ID = '22ae417e-a9ca-4837-a406-ca667fc24079';
const ENDPOINT = 'https://stats.toodip.com/api/bot';

export const config = {
  matcher: ['/((?!_next|api|.*\\.[a-zA-Z0-9]+$).*)', '/llms.txt', '/robots.txt', '/sitemap.xml']
};

function detectBot(ua) {
  const m = {
    'GPTBot': /GPTBot/i, 'OAI-SearchBot': /OAI-SearchBot/i, 'ChatGPT-User': /ChatGPT-User/i,
    'ClaudeBot': /ClaudeBot/i, 'Claude-Web': /Claude-Web/i, 'Claude-User': /Claude-User/i, 'anthropic-ai': /anthropic-ai/i,
    'PerplexityBot': /PerplexityBot/i, 'Perplexity-User': /Perplexity-User/i,
    'CCBot': /CCBot/i, 'Google-Extended': /Google-Extended/i, 'Applebot-Extended': /Applebot-Extended/i,
    'Bytespider': /Bytespider/i, 'Amazonbot': /Amazonbot/i, 'Meta-ExternalAgent': /Meta-ExternalAgent/i
  };
  for (const name in m) { if (m[name].test(ua)) return name; }
  return null;
}

export default function middleware(request, context) {
  try {
    const bot = detectBot(request.headers.get('user-agent') || '');
    if (bot) {
      const path = new URL(request.url).pathname;
      const p = fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: SITE_ID, bot: bot, path: path })
      }).catch(function () {});
      if (context && typeof context.waitUntil === 'function') context.waitUntil(p);
    }
  } catch (e) {}
}
