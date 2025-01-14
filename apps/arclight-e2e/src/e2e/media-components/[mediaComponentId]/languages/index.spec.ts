// import { expect, test } from '@playwright/test'
// import type { APIRequestContext } from '@playwright/test'

// import { createQueryParams, getBaseUrl } from '../../../../framework/helpers'

// interface TestCase {
//   mediaComponentId: string
//   languageId: string
//   params: Record<string, any>
// }

// const testCases = {
//   basic: {
//     mediaComponentId: '1_jf-0-0',
//     languageId: '529',
//     params: {}
//   },
//   withPlatformIos: {
//     mediaComponentId: '1_jf-0-0',
//     languageId: '529',
//     params: { platform: 'ios' }
//   },
//   withPlatformAndroid: {
//     mediaComponentId: '1_jf-0-0',
//     languageId: '529',
//     params: { platform: 'android' }
//   },
//   withPlatformWeb: {
//     mediaComponentId: '1_jf-0-0',
//     languageId: '529',
//     params: { platform: 'web' }
//   },
//   withCustomApiKey: {
//     mediaComponentId: '1_jf-0-0',
//     languageId: '529',
//     params: { apiKey: 'custom-key' }
//   },
//   withLanguageIds: {
//     mediaComponentId: '1_jf-0-0',
//     languageId: '529',
//     params: { expand: 'languageIds' }
//   },
//   withReduce: {
//     mediaComponentId: '1_jf-0-0',
//     languageId: '529',
//     params: { reduce: true }
//   },
//   withAllParams: {
//     mediaComponentId: '1_jf-0-0',
//     languageId: '529',
//     params: {
//       platform: 'web',
//       apiKey: 'custom-key',
//       expand: 'languageIds',
//       reduce: true
//     }
//   }
// }

// async function getMediaComponentLanguage(
//   request: APIRequestContext,
//   testCase: TestCase
// ) {
//   const { mediaComponentId, languageId, params } = testCase
//   const queryParams = createQueryParams(params)
//   const response = await request.get(
//     `${await getBaseUrl()}/v2/media-components/${mediaComponentId}/languages/${languageId}?${queryParams}`
//   )
//   return response
// }

// test('basic media component language request', async ({ request }) => {
//   const response = await getMediaComponentLanguage(request, testCases.basic)
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     mediaComponentId: expect.any(String),
//     languageId: expect.any(String),
//     title: expect.any(String),
//     description: expect.any(String),
//     _links: expect.any(Object)
//   })
// })

// test('media component language with iOS platform', async ({ request }) => {
//   const response = await getMediaComponentLanguage(
//     request,
//     testCases.withPlatformIos
//   )
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     mediaComponentId: expect.any(String),
//     languageId: expect.any(String),
//     title: expect.any(String),
//     description: expect.any(String),
//     _links: expect.any(Object)
//   })

//   // iOS specific checks
//   expect(data._links.download?.href).toContain('platform=ios')
// })

// test('media component language with Android platform', async ({ request }) => {
//   const response = await getMediaComponentLanguage(
//     request,
//     testCases.withPlatformAndroid
//   )
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     mediaComponentId: expect.any(String),
//     languageId: expect.any(String),
//     title: expect.any(String),
//     description: expect.any(String),
//     _links: expect.any(Object)
//   })

//   // Android specific checks
//   expect(data._links.download?.href).toContain('platform=android')
// })

// test('media component language with Web platform', async ({ request }) => {
//   const response = await getMediaComponentLanguage(
//     request,
//     testCases.withPlatformWeb
//   )
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     mediaComponentId: expect.any(String),
//     languageId: expect.any(String),
//     title: expect.any(String),
//     description: expect.any(String),
//     _links: expect.any(Object)
//   })

//   // Web specific checks
//   expect(data._links.download?.href).toContain('platform=web')
// })

// test('media component language with custom API key', async ({ request }) => {
//   const response = await getMediaComponentLanguage(
//     request,
//     testCases.withCustomApiKey
//   )
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     mediaComponentId: expect.any(String),
//     languageId: expect.any(String),
//     title: expect.any(String),
//     description: expect.any(String),
//     _links: expect.any(Object)
//   })

//   // API key specific checks
//   expect(data._links.self.href).toContain('apiKey=custom-key')
// })

// test('media component language with language IDs filter', async ({
//   request
// }) => {
//   const response = await getMediaComponentLanguage(
//     request,
//     testCases.withLanguageIds
//   )
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     mediaComponentId: expect.any(String),
//     languageId: expect.any(String),
//     title: expect.any(String),
//     description: expect.any(String),
//     _links: expect.any(Object),
//     languageIds: expect.any(Array)
//   })

//   expect(data.languageIds.length).toBeGreaterThan(0)
//   expect(
//     data.languageIds.every((id: any) => typeof id === 'string')
//   ).toBeTruthy()
// })

// test('media component language with reduce parameter', async ({ request }) => {
//   const response = await getMediaComponentLanguage(
//     request,
//     testCases.withReduce
//   )
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()

//   // Should only include basic fields
//   expect(data).toMatchObject({
//     mediaComponentId: expect.any(String),
//     languageId: expect.any(String),
//     title: expect.any(String),
//     _links: expect.any(Object)
//   })

//   // Should not include extended fields
//   expect(data).not.toHaveProperty('description')
//   expect(data).not.toHaveProperty('languageIds')
// })

// test('media component language with all parameters', async ({ request }) => {
//   const response = await getMediaComponentLanguage(
//     request,
//     testCases.withAllParams
//   )
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     mediaComponentId: expect.any(String),
//     languageId: expect.any(String),
//     title: expect.any(String),
//     _links: expect.any(Object),
//     languageIds: expect.any(Array)
//   })

//   // Check all parameters are applied
//   expect(data._links.download?.href).toContain('platform=web')
//   expect(data._links.self.href).toContain('apiKey=custom-key')
//   expect(data.languageIds.length).toBeGreaterThan(0)
//   expect(data).not.toHaveProperty('description') // reduced
// })
