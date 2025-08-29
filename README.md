# @devkit-labs/notifier

A lightweight, framework-agnostic browser notification utility with automatic permission handling, typed notification methods, de-duplication and smart fallbacks.

## Features

-  **Typed Notification Methods** - Pre-configured methods for success, error, info, warning, and general messages
-  **Simple Configuration** - Configure once with `notifier.init()`, use everywhere with `notify.*`
-  **Automatic Permission Handling** - Requests notification permission automatically when initialized
-  **Framework Agnostic** - Works with any JavaScript framework or vanilla JS
-  **Full Notification API Support** - Supports all native Notification API options
-  **Deduplication** - By default only shows notifications when user is on other tabs, can be changed
-  **Smart Tag Management** - Automatically generates unique tags to prevent notification collisions
-  **Auto Favicon Detection** - Uses the page's favicon as notification icon when none provided
-  **Smart Fallbacks** - Shows alert with beep sound when notifications are blocked
-  **TypeScript Support** - Fully typed with comprehensive interfaces
-  **Lightweight** - Minimal dependencies and small bundle size
-  **Browser Compatibility** - Works across all modern browsers

## Installation

```bash
npm install @devkit-labs/notifier
```

## Bare Minimum Setup

Get started with just 3 lines of code:

```typescript
import { notifier, notify } from "@devkit-labs/notifier";

// Initialize once at app startup (important!)
notifier.init();

// Use anywhere in your app after initialization
notify.success("Hello World!");
```

That's it! The library will:

-  ✅ Automatically request notification permission
-  ✅ Use default icons and settings
-  ✅ Fall back to alerts if notifications are blocked
-  ✅ Only show notifications when user is on other tabs (by default)

## Quick Start

```typescript
// Simple import - everything you need
import { notifier, notify } from "@devkit-labs/notifier";

// Full imports including utilities
import {
   notifier,
   notify,
   getPermissionStatus,
   isNotificationSupported,
} from "@devkit-labs/notifier";

// Configure the notifier with custom icons and settings
const notifierConfig = {
   useAlertAsFallback: true, // true by default
   alertSound: "/alert-sound.mp3",
   icons: {
      success: "/success-icon.png",
      error: "/error-icon.png",
      info: "/info-icon.png",
      warning: "/warning-icon.png",
   },
};

// Initialize with config and request notification permission
notifier.init(notifierConfig); // can be initialized without config too
// notifier.init(); uses default icons & settings

// Use typed notification methods
notify.success("Task completed!");
notify.error("Upload failed!", {
   body: "Please check your connection and try again.",
});
notify.warning("Storage almost full", {
   body: "Please free up some space.",
});
notify.info("New feature available", {
   body: "Check out our latest update.",
});
notify.message("Meeting reminder", {
   body: "Team standup starts in 5 minutes.",
}); // uses favicon
```

## ⚠️ Important: Initialize Once

**Always initialize the notifier only once in your application's entry point** (e.g., `main.js`, `index.js`, `app.js`, or close to your root component).

```typescript
// Initialize once in your main entry file
// main.js or index.js
import { notifier } from "@devkit-labs/notifier";

notifier.init({
   icons: {
      success: "/icons/success.png",
      error: "/icons/error.png",
   },
});

// Then use notify.* anywhere in your app after initialization
notify.success("Your task is complete");
```

```typescript
// Multiple initializations will overwrite each other
// file1.js
notifier.init({ alertSound: "/sound1.mp3" });

// file2.js
notifier.init({ alertSound: "/sound2.mp3" }); // Overwrites file1's config
```

## API Reference

### Configuration

#### `notifier.init(config?)`

Initialize the notifier with optional configuration. This should be called once at the start of your application.

```typescript
interface NotifierConfig {
   useAlertAsFallback?: boolean; // Show alert when notifications blocked (default: true)
   alertSound?: string; // Custom alert sound URL (optional)
   icons?: {
      success?: string;
      error?: string;
      info?: string;
      warning?: string;
   };
}

// Example configuration
notifier.init({
   useAlertAsFallback: true,
   alertSound: "/sounds/notification.mp3",
   icons: {
      success: "data:image/svg+xml,<svg>...</svg>",
      error: "/icons/error.png",
      info: "/icons/info.png",
      warning: "/icons/warning.png",
   },
});
```

### Typed Notification Methods

All notification methods follow the same pattern: `notify.{type}(title, options?)`

#### `notify.success(title, options?)`

Shows a success notification with the configured success icon.

```typescript
notify.success("Upload Complete!");
notify.success("File Saved", {
   body: "Your document has been saved successfully.",
   requireInteraction: true,
   onclick: () => window.focus(),
});
```

#### `notify.error(title, options?)`

Shows an error notification with the configured error icon.

```typescript
notify.error("Upload Failed!");
notify.error("Connection Error", {
   body: "Unable to connect to server.",
   requireInteraction: true,
});
```

#### `notify.info(title, options?)`

Shows an informational notification with the configured info icon.

```typescript
notify.info("New Feature");
notify.info("Update Available", {
   body: "Version 2.0 is now available.",
   onclick: () => window.open("/updates"),
});
```

#### `notify.warning(title, options?)`

Shows a warning notification with the configured warning icon.

```typescript
notify.warning("Low Storage");
notify.warning("Unsaved Changes", {
   body: "You have unsaved changes that will be lost.",
   requireInteraction: true,
});
```

#### `notify.message(title, options?)`

Shows a general message notification using the page's favicon (no configured icon).

```typescript
notify.message("New Message");
notify.message("Meeting Reminder", {
   body: "Daily standup starts soon.",
});
```

### NotificationOptions

All notification methods accept the same options object, most which are same as accepted by native Notification api except `showOnSourceTab`:

```typescript
interface NotificationOptions {
   badge?: string; // URL of badge image
   body?: string; // Notification body text
   data?: any; // Custom data to attach
   dir?: "auto" | "ltr" | "rtl"; // Text direction
   image?: string; // URL of notification image
   lang?: string; // Language code
   onclick?: (event: Event) => void; // Click handler
   onclose?: (event: Event) => void; // Close handler
   onerror?: (event: Event) => void; // Error handler
   onshow?: (event: Event) => void; // Show handler
   renotify?: boolean; // Whether to replace previous notifications
   requireInteraction?: boolean; // Keep notification visible until user interacts
   showOnSourceTab?: boolean; // Whether to show when user is on source tab (from where notification was triggered, In case you want to handle it using your application UI, default: true)
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
import { notifier, notify } from "@devkit-labs/notifier";

// Initialize once
notifier.init({
   icons: {
      success: "/icons/success.svg",
      error: "/icons/error.svg",
   },
});

// Use anywhere
notify.success("Task completed!");
notify.error("Something went wrong!");
```

### Rich Notifications

```typescript
notify.error("Upload Failed", {
   body: "The file could not be uploaded to the server.",
   badge: "/icons/badge.png",
   image: "/images/error-preview.jpg",
   requireInteraction: true,
   vibrate: [200, 100, 200],
   data: {
      fileId: "12345",
      fileName: "document.pdf",
   },
   onclick: () => {
      console.log("User clicked on error notification");
      window.focus();
   },
   onclose: () => {
      console.log("Error notification was closed");
   },
});
```

### Tab Visibility Control

```typescript
// By default it will only show notification if user is NOT on the current tab
notify.success("Background Task Complete", {
   body: "Your export has finished.",
   onclick: () => {
      window.focus();
      // Navigate to results page
   },
});

// Always show notification
notify.warning("Important Alert", {
   body: "This will show regardless of tab visibility.",
   showOnSourceTab: true, // Override the default (false)
});
```

### Permission Denied Fallbacks

When notification permission is denied, the library automatically:

1. Shows an alert dialog with the notification message
2. Plays a beep sound (unless `silent: true`)

```typescript
// This will show an alert with beep if permission is denied
notify.error("Critical Error", {
   body: "This is important information for the user.",
});

// Silent fallback (no beep sound)
notify.info("Silent Update", {
   body: "This won't make a sound even in fallback mode.",
   silent: true, // No beep sound in alert fallback
});
```

## Browser Support

-  Chrome/Edge: Full support
-  Firefox: Full support
-  Safari: Full support (with some limitations on mobile)
-  Mobile browsers: Support varies by platform

## Best Practices

1. **Initialize once, use everywhere** - Call `notifier.init()` only once in your main entry file (index.js, main.js, app.js). Multiple initializations will overwrite previous configurations.
2. **Use appropriate notification types** - Use `success` for completions, `error` for failures, etc.
3. **Don't spam notifications** - Only show notifications for important events that users care about
4. **Provide meaningful content** - Use clear titles and descriptive body text
5. **Handle clicks appropriately** - Focus your app window or navigate to relevant content when notifications are clicked
6. **Respect user preferences** - Check permission status and handle denied permissions gracefully
7. **Use `showOnSourceTab` wisely** - Consider whether users need to see notifications when they're already using your app
8. **Test fallback behavior** - Ensure your app works well even when notifications are blocked

## TypeScript

This package is written in TypeScript and includes full type definitions. No additional @types packages are needed.

```typescript
// All methods and options are fully typed
import {
   notifier,
   notify,
   NotifierConfig,
   NotificationOptions,
} from "@devkit-labs/notifier";

const config: NotifierConfig = {
   useAlertAsFallback: true,
   icons: {
      success: "/success.png",
   },
};

const options: NotificationOptions = {
   requireInteraction: true,
   showOnSourceTab: false,
};

notify.success("Typed!", options);
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
