import en from './locales/en/apps-videos-admin.json'

declare module 'next-intl' {
  interface AppConfig {
    // Register your app's messages
    Messages: typeof en
    // Strictly type the locale
    Locale: 'en'
  }
}
