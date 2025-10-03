export interface CountryLanguage {
  id: string
  slug?: string
  languageName: string
  englishName?: string
  nativeName?: string
}

export interface CountryLanguagesResponse {
  countryId: string
  countryName?: string
  languages: CountryLanguage[]
}

