import { createInstance } from 'i18next'
import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react'
// eslint-disable-next-line no-restricted-imports
import { I18nextProvider } from 'react-i18next'

import { loadJourneyLocaleResources } from './utils'

interface JourneyLocaleProviderProps {
  children: ReactNode
  locale: string
}

/**
 * JourneyI18nProvider creates a separate i18next instance for journey editing components.
 * if you find that resources are not loading, try checking the import paths in the loadJourneyLocaleResources.ts file
 */
export function JourneyLocaleProvider({
  children,
  locale
}: JourneyLocaleProviderProps): ReactElement {
  const [resources, setResources] = useState<
    Record<string, Record<string, any>>
  >({})

  // Guard against a stale locale winning the race: if `locale` changes before
  // a previous load resolves, ignore the older result so resources are never
  // committed under the wrong locale (which would fall back to English).
  useEffect(() => {
    let cancelled = false

    void loadJourneyLocaleResources(locale, (nextResources) => {
      if (!cancelled) setResources(nextResources)
    })

    return () => {
      cancelled = true
    }
  }, [locale])

  // One instance per locale, created before its resources have loaded. It must
  // not be recreated when they arrive: `useTranslation` caches the `t` it hands
  // out and only reruns on i18next events, not on a new instance arriving
  // through context, so a swapped instance would leave every consumer holding a
  // `t` bound to the empty one (react-i18next 17). Feed the same instance
  // instead, and let `bindI18nStore: added` push the update out.
  const i18nInstance = useMemo(() => {
    const namespaces = ['libs-journeys-ui', 'apps-journeys-admin']
    const instance = createInstance()

    void instance.init({
      lng: locale,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      },
      defaultNS: 'libs-journeys-ui',
      ns: namespaces,
      resources: {},
      react: {
        bindI18nStore: 'added'
      }
    })

    return instance
  }, [locale])

  // `resources` still holds the previous locale's bundles for the commit in
  // which `locale` changes, so skip anything that isn't the active locale
  // rather than pushing it into the fresh instance.
  useEffect(() => {
    Object.entries(resources).forEach(([language, namespaces]) => {
      if (language !== locale) return

      Object.entries(namespaces).forEach(([namespace, bundle]) => {
        i18nInstance.addResourceBundle(
          language,
          namespace,
          bundle,
          true, // deep
          true // overwrite
        )
      })
    })
  }, [i18nInstance, locale, resources])

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
