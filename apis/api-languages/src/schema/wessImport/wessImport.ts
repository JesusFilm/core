import { runWessCountriesImport } from '../../scripts/wess-countries-import'
import { runWessCountryLanguagesImport } from '../../scripts/wess-country-languages-import'
import { withWessImportLock } from '../../scripts/wess-import-lock'
import { runWessLanguagesImport } from '../../scripts/wess-languages-import'
import { builder } from '../builder'

interface WessImportResultShape {
  success: boolean
  languagesImported: number
  nativeNamesImported: number
  countriesImported: number
  countryLanguagesImported: number
  message: string
}

const WessImportResult = builder
  .objectRef<WessImportResultShape>('WessImportResult')
  .implement({
    description: 'Summary of a completed WESS import run.',
    fields: (t) => ({
      success: t.exposeBoolean('success', { nullable: false }),
      languagesImported: t.exposeInt('languagesImported', { nullable: false }),
      nativeNamesImported: t.exposeInt('nativeNamesImported', {
        nullable: false,
        description:
          'Number of autonym (native-name) LanguageName rows created or updated during this run.'
      }),
      countriesImported: t.exposeInt('countriesImported', { nullable: false }),
      countryLanguagesImported: t.exposeInt('countryLanguagesImported', {
        nullable: false
      }),
      message: t.exposeString('message', { nullable: false })
    })
  })

builder.mutationFields((t) => ({
  wessImport: t.withAuth({ isPublisher: true }).field({
    type: WessImportResult,
    nullable: false,
    description:
      'Runs the WESS QueryRunner imports (languages, then countries, then ' +
      'country-languages) in the FK-safe order. Runs synchronously and can ' +
      'take several minutes; requires WESS_API_TOKEN in the server environment.',
    resolve: async () =>
      withWessImportLock(async () => {
        const { languagesImported, nativeNamesImported } =
          await runWessLanguagesImport()
        const countriesImported = await runWessCountriesImport()
        const countryLanguagesImported = await runWessCountryLanguagesImport()

        return {
          success: true,
          languagesImported,
          nativeNamesImported,
          countriesImported,
          countryLanguagesImported,
          message: `Imported ${languagesImported.toLocaleString()} language(s) (${nativeNamesImported.toLocaleString()} native name(s)), ${countriesImported.toLocaleString()} country(ies), and ${countryLanguagesImported.toLocaleString()} country-language(s).`
        }
      })
  })
}))
