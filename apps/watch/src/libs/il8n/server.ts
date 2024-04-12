import { TFunction, createInstance } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next/initReactI18next'

import { getOptions, localePathPublic } from './settings'

const initI18next = async (
  languageId: string,
  ns: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        async (language: string, namespace: string) =>
          // eslint-disable-next-line import/dynamic-import-chunkname
          await import(
            /* webpackIgnore: true */ `${localePathPublic}/${language}/${namespace}.json`
          )
      )
    )
    .init(getOptions(languageId, ns))
  return i18nInstance
}

export async function useTranslation(
  languageId: string,
  ns: string,
  options: { keyPrefix?: string } = {}
): Promise<{ t: TFunction; i18n: unknown }> {
  const i18nextInstance = await initI18next(languageId, ns)
  return {
    t: i18nextInstance.getFixedT(
      languageId,
      Array.isArray(ns) ? ns[0] : ns,
      options.keyPrefix
    ),
    i18n: i18nextInstance
  }
}
