'use client'

import { TFunction, use } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import {
  initReactI18next,
  useTranslation as useTranslationOrg
} from 'react-i18next'

import { cookieName, getOptions, languages } from './settings'

const runsOnServerSide = typeof window === 'undefined'

//
void use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      async (language: string, namespace: string) =>
        // eslint-disable-next-line import/dynamic-import-chunkname
        await import(
          /* webpackIgnore: true */ `./locales/${language}/${namespace}.json`
        )
    )
  )
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator']
    },
    preload: runsOnServerSide ? languages : []
  })

export function useTranslation(
  lng: string,
  ns: string,
  options: { keyPrefix?: string } = {}
): { t: TFunction; i18n: unknown } {
  const [cookies, setCookie] = useCookies([cookieName])
  const ret = useTranslationOrg(ns, options)
  const { i18n } = ret
  if (runsOnServerSide && lng != null && i18n.resolvedLanguage !== lng) {
    void i18n.changeLanguage(lng)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (activeLng === i18n.resolvedLanguage) return
      setActiveLng(i18n.resolvedLanguage)
    }, [activeLng, i18n.resolvedLanguage])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (lng == null || i18n.resolvedLanguage === lng) return
      void i18n.changeLanguage(lng)
    }, [lng, i18n])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (cookies.i18next === lng) return
      setCookie(cookieName, lng, { path: '/' })
    }, [lng, cookies.i18next, setCookie])
  }
  return ret
}
