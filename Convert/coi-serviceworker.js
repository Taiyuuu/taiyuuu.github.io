const coep = "require-corp";
const coop = "same-origin";

if (typeof window === "undefined") {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("fetch", function (event) {
    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
      return;
    }

    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 0) {
            return response;
          }

          const newHeaders = new Headers(response.headers);
          newHeaders.set("Cross-Origin-Embedder-Policy", coep);
          newHeaders.set("Cross-Origin-Opener-Policy", coop);

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    if (window.crossOriginIsolated) return;

    const n = navigator;
    if (n.serviceWorker) {
        n.serviceWorker.register(window.document.currentScript.src).then(
            (registration) => {
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "activated" && !n.serviceWorker.controller) {
                            window.location.reload();
                        }
                    });
                });

                if (registration.active && !n.serviceWorker.controller) {
                    window.location.reload();
                }
            },
            console.error
        );
    }
  })();
}