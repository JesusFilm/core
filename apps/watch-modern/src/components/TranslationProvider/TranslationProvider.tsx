'use client'

import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'

import initTranslations from '../../app/i18n'

export async function TranslationsProvider({
  children,
  locale,
  namespaces,
  resources
}) {
  const i18n = createInstance()

  await initTranslations(locale, namespaces, i18n, resources)

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
