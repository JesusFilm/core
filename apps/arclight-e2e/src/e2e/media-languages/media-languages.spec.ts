import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import testData from '../../utils/testData.json'

interface MediaLanguage {
  languageId: number
  iso3: string
  bcp47: string
  name: string
  nameNative: string | null
  counts: {
    speakerCount: { value: number; description: string }
    countriesCount: { value: number; description: string }
    series: { value: number; description: string }
    featureFilm: { value: number; description: string }
    shortFilm: { value: number; description: string }
  }
  audioPreview: {
    url: string
    audioBitrate: number
    audioContainer: string
    sizeInBytes: number
  } | null
  primaryCountryId: string
  metadataLanguageTag: string
  _links: {
    self: {
      href: string
    }
  }
}

interface MediaLanguagesResponse {
  page: number
  limit: number
  pages: number
  total: number
  _embedded: {
    mediaLanguages: MediaLanguage[]
  }
  _links: {
    self: { href: string }
    first: { href: string }
    last: { href: string }
    next?: { href: string }
    previous?: { href: string }
  }
}

test('compare media languages between environments', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const queryParams = new URLSearchParams({
    apiKey: testData.apiKey,
    limit: '5000'
  })

  const [baseData, compareData] = await Promise.all([
    request
      .get(`${baseUrl}/v2/media-languages?${queryParams}`)
      .then((res) => res.json() as Promise<MediaLanguagesResponse>),
    request
      .get(`https://api.arclight.org/v2/media-languages?${queryParams}`)
      .then((res) => res.json() as Promise<MediaLanguagesResponse>)
  ])

  const baseLanguages = baseData._embedded.mediaLanguages
  const compareLanguages = compareData._embedded.mediaLanguages

  // Log count differences
  console.log(`Base environment total: ${baseLanguages.length}`)
  console.log(`Compare environment total: ${compareLanguages.length}`)

  // Find languages that exist in base but not in compare
  const languagesOnlyInBase = baseLanguages.filter(
    (baseLanguage) =>
      !compareLanguages.some(
        (compareLanguage) =>
          compareLanguage.languageId === baseLanguage.languageId
      )
  )

  // Find languages that exist in compare but not in base
  const languagesOnlyInCompare = compareLanguages.filter(
    (compareLanguage) =>
      !baseLanguages.some(
        (baseLanguage) => baseLanguage.languageId === compareLanguage.languageId
      )
  )

  // Log differences
  if (languagesOnlyInBase.length > 0) {
    console.log('\nLanguage IDs only in base environment:')
    console.log(languagesOnlyInBase.map((lang) => lang.languageId).join(', '))
  }

  if (languagesOnlyInCompare.length > 0) {
    console.log('\nLanguage IDs only in compare environment:')
    console.log(
      languagesOnlyInCompare.map((lang) => lang.languageId).join(', ')
    )
  }

  // Compare each language that exists in both environments
  baseLanguages.forEach((baseLanguage) => {
    const compareLanguage = compareLanguages.find(
      (l) => l.languageId === baseLanguage.languageId
    )

    if (compareLanguage) {
      expect(baseLanguage.iso3).toBe(compareLanguage.iso3)
      expect(baseLanguage.bcp47).toBe(compareLanguage.bcp47)
      expect(baseLanguage.name).toBe(compareLanguage.name)
      expect(baseLanguage.counts).toEqual(compareLanguage.counts)
    }
  })
})
