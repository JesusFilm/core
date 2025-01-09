export interface ImageUrls {
  thumbnail?: string
  videoStill?: string
  mobileCinematicHigh?: string
  mobileCinematicLow?: string
  mobileCinematicVeryLow?: string
}

export interface MediaComponent {
  mediaComponentId: string
  componentType: string
  subType: string
  contentType: string
  imageUrls: ImageUrls
  [key: string]: any
}

export interface ApiResponse<T = any> {
  _embedded: {
    [key: string]: T[]
  }
}

export interface CountResponse {
  value: number
  description: string
}

export interface MediaLanguageCounts {
  speakerCount: CountResponse
  countriesCount: CountResponse
  series: CountResponse
  featureFilm: CountResponse
  shortFilm: CountResponse
}

export interface MediaCountryCounts {
  languageCount: CountResponse
  languageHavingMediaCount: CountResponse
}

export interface Links {
  self: {
    href: string
  }
}

export interface BaseEntity {
  _links?: Links
}

export interface MediaCountry extends BaseEntity {
  countryId: string
  name: string
  continentName: string
  metadataLanguageTag: string
  longitude: number
  latitude: number
  counts?: MediaCountryCounts
}

export interface MediaLanguage extends BaseEntity {
  languageId: number
  iso3: string
  bcp47: string
  primaryCountryId: string
  name: string
  nameNative: string
  metadataLanguageTag: string
  counts?: MediaLanguageCounts
}
