// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Check if we're in browser environment
const isClient = typeof window !== 'undefined';

const i18nConfig = {
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false, // React already escapes
  },
  lng: 'en', // Default language
  resources: {
    en: {
      translation: {
        table: {
          search: 'Search',
          rowsPerPage: 'Rows per page',
          noData: 'No data available',
          export: 'Export',
          selectAll: 'Select All',
        },
      },
    },
    fr: {
      translation: {
        table: {
          search: 'Rechercher',
          rowsPerPage: 'Lignes par page',
          noData: 'Aucune donnée disponible',
          export: 'Exporter',
          selectAll: 'Tout sélectionner',
        },
      },
    },
    es: {
      translation: {
        table: {
          search: 'Buscar',
          rowsPerPage: 'Filas por página',
          noData: 'No hay datos disponibles',
          export: 'Exportar',
          selectAll: 'Seleccionar todo',
        },
      },
    },
    de: {
      translation: {
        table: {
          search: 'Suche',
          rowsPerPage: 'Zeilen pro Seite',
          noData: 'Keine Daten verfügbar',
          export: 'Exportieren',
          selectAll: 'Alle auswählen',
        },
      },
    },
  },
};

// Initialize i18n synchronously for both client and server
i18n.use(initReactI18next).init(i18nConfig);

// Add browser-specific language detection after initial sync initialization
if (isClient) {
  // Dynamically enhance with language detection on client-side
  import('i18next-browser-languagedetector').then(({ default: LanguageDetector }) => {
    try {
      i18n.use(LanguageDetector);
      // Re-initialize with detection settings
      i18n.init({
        ...i18nConfig,
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
      });
    } catch (error) {
      console.warn('Failed to add language detection:', error);
    }
  }).catch((error) => {
    console.warn('Failed to load language detection:', error);
  });
}

export default i18n;
