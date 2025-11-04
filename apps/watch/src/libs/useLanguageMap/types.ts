export interface LanguageMapPoint {
  id: string
  languageId: string
  slug?: string
  languageName: string
  englishName?: string
  nativeName?: string
  countryId: string
  countryName?: string
  countryPopulation?: number
  latitude: number
  longitude: number
  isPrimaryCountryLanguage: boolean
}
