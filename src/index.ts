/**
 * Browser notification utility with automatic permission handling, de-duplication, unique tags, error handling and fallbacks
 */

// Configuration types
export interface NotifierIcons {
   success?: string;
   error?: string;
   info?: string;
   warning?: string;
}

export interface NotifierConfig {
   useAlertAsFallback?: boolean; // true by default
   alertSound?: string; // path to custom alert sound
   icons?: NotifierIcons;
}

export interface NotificationOptions {
   badge?: string;
   body?: string;
   data?: any;
   dir?: NotificationDirection;
   image?: string;
   lang?: string;
   onclick?: ((this: Notification, ev: Event) => any) | null;
   onclose?: ((this: Notification, ev: Event) => any) | null;
   onerror?: ((this: Notification, ev: Event) => any) | null;
   onshow?: ((this: Notification, ev: Event) => any) | null;
   renotify?: boolean;
   requireInteraction?: boolean;
   showOnSourceTab?: boolean; // Whether to show notification when user is on the current tab (default: false)
   silent?: boolean;
   timestamp?: number;
   title?: string;
   vibrate?: VibratePattern;
}

// Permission states
type PermissionState = "default" | "granted" | "denied";

// Default icons (SVG data URIs)
const DEFAULT_ICONS: Required<NotifierIcons> = {
   success:
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
   error: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
   info: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
   warning:
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="orange"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
};

// Main class for internal state management
class NotificationManager {
   private permissionRequested = false;
   private permissionPromise: Promise<PermissionState> | null = null;
   private config: Required<NotifierConfig>;
   private initialized = false;

   constructor() {
      // Default configuration
      this.config = {
         useAlertAsFallback: true,
         alertSound: "", // will use default web audio API sound
         icons: { ...DEFAULT_ICONS },
      };
   }

   init(config?: NotifierConfig) {
      if (config) {
         this.config = {
            useAlertAsFallback: config.useAlertAsFallback ?? true,
            alertSound: config.alertSound ?? "",
            icons: {
               ...DEFAULT_ICONS,
               ...config.icons,
            },
         };
      }

      this.initialized = true;
      // Auto-request permission when initialized
      this.ensurePermission();
   }

   private generateUniqueTag(): string {
      return `notif-${Date.now()}`;
   }

   private isTabVisible() {
      return !document.hidden;
   }

   private getFaviconUrl(): string | null {
      // Try to find favicon link elements in order of preference
      const faviconSelectors = [
         'link[rel="icon"]',
         'link[rel="shortcut icon"]',
         'link[rel="apple-touch-icon"]',
         'link[rel="icon"][type="image/x-icon"]',
         'link[rel="icon"][type="image/png"]',
         'link[rel="icon"][type="image/svg+xml"]',
      ];

      for (const selector of faviconSelectors) {
         const favicon = document.querySelector(selector) as HTMLLinkElement;
         if (favicon?.href) {
            return favicon.href;
         }
      }

      // Fallback to default favicon.ico if no link elements found
      const origin = window.location.origin;
      return `${origin}/favicon.ico`;
   }

   private async playBeepSound(): Promise<void> {
      try {
         // If custom alert sound is provided, try to play it
         if (this.config.alertSound) {
            const audio = new Audio(this.config.alertSound);
            await audio.play();
            return;
         }

         // Fallback to Web Audio API generated sound
         const audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();

         // Create multiple tones for a pleasant completion sound
         const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - major triad
         const duration = 0.15; // Shorter duration per note

         frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscillator.type = "sine"; // Smoother sound than default square wave

            // Start each note slightly after the previous one
            const startTime = audioContext.currentTime + index * 0.1;
            const endTime = startTime + duration;

            // Smooth volume envelope
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

            oscillator.start(startTime);
            oscillator.stop(endTime);
         });
      } catch (error) {
         // Fallback: try to play system beep (may not work in all browsers)
         console.warn("Could not play beep sound:", error);
         try {
            // Some browsers support this
            (window as any).speechSynthesis?.speak(
               new SpeechSynthesisUtterance("")
            );
         } catch (fallbackError) {
            console.warn("Beep sound fallback also failed:", fallbackError);
         }
      }
   }

   private showAlertFallback(title: string, options: NotificationOptions) {
      // Only show alert if configured to use alert as fallback
      if (!this.config.useAlertAsFallback) {
         return;
      }

      // Play beep sound (unless silent option is true)
      if (!options.silent) {
         this.playBeepSound();
      }

      // Create alert message
      const message = options.body ? `${title}\n\n${options.body}` : title;
      alert(`🔔 Notification\n\n${message}`);
   }

   private async ensurePermission(): Promise<PermissionState> {
      // Check if notifications are supported
      if (!("Notification" in window)) {
         console.warn("This browser does not support notifications");
         return "denied";
      }

      // If permission already granted, return immediately
      if (Notification.permission === "granted") {
         return "granted";
      }

      // If permission denied, return
      if (Notification.permission === "denied") {
         return "denied";
      }

      // If we haven't requested permission yet, or we're already in the process
      if (!this.permissionRequested || this.permissionPromise) {
         this.permissionRequested = true;

         if (!this.permissionPromise) {
            this.permissionPromise = Notification.requestPermission();
         }

         const permission = await this.permissionPromise;

         return permission;
      }

      return Notification.permission as PermissionState;
   }

   async triggerNotification(
      title: string,
      options: NotificationOptions = {},
      icon?: string
   ): Promise<Notification | null> {
      // Ensure notifier is initialized
      if (!this.initialized) {
         this.init();
      }

      try {
         // Check if we should show notification on current tab (default: false)
         const showOnSourceTab =
            options.showOnSourceTab !== undefined
               ? options.showOnSourceTab
               : false;

         // If user is on current tab and showOnSourceTab is false, don't show notification
         if (!showOnSourceTab && this.isTabVisible()) {
            console.log(
               "Notification suppressed: User is on current tab and showOnSourceTab is false"
            );
            return null;
         }

         // Ensure we have permission before creating notification
         const permission = await this.ensurePermission();

         if (permission !== "granted") {
            console.warn("Notification permission not granted");

            // Show alert fallback when permission is denied
            this.showAlertFallback(title, options);

            return null;
         }

         // Create the notification with the provided options
         const notificationOptions: any = {};

         if (options.badge !== undefined)
            notificationOptions.badge = options.badge;
         if (options.body !== undefined)
            notificationOptions.body = options.body;
         if (options.data !== undefined)
            notificationOptions.data = options.data;
         if (options.dir !== undefined) notificationOptions.dir = options.dir;

         // Set icon - use provided icon parameter (from config) or auto-detect favicon
         if (icon) {
            notificationOptions.icon = icon;
         } else {
            // Use favicon if no configured icon is provided
            const favicon = this.getFaviconUrl();
            if (favicon) notificationOptions.icon = favicon;
         }

         if (options.image && "image" in Notification.prototype) {
            notificationOptions.image = options.image;
         }
         if (options.lang !== undefined)
            notificationOptions.lang = options.lang;
         if (options.renotify !== undefined)
            notificationOptions.renotify = options.renotify;
         if (options.requireInteraction !== undefined)
            notificationOptions.requireInteraction = options.requireInteraction;
         if (options.silent !== undefined)
            notificationOptions.silent = options.silent;
         if (options.timestamp !== undefined)
            notificationOptions.timestamp = options.timestamp;
         if (options.vibrate !== undefined)
            notificationOptions.vibrate = options.vibrate;

         // Always generate a unique tag to prevent notification collisions
         notificationOptions.tag = this.generateUniqueTag();

         const notification = new Notification(title, notificationOptions);

         // Attach event handlers if provided
         if (options.onclick) {
            notification.onclick = options.onclick;
         }
         if (options.onclose) {
            notification.onclose = options.onclose;
         }
         if (options.onerror) {
            notification.onerror = options.onerror;
         }
         if (options.onshow) {
            notification.onshow = options.onshow;
         }

         return notification;
      } catch (error) {
         console.error("Failed to create notification:", error);
         return null;
      }
   }

   // Typed notification methods
   async success(
      title: string,
      options: NotificationOptions = {}
   ): Promise<Notification | null> {
      return this.triggerNotification(
         title,
         options,
         this.config.icons.success
      );
   }

   async error(
      title: string,
      options: NotificationOptions = {}
   ): Promise<Notification | null> {
      return this.triggerNotification(title, options, this.config.icons.error);
   }

   async info(
      title: string,
      options: NotificationOptions = {}
   ): Promise<Notification | null> {
      return this.triggerNotification(title, options, this.config.icons.info);
   }

   async warning(
      title: string,
      options: NotificationOptions = {}
   ): Promise<Notification | null> {
      return this.triggerNotification(
         title,
         options,
         this.config.icons.warning
      );
   }

   async message(
      title: string,
      options: NotificationOptions = {}
   ): Promise<Notification | null> {
      // Use favicon for message notifications (no configured icon)
      return this.triggerNotification(title, options);
   }

   // Get current permission status
   getPermissionStatus(): PermissionState {
      if (!("Notification" in window)) {
         return "denied";
      }
      return Notification.permission as PermissionState;
   }

   // Check if notifications are supported
   isSupported() {
      return "Notification" in window;
   }
}

// Create a singleton instance
const notificationManager = new NotificationManager();

// Export the notifier object for configuration and management
export const notifier = {
   init: (config?: NotifierConfig) => notificationManager.init(config),
};

// Export the notify object for triggering notifications
export const notify = {
   success: (title: string, options?: NotificationOptions) => {
      notificationManager.success(title, options).catch((error) => {
         console.warn("Notification failed:", error);
      });
   },
   error: (title: string, options?: NotificationOptions) => {
      notificationManager.error(title, options).catch((error) => {
         console.warn("Notification failed:", error);
      });
   },
   info: (title: string, options?: NotificationOptions) => {
      notificationManager.info(title, options).catch((error) => {
         console.warn("Notification failed:", error);
      });
   },
   warning: (title: string, options?: NotificationOptions) => {
      notificationManager.warning(title, options).catch((error) => {
         console.warn("Notification failed:", error);
      });
   },
   message: (title: string, options?: NotificationOptions) => {
      notificationManager.message(title, options).catch((error) => {
         console.warn("Notification failed:", error);
      });
   },
};

// Export utility functions
export const getPermissionStatus = (): PermissionState => {
   return notificationManager.getPermissionStatus();
};

export const isNotificationSupported = () => {
   return notificationManager.isSupported();
};

// Export the NotificationManager class for advanced usage
export { NotificationManager };
