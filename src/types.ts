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
export type PermissionState = "default" | "granted" | "denied";