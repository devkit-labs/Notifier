/**
 * Browser notification utility with automatic permission handling, de-duplication, unique tags, error handling and fallbacks
 */
export interface NotificationOptions {
   badge?: string;
   body?: string;
   data?: any;
   dir?: NotificationDirection;
   icon?: string;
   image?: string;
   lang?: string;
   onclick?: ((this: Notification, ev: Event) => any) | null;
   onclose?: ((this: Notification, ev: Event) => any) | null;
   onerror?: ((this: Notification, ev: Event) => any) | null;
   onshow?: ((this: Notification, ev: Event) => any) | null;
   renotify?: boolean;
   requireInteraction?: boolean;
   showOnSourceTab?: boolean; // Whether to show notification when user is on the current tab (default: true)
   silent?: boolean;
   timestamp?: number;
   title?: string;
   vibrate?: VibratePattern;
}

// Permission states
type PermissionState = "default" | "granted" | "denied";

// Main class for internal state management
class NotificationManager {
   private permissionRequested = false;
   private permissionPromise: Promise<PermissionState> | null = null;

   constructor() {
      // Auto-request permission when module is imported
      this.ensurePermission();
   }

   private generateUniqueTag(): string {
      return `notif-${Date.now()}`;
   }

   private isTabVisible(): boolean {
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

   private playBeepSound(): void {
      try {
         // Create a pleasant "task done" sound with ascending tones
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

   private showAlertFallback(
      title: string,
      options: NotificationOptions,
      showOnSourceTab: boolean
   ): void {
      // Only show alert if user is on source tab, or if showOnSourceTab is true
      if (showOnSourceTab || this.isTabVisible()) {
         // Play beep sound (unless silent option is true)
         if (!options.silent) {
            this.playBeepSound();
         }

         // Create alert message
         const message = options.body ? `${title}\n\n${options.body}` : title;
         alert(`🔔 Notification\n\n${message}`);
      }
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

      // If permission denied, return immediately
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

   async notify(
      title: string,
      options: NotificationOptions = {}
   ): Promise<Notification | null> {
      try {
         // Check if we should show notification on current tab (default: true)
         const showOnSourceTab = options.showOnSourceTab !== false;

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
            this.showAlertFallback(title, options, showOnSourceTab);

            return null;
         }

         // Create the notification with the provided options
         const notificationOptions: Partial<NotificationOptions> = {};

         if (options.badge !== undefined)
            notificationOptions.badge = options.badge;
         if (options.body !== undefined)
            notificationOptions.body = options.body;
         if (options.data !== undefined)
            notificationOptions.data = options.data;
         if (options.dir !== undefined) notificationOptions.dir = options.dir;
         if (options.icon !== undefined)
            notificationOptions.icon = options.icon;
         else {
            // Use favicon if no icon is provided
            const favicon = this.getFaviconUrl();
            if (favicon) notificationOptions.icon = favicon;
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

         // Add image if supported (not all browsers support this)
         if (options.image && "image" in Notification.prototype) {
            (notificationOptions as any).image = options.image;
         }

         // Always add a unique tag to prevent notification collisions
         (notificationOptions as any).tag = this.generateUniqueTag();

         const notification = new Notification(
            title,
            notificationOptions as NotificationOptions
         );

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

   // Get current permission status
   getPermissionStatus(): PermissionState {
      if (!("Notification" in window)) {
         return "denied";
      }
      return Notification.permission as PermissionState;
   }

   // Check if notifications are supported
   isSupported(): boolean {
      return "Notification" in window;
   }
}

// Create a singleton instance
const notificationManager = new NotificationManager();

// Export the main notify function
export const notify = (
   title: string,
   options?: NotificationOptions
): Promise<Notification | null> => {
   return notificationManager.notify(title, options);
};

// Export utility functions
export const getPermissionStatus = (): PermissionState => {
   return notificationManager.getPermissionStatus();
};

export const isNotificationSupported = (): boolean => {
   return notificationManager.isSupported();
};

// Export the NotificationManager class for advanced usage
export { NotificationManager };
