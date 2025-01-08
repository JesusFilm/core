import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import { apiKey } from '../../utils/testData.json'

import { expectedCountry, expectedLanguage, expectedVideo } from './testData'

test('verify country search returns United States', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const queryParams = new URLSearchParams({
    apiKey,
    term: 'United'
  })

  const response = await request.get(`${baseUrl}/v2/resources?${queryParams}`)
  expect(response.ok()).toBe(true)

  const data = await response.json()
  const countries = data._embedded.resources.mediaCountries

  const usCountry = countries.find((country) =>
    country.name.toLowerCase().includes('united states')
  )

  expect(usCountry).toBeDefined()
  expect(usCountry).toMatchObject(expectedCountry)
})

test('verify language search returns English', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const queryParams = new URLSearchParams({
    apiKey,
    term: 'English'
  })

  const response = await request.get(`${baseUrl}/v2/resources?${queryParams}`)
  expect(response.ok()).toBe(true)

  const data = await response.json()
  const languages = data._embedded.resources.mediaLanguages

  const englishLanguage = languages.find(
    (language) => language.languageId === 529
  )

  expect(englishLanguage).toBeDefined()
  expect(englishLanguage).toMatchObject(expectedLanguage)
})

// TODO: Add proper fields to Algolia to test this
test.fixme('verify video search returns Paper Hats', async ({ request }) => {
  const baseUrl = await getBaseUrl()
  const queryParams = new URLSearchParams({
    apiKey,
    term: 'Paper Hats',
    metadataLanguageTags: 'en'
  })

  const response = await request.get(`${baseUrl}/v2/resources?${queryParams}`)
  expect(response.ok()).toBe(true)

  const data = await response.json()
  const videos = data._embedded.resources.mediaComponents

  const paperHatsVideo = videos.find((video) =>
    video.title.toLowerCase().includes('paper hats')
  )

  expect(paperHatsVideo).toBeDefined()
  expect(paperHatsVideo).toMatchObject(expectedVideo)
})
