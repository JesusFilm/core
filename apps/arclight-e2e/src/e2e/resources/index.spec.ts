import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

interface TestCase {
  params: Record<string, any>
}

const testCases = {
  searchCountry: {
    params: { term: 'United' }
  },
  searchLanguage: {
    params: { term: 'English' }
  },
  searchVideo: {
    params: { term: 'Paper Hats', metadataLanguageTags: 'en' }
  },
  withCustomApiKey: {
    params: { term: 'United', apiKey: 'custom-key' }
  }
}

async function searchResources(request: APIRequestContext, testCase: TestCase) {
  const { params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/resources?${queryParams}`
  )
  return response
}

test('search returns United States in countries', async ({ request }) => {
  const response = await searchResources(request, testCases.searchCountry)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      resources: {
        mediaCountries: expect.any(Array)
      }
    }
  })

  const countries = data._embedded.resources.mediaCountries
  const usCountry = countries.find((country: any) =>
    country.name.toLowerCase().includes('united states')
  )

  expect(usCountry).toBeDefined()
  expect(usCountry).toMatchObject({
    countryId: expect.any(String),
    name: expect.stringContaining('United States'),
    _links: expect.any(Object)
  })
})

test('search returns English in languages', async ({ request }) => {
  const response = await searchResources(request, testCases.searchLanguage)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      resources: {
        mediaLanguages: expect.any(Array)
      }
    }
  })

  const languages = data._embedded.resources.mediaLanguages
  const englishLanguage = languages.find(
    (language: any) => language.languageId === '529'
  )

  expect(englishLanguage).toBeDefined()
  expect(englishLanguage).toMatchObject({
    languageId: '529',
    name: expect.stringContaining('English'),
    _links: expect.any(Object)
  })
})

test('search returns Paper Hats in videos', async ({ request }) => {
  const response = await searchResources(request, testCases.searchVideo)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      resources: {
        mediaComponents: expect.any(Array)
      }
    }
  })

  const videos = data._embedded.resources.mediaComponents
  const paperHatsVideo = videos.find((video: any) =>
    video.title.toLowerCase().includes('paper hats')
  )

  expect(paperHatsVideo).toBeDefined()
  expect(paperHatsVideo).toMatchObject({
    mediaComponentId: expect.any(String),
    title: expect.stringContaining('Paper Hats'),
    _links: expect.any(Object)
  })
})

test('search with custom API key', async ({ request }) => {
  const response = await searchResources(request, testCases.withCustomApiKey)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data).toMatchObject({
    _embedded: {
      resources: expect.any(Object)
    },
    _links: expect.any(Object)
  })

  // API key specific checks
  expect(data._links.self.href).toContain('apiKey=custom-key')
})
