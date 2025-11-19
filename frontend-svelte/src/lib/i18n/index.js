import { writable, derived } from 'svelte/store';

// Current locale
export const locale = writable('en');

// Translation data - you'll expand this from your React i18n files
const translations = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      consulting: 'Consulting',
      contact: 'Contact'
    },
    home: {
      title: 'AI Consulting Portfolio',
      subtitle: 'Building intelligent solutions for complex problems'
    },
    // Add more translations...
  },
  es: {
    nav: {
      home: 'Inicio',
      about: 'Sobre Mi',
      projects: 'Proyectos',
      consulting: 'Consultoria',
      contact: 'Contacto'
    },
    home: {
      title: 'Portfolio de Consultoria IA',
      subtitle: 'Construyendo soluciones inteligentes para problemas complejos'
    },
    // Add more translations...
  }
};

// Translation function as a derived store
export const t = derived(locale, $locale => {
  return (key) => {
    const keys = key.split('.');
    let value = translations[$locale];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return value || key;
  };
});

// Helper to change locale
export function setLocale(newLocale) {
  locale.set(newLocale);
}
