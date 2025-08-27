import {
   notify,
   getPermissionStatus,
   isNotificationSupported,
} from "./index.js";

// Example usage of the notification utility
async function runExamples() {
   console.log("Notification support:", isNotificationSupported());
   console.log("Permission status:", getPermissionStatus());

   // Basic notification
   await notify("Task completed successfully!");

   // Notification with options
   await notify("Download Complete", {
      body: "Your file has been downloaded successfully.",
      icon: "/favicon.ico",
      badge: "/badge.png",
      requireInteraction: true,
      data: { fileId: "12345" },
      onclick: function () {
         console.log("Notification clicked!");
         window.focus();
      },
   });

   // Notification with custom title
   await notify("New Message", {
      body: "You have received a new message from John.",
      icon: "/message-icon.png",
      vibrate: [200, 100, 200],
      data: { messageId: "msg-456", sender: "John" },
   });

   // Silent notification
   await notify("Background Process", {
      body: "Background sync completed.",
      silent: true,
   });

   // Background notification (only when not on current tab)
   await notify("Background Update", {
      body: "Data updated in the background.",
      showOnSourceTab: false, // Won't show if user is actively viewing this tab
   });
}

// Run examples when page loads
if (typeof window !== "undefined") {
   // Wait a bit for the permission request to complete
   setTimeout(runExamples, 2000);
}

export { runExamples };
