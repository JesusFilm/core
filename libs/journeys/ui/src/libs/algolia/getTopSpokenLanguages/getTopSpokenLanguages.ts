import { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import orderBy from 'lodash/orderBy'

import { GetCountry_country as Country } from '../../useCountryQuery/__generated__/GetCountry'

export function removeCommas(str: string): string {
  return str.replace(/,/g, '').trim()
}

interface getTopSpokenLanguagesProps {
  country?: Country | null
  availableLanguages: RefinementListItem[]
  limit?: number
}

export function getTopSpokenLanguages({
  country,
  availableLanguages,
  limit = 4
}: getTopSpokenLanguagesProps): string[] {
  if (country == null) return []

  const countryLanguages = country?.countryLanguages ?? []

  const sortedLanguages = orderBy(countryLanguages, ['speakers'], ['desc'])

  const languageNames = sortedLanguages.map(({ language }) => {
    const localName = language.name.find(({ primary }) => !primary)?.value
    const nativeName = language.name.find(({ primary }) => primary)?.value
    return localName ?? nativeName ?? ''
  })

  const topSpokenLanguages = availableLanguages
    .filter(({ value }) => languageNames.includes(removeCommas(value)))
    .sort(
      (a, b) =>
        languageNames.indexOf(removeCommas(a.value)) -
        languageNames.indexOf(removeCommas(b.value))
    )
    .slice(0, limit)
    .map(({ value }) => value)

  return topSpokenLanguages
}
