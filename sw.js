// Bump this version when changing the offline shell or its assets.
const CACHE='gmv-offline-v1-20261031';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable.png'];
const OPTIONAL=['./gioi-thieu.html','./lien-he.html','./chinh-sach.html'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(CORE);await Promise.allSettled(OPTIONAL.map(url=>cache.add(url)));await self.skipWaiting()})())});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(key=>key.startsWith('gmv-offline-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim()})())});
self.addEventListener('message',event=>{if(event.data==='OFFLINE_READY'&&event.ports[0]){event.waitUntil((async()=>{const cache=await caches.open(CACHE);const entries=await Promise.all(CORE.map(url=>cache.match(url)));event.ports[0].postMessage(entries.every(Boolean))})())}});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 // Cache only app resources; leave ads.txt, ads and other requests to the network.
 const known=[...CORE,...OPTIONAL].some(path=>new URL(path,self.registration.scope).pathname===url.pathname);if(!known)return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(event.request);if(response.ok){await cache.put(url.pathname,response.clone());return response}const saved=await cache.match(url.pathname);return saved||response}catch(error){const saved=await cache.match(url.pathname);if(saved)return saved;return new Response('Trang này chưa được lưu. Hãy kết nối mạng rồi thử lại.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}})());
});
