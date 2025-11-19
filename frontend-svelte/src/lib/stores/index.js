import { writable, derived } from 'svelte/store';

// Theme store
export const theme = writable('dark');

// Locale store for i18n
export const locale = writable('en');

// Example derived store
export const isDarkTheme = derived(theme, $theme => $theme === 'dark');
