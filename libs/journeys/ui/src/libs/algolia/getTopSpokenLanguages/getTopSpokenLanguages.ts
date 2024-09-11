import { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import orderBy from 'lodash/orderBy'

import { GetCountry_country as Country } from '../../useCountryQuery/__generated__/GetCountry'

interface getTopSpokenLanguagesProps {
  country: Country
  availableLanguages: RefinementListItem[]
  limit?: number
}

export function getTopSpokenLanguages({
  country,
  availableLanguages,
  limit = 4
}: getTopSpokenLanguagesProps): string[] {
  const availableLanguageSet = new Set(
    availableLanguages.map((lang) => lang.value)
  )

  const countryLanguages = country?.countryLanguages ?? []

  const sortedLanguages = orderBy(countryLanguages, ['speakers'], ['desc'])

  const languageNames = sortedLanguages.map(({ language }) => {
    const localName = language.name.find(({ primary }) => !primary)?.value
    const nativeName = language.name.find(({ primary }) => primary)?.value
    return localName ?? nativeName ?? ''
  })

  const topSpokenLanguages = languageNames
    .filter(Boolean)
    .filter((language) => availableLanguageSet.has(language))
    .slice(0, limit)

  return topSpokenLanguages
}
