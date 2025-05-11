// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
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
  });

export default i18n;
