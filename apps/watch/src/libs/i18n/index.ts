import { createInstance, i18n } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next/initReactI18next'

import { getOptions } from '../../i18n.settings'

const initI18next = async (lng: string, ns: string): Promise<i18n> => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        async (language, namespace) =>
          await import(`./locales/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lng, ns))
  return i18nInstance
}

export async function useTranslation(
  lng: string,
  ns: string,
  options: { keyPrefix?: string } = {}
): Promise<{ t: any; i18n: i18n }> {
  const i18nextInstance = await initI18next(lng, ns)
  return {
    t: i18nextInstance.getFixedT(lng, ns, options.keyPrefix),
    i18n: i18nextInstance
  }
}
