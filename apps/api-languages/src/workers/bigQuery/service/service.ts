import { Logger } from 'pino'

import {
  importAudioPreviews,
  importCountries,
  importCountryLanguages,
  importCountryNames,
  importLanguageNames,
  importLanguageSlugs,
  importLanguages
} from '../importers'

export async function service(logger?: Logger): Promise<void> {
  const cleanup = [
    await importLanguages(logger),
    await importCountries(logger),
    // depends on languages
    await importLanguageNames(logger),
    await importLanguageSlugs(logger),
    await importAudioPreviews(logger),
    // depends on languages and countries
    await importCountryNames(logger),
    await importCountryLanguages(logger)
    // always run last
  ]
  cleanup.forEach((fn) => fn?.())
}
