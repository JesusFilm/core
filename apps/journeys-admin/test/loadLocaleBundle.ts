// eslint-disable-next-line @nx/enforce-module-boundaries
import deTranslations from '../../../libs/locales/de-DE/apps-journeys-admin.json'
// eslint-disable-next-line @nx/enforce-module-boundaries
import neTranslations from '../../../libs/locales/ne-NP/apps-journeys-admin.json'

import i18n from './i18n'

const bundles = {
  de: deTranslations,
  ne: neTranslations
}

// Adds a non-English locale's real translation resources to the shared test
// i18next instance, for tests asserting on actual translated output (e.g.
// interpolation regressions) rather than the English fallback loaded by
// default in `test/i18n.ts`.
export function loadLocaleBundle(locale: keyof typeof bundles): void {
  i18n.addResourceBundle(
    locale,
    'apps-journeys-admin',
    bundles[locale],
    true,
    true
  )
}
