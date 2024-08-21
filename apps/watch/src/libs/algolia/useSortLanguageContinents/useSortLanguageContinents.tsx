import { useLanguagesContinentsQuery } from '@core/journeys/ui/useLanguagesContinentsQuery'

interface LanguageContinentsRecord {
  [continent: string]: string[]
}

export function useSortLanguageContinents(): LanguageContinentsRecord {
  const { data } = useLanguagesContinentsQuery()

  const record: Record<string, string[]> = {}

  data?.languages.forEach((language) => {
    language.countryLanguages.forEach((countryLanguage) => {
      const continentId = countryLanguage.country.continent.id

      if (record[continentId] == null) {
        record[continentId] = []
      }

      record[continentId].push(language.name[0].value)
    })
  })

  return record
}
