# @devkit-labs/notifier

A lightweight, framework-agnostic browser notification utility with automatic permission handling and a clean API.

## Features

-  **Automatic Permission Handling** - Requests notification permission automatically when imported
-  **Framework Agnostic** - Works with any JavaScript framework or vanilla JS
-  📱 **Full Notification API Support** - Supports all native Notification API options
-  **Smart Tag Management** - Automatically generates unique tags to prevent notification collisions
-  **Auto Favicon Detection** - Uses the page's favicon as notification icon when none provided
-   **Smart Fallbacks** - Shows alert with beep sound when notifications are blocked
-  **TypeScript Support** - Fully typed with comprehensive interfaces
-  **Lightweight** - Minimal dependencies and small bundle size
-  **Browser Compatibility** - Works across all modern browsers

## Installation

```bash
npm install @devkit-labs/notifier
```

## Quick Start

```typescript
import { notify } from "@devkit-labs/notifier";

// Basic notification
await notify("Task completed successfully!");

// Notification with options
await notify("Download Complete", {
   body: "Your file has been downloaded successfully.",
   icon: "/favicon.ico",
   requireInteraction: true,
   onclick: () => {
      console.log("Notification clicked!");
      window.focus();
   },
});
```

## API Reference

### `notify(title, options?)`

Creates and displays a browser notification.

**Parameters:**

-  `title` (string): The notification title
-  `options` (NotificationOptions, optional): Notification configuration options

**Returns:** `Promise<Notification | null>` - The created notification instance or null if failed

### NotificationOptions

All options from the native Notification API are supported:

```typescript
interface NotificationOptions {
   badge?: string; // URL of badge image
   body?: string; // Notification body text
   data?: any; // Custom data to attach
   dir?: "auto" | "ltr" | "rtl"; // Text direction
   icon?: string; // URL of notification icon
   image?: string; // URL of notification image
   lang?: string; // Language code
   onclick?: (event: Event) => void; // Click handler
   onclose?: (event: Event) => void; // Close handler
   onerror?: (event: Event) => void; // Error handler
   onshow?: (event: Event) => void; // Show handler
   renotify?: boolean; // Whether to replace previous notifications
   requireInteraction?: boolean; // Keep notification visible until user interacts
   showOnSourceTab?: boolean; // Whether to show notification when user is on current tab (default: true)
   silent?: boolean; // Whether notification should be silent
   timestamp?: number; // Custom timestamp
   title?: string; // Alternative title (use parameter instead)
   vibrate?: number[]; // Vibration pattern for mobile devices
}
```

### Utility Functions

#### `getPermissionStatus()`

Returns the current notification permission status.

```typescript
import { getPermissionStatus } from "@devkit-labs/notifier";

const status = getPermissionStatus(); // 'default' | 'granted' | 'denied'
```

#### `isNotificationSupported()`

Checks if the browser supports notifications.

```typescript
import { isNotificationSupported } from "@devkit-labs/notifier";

if (isNotificationSupported()) {
   // Notifications are supported
}
```

## Examples

### Basic Usage

```typescript
import { notify } from "@devkit-labs/notifier";

// Simple notification
await notify("Hello World!");

// With body text
await notify("New Message", {
   body: "You have received a new message.",
});
```

### Advanced Usage

```typescript
import { notify } from "@devkit-labs/notifier";

// Rich notification with all options
await notify("Download Complete", {
   body: 'Your file "document.pdf" has been downloaded successfully.',
   icon: "/icons/download.png",
   badge: "/icons/badge.png",
   image: "/images/preview.jpg",
   tag: "download-notification",
   requireInteraction: true,
   vibrate: [200, 100, 200],
   data: {
      fileId: "12345",
      fileName: "document.pdf",
      downloadTime: Date.now(),
   },
   onclick: function () {
      console.log("User clicked on download notification");
      // Focus the window or navigate to downloads page
      window.focus();
   },
   onclose: function () {
      console.log("Notification was closed");
   },
});
```

### Tab Visibility Control

```typescript
import { notify } from "@devkit-labs/notifier";

// Only show notification if user is NOT on the current tab
// Useful for background processes or when you have in-app UI handling
await notify("New Message", {
   body: "You have a new message from John",
   showOnCurrentTab: false, // Won't show if user is actively viewing this tab
});

// Always show notification (default behavior)
await notify("Important Alert", {
   body: "This will always show regardless of tab visibility",
   showOnCurrentTab: true, // This is the default
});

// Example: Conditional notification based on app state
const hasInAppToast = true;
await notify("Task Complete", {
   body: "Your background task finished successfully",
   showOnCurrentTab: !hasInAppToast, // Only show notification if no in-app toast
});
```

### Permission Handling

The library automatically requests notification permission when imported. You don't need to manually handle permissions, but you can check the status if needed:

```typescript
import { notify, getPermissionStatus } from "@devkit-labs/notifier";

// Check permission status
const permission = getPermissionStatus();

if (permission === "granted") {
   await notify("Notifications are enabled!");
} else if (permission === "denied") {
   console.log("Notifications are blocked by the user");
} else {
   console.log("Permission request is pending");
}
```

### Permission Denied Fallbacks

```typescript
import { notify } from "@devkit-labs/notifier";

// When notification permission is denied, the library automatically:
// 1. Shows an alert dialog with the notification message
// 2. Plays a beep sound (unless silent: true)
// 3. Respects the showOnSourceTab setting

// This will show an alert with beep if permission is denied
await notify("Important Message", {
   body: "This is important information for the user",
   // If notifications are blocked, shows: "🔔 Notification\n\nImportant Message\n\nThis is important information for the user"
});

// Silent fallback (no beep sound)
await notify("Silent Alert", {
   body: "This won't make a sound even in fallback mode",
   silent: true, // No beep sound in alert fallback
});

// Respects showOnSourceTab setting
await notify("Background Alert", {
   body: "This alert only shows when user is NOT on the current tab",
   showOnSourceTab: false, // Alert fallback also respects this setting
});
```

### Error Handling

```typescript
import { notify } from "@devkit-labs/notifier";

try {
   const notification = await notify("Test Notification", {
      body: "This is a test notification",
      onerror: (error) => {
         console.error("Notification error:", error);
      },
   });

   if (notification) {
      console.log("Notification created successfully");
   } else {
      console.log("Failed to create notification");
   }
} catch (error) {
   console.error("Error creating notification:", error);
}
```

### Automatic Favicon Detection

```typescript
import { notify } from "@devkit-labs/notifier";

// No icon specified - automatically uses the page's favicon
await notify("Auto Icon", {
   body: "This notification uses the page's favicon automatically",
   // icon is automatically detected from <link rel="icon"> or /favicon.ico
});

// Custom icon overrides the automatic favicon
await notify("Custom Icon", {
   body: "This notification uses a custom icon",
   icon: "/custom-icon.png", // This overrides the automatic favicon
});

// The library tries these favicon sources in order:
// 1. <link rel="icon">
// 2. <link rel="shortcut icon">
// 3. <link rel="apple-touch-icon">
// 4. <link rel="icon" type="image/x-icon">
// 5. <link rel="icon" type="image/png">
// 6. <link rel="icon" type="image/svg+xml">
// 7. Falls back to /favicon.ico
```

## Browser Support

-  Chrome/Edge: Full support
-  Firefox: Full support
-  Safari: Full support (with some limitations on mobile)
-  Mobile browsers: Support varies by platform

## Best Practices

1. **Don't spam notifications** - Only show notifications for important events
2. **Provide meaningful content** - Use clear titles and descriptive body text
3. **Use appropriate icons** - Include relevant icons to help users identify the source
4. **Handle clicks appropriately** - Focus your app window or navigate to relevant content
5. **Respect user preferences** - Check permission status and handle denied permissions gracefully

## TypeScript

This package is written in TypeScript and includes full type definitions. No additional @types packages are needed.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
