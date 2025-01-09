import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'

import { expectedCountry, expectedLanguage, expectedVideo } from './testData'

test('verify country search returns United States', async ({ request }) => {
  const params = createQueryParams({ term: 'United' })

  const [baseData] = await makeParallelRequests(
    request,
    '/v2/resources',
    params
  )

  const countries = baseData._embedded.resources.mediaCountries
  const usCountry = countries.find((country) =>
    country.name.toLowerCase().includes('united states')
  )

  expect(usCountry).toBeDefined()
  expect(usCountry).toMatchObject(expectedCountry)
})

test('verify language search returns English', async ({ request }) => {
  const params = createQueryParams({ term: 'English' })

  const [baseData] = await makeParallelRequests(
    request,
    '/v2/resources',
    params
  )

  const languages = baseData._embedded.resources.mediaLanguages
  const englishLanguage = languages.find(
    (language) => language.languageId === 529
  )

  expect(englishLanguage).toBeDefined()
  expect(englishLanguage).toMatchObject(expectedLanguage)
})

// TODO: Add proper fields to Algolia to test this
test.fixme('verify video search returns Paper Hats', async ({ request }) => {
  const params = createQueryParams({
    term: 'Paper Hats',
    metadataLanguageTags: 'en'
  })

  const [baseData] = await makeParallelRequests(
    request,
    '/v2/resources',
    params
  )

  const videos = baseData._embedded.resources.mediaComponents
  const paperHatsVideo = videos.find((video) =>
    video.title.toLowerCase().includes('paper hats')
  )

  expect(paperHatsVideo).toBeDefined()
  expect(paperHatsVideo).toMatchObject(expectedVideo)
})
