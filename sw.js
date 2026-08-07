// Service Worker — Moreno Fundição / Apontamento
// Cacheia só o "casco" do app (HTML/CSS/JS/ícones), pra abrir rápido e
// funcionar mesmo com sinal fraco. Os dados (login, apontamentos) sempre
// vão direto pro Apps Script pela rede — nunca ficam em cache.

const CACHE_NAME = 'apontamento-moreno-v1';
const ARQUIVOS_APP = [
  './apontamento.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_APP))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nunca cachear chamadas ao Apps Script — sempre buscar da rede
  if (url.hostname.includes('script.google.com')) {
    return;
  }

  // Para o resto (casco do app), tenta rede primeiro e cai pro cache se falhar
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
