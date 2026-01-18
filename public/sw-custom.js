// Custom Service Worker for Push Notifications
// This file is imported by the main service worker

self.addEventListener("push", (event) => {
  console.log("[SW] Push event received:", event);

  if (!event.data) {
    console.log("[SW] No push data");
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error("[SW] Error parsing push data:", e);
    return;
  }

  const options = {
    body: data.body || "Bạn có thông báo mới",
    icon: data.icon || "/funcharity-icon-192-v3.png",
    badge: "/funcharity-icon-192-v3.png",
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || "default",
    requireInteraction: true,
    data: {
      url: data.url || "/",
      callId: data.callId,
      conversationId: data.conversationId,
      callType: data.callType,
    },
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title || "FUN Charity", options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);

  event.notification.close();

  const data = event.notification.data;
  let url = data.url || "/";

  // Handle call-specific actions
  if (event.action === "answer" && data.callId) {
    url = `/messages?answer=${data.callId}&conversation=${data.conversationId}&type=${data.callType}`;
  } else if (event.action === "decline") {
    // Just close notification, don't navigate
    return;
  } else if (data.callId) {
    // Default click on call notification - answer the call
    url = `/messages?answer=${data.callId}&conversation=${data.conversationId}&type=${data.callType}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Open new window if none found
      return clients.openWindow(url);
    })
  );
});

// Handle push subscription change
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW] Push subscription changed");
  // The frontend will handle re-subscribing
});
