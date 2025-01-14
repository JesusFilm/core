import { expect, test } from '@playwright/test'

import {
  cleanDownloadUrls,
  cleanShareUrl,
  cleanStreamingUrls,
  createQueryParams,
  getBaseUrl
} from '../../framework/helpers'
import { getObjectDiff } from '../../utils/comparison-utils'

import { mockResponses, testCases } from './media-component-language.testData'

async function getMediaComponentLanguage(request: any, testCase: any) {
  const { mediaComponentId, languageId, params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryParams}`
  )
  return response
}

function cleanResponse(data: any) {
  const cleaned = { ...data }
  delete cleaned.apiSessionId
  cleanShareUrl(cleaned)
  cleanDownloadUrls(cleaned)
  cleanStreamingUrls(cleaned)
  return cleaned
}

test('basic media component language request', async ({ request }) => {
  const response = await getMediaComponentLanguage(request, testCases.basic)
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  const cleanedData = cleanResponse(data)
  const expectedData = mockResponses.basic

  const diffs = getObjectDiff(cleanedData, expectedData)
  expect(
    diffs,
    `Differences found in media component language response`
  ).toHaveLength(0)
})

test.fixme(
  'media component language with iOS platform',
  async ({ request }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withPlatformIos
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const cleanedData = cleanResponse(data)
    const expectedData = mockResponses.basic // iOS is default platform

    const diffs = getObjectDiff(cleanedData, expectedData)
    expect(diffs, `Differences found in iOS platform response`).toHaveLength(0)
  }
)

test.fixme(
  'media component language with Android platform',
  async ({ request }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withPlatformAndroid
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const cleanedData = cleanResponse(data)
    const expectedData = mockResponses.withPlatformAndroid

    const diffs = getObjectDiff(cleanedData, expectedData)
    expect(
      diffs,
      `Differences found in Android platform response`
    ).toHaveLength(0)
  }
)

test.fixme(
  'media component language with Web platform',
  async ({ request }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withPlatformWeb
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const cleanedData = cleanResponse(data)
    const expectedData = mockResponses.withPlatformWeb

    const diffs = getObjectDiff(cleanedData, expectedData)
    expect(diffs, `Differences found in Web platform response`).toHaveLength(0)
  }
)

test.fixme(
  'media component language with custom API key',
  async ({ request }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withCustomApiKey
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const cleanedData = cleanResponse(data)
    const expectedData = mockResponses.basic

    const diffs = getObjectDiff(cleanedData, expectedData)
    expect(diffs, `Differences found in custom API key response`).toHaveLength(
      0
    )
  }
)

test.fixme(
  'media component language with language IDs filter',
  async ({ request }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withLanguageIds
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const cleanedData = cleanResponse(data)
    const expectedData = mockResponses.basic

    const diffs = getObjectDiff(cleanedData, expectedData)
    expect(
      diffs,
      `Differences found in language IDs filter response`
    ).toHaveLength(0)
  }
)

test.fixme(
  'media component language with reduce parameter',
  async ({ request }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withReduce
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const cleanedData = cleanResponse(data)
    const expectedData = mockResponses.basic

    const diffs = getObjectDiff(cleanedData, expectedData)
    expect(
      diffs,
      `Differences found in reduce parameter response`
    ).toHaveLength(0)
  }
)

test.fixme(
  'media component language with all parameters',
  async ({ request }) => {
    const response = await getMediaComponentLanguage(
      request,
      testCases.withAllParams
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const cleanedData = cleanResponse(data)
    const expectedData = mockResponses.withPlatformWeb

    const diffs = getObjectDiff(cleanedData, expectedData)
    expect(diffs, `Differences found in all parameters response`).toHaveLength(
      0
    )
  }
)
