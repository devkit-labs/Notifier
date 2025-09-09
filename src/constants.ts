import type { NotifierIcons } from "./types";

export const DEFAULT_ICONS: Required<NotifierIcons> = {
   success:
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%2322c55e"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/></svg>',
   error: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23ef4444"/><path d="M13 15h-2v-2h2v2zm0-4h-2V7h2v4z" fill="white"/></svg>',
   info: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%233b82f6"/><path d="M13 17h-2v-6h2v6zm0-8h-2V7h2v2z" fill="white"/></svg>',
   warning:
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="%23f59e0b"/><path d="M13 17h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="white"/></svg>',
};
