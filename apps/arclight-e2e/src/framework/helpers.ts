import { expect } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { testData } from '../utils/testData'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

export async function getBaseUrl(): Promise<string> {
  const baseUrl = process.env.DEPLOYMENT_URL?.toString()
  if (baseUrl == null || baseUrl === '') {
    throw new Error('baseUrl was not provided via environment variable')
  }
  return baseUrl
}

export const COMPARE_URL = 'https://api.arclight.org'

export async function makeParallelRequests(
  request: APIRequestContext,
  path: string,
  params: URLSearchParams
): Promise<[any, any]> {
  const baseUrl = await getBaseUrl()

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(`${baseUrl}${path}?${params}`),
    request.get(`${COMPARE_URL}${path}?${params}`)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  return Promise.all([baseResponse.json(), compareResponse.json()])
}

export function createQueryParams(
  params: Record<string, string | string[] | undefined>
): URLSearchParams {
  const queryParams = new URLSearchParams()
  queryParams.append('apiKey', testData.apiKey)

  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      if (Array.isArray(value)) {
        queryParams.append(key, value.join(','))
      } else {
        queryParams.append(key, value)
      }
    }
  })

  return queryParams
}

export function cleanResponse<T extends Record<string, any>>(
  data: T,
  fieldsToRemove: string[] = []
): Partial<T> {
  const cleanedData = { ...data }
  fieldsToRemove.forEach((field) => {
    delete cleanedData[field]
  })
  return cleanedData
}

export function cleanStreamingUrls(data: any): void {
  if (data.streamingUrls?.m3u8?.[0]?.url) {
    data.streamingUrls.m3u8[0].url =
      data.streamingUrls.m3u8[0].url.split('?')[0]
  }
}

export function cleanShareUrl(data: any): void {
  if (data.shareUrl) {
    data.shareUrl = data.shareUrl.split('?')[0]
  }
}

export function cleanDownloadUrls(data: any): void {
  if (data.downloadUrls?.low?.url) {
    data.downloadUrls.low.url = data.downloadUrls.low.url.split('?')[0]
  }
  if (data.downloadUrls?.high?.url) {
    data.downloadUrls.high.url = data.downloadUrls.high.url.split('?')[0]
  }
}
