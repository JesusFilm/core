import { createInstance } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { I18n } from 'next-i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'

import i18nConfig from '../../i18nConfig.js'

export default async function initTranslations(
  locale: string,
  namespaces: string[],
  i18nInstance?: I18n,
  resources?: Record<string, any>
): Promise<{
  i18n: I18n
  resources: Record<string, any>
  t: (key: string) => string
}> {
  i18nInstance = i18nInstance || createInstance()

  i18nInstance.use(initReactI18next)

  if (!resources) {
    i18nInstance.use(
      resourcesToBackend(
        (language, namespace) =>
          import(
            /* webpackChunkName: "i18nConfig" */ `../../../../libs/locales/${language}/${namespace}.json`
          )
      )
    )
  }

  await i18nInstance.init({
    lng: locale,
    resources,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces[0],
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales
  })

  return {
    i18n: i18nInstance,
    resources: { [locale]: i18nInstance.services.resourceStore.data[locale] },
    t: i18nInstance.t
  }
}
