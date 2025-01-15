// import { expect, test } from '@playwright/test'
// import type { APIRequestContext } from '@playwright/test'

// import { createQueryParams, getBaseUrl } from '../../../framework/helpers'

// interface TestCase {
//   categoryId: string
//   params: Record<string, any>
// }

// const testCases = {
//   basic: {
//     categoryId: 'types',
//     params: {}
//   },
//   withMetadataLanguage: {
//     categoryId: 'types',
//     params: { metadataLanguageTags: 'es' }
//   },
//   withCustomApiKey: {
//     categoryId: 'types',
//     params: { apiKey: 'custom-key' }
//   }
// }

// async function getTaxonomy(request: APIRequestContext, testCase: TestCase) {
//   const { categoryId, params } = testCase
//   const queryParams = createQueryParams(params)
//   const response = await request.get(
//     `${await getBaseUrl()}/v2/taxonomies/${categoryId}?${queryParams}`
//   )
//   return response
// }

// test('basic taxonomy request', async ({ request }) => {
//   const response = await getTaxonomy(request, testCases.basic)
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     categoryId: expect.any(String),
//     name: expect.any(String),
//     terms: expect.any(Array),
//     _links: expect.any(Object)
//   })

//   // Check terms structure
//   data.terms.forEach((term: any) => {
//     expect(term).toMatchObject({
//       id: expect.any(String),
//       name: expect.any(String),
//       description: expect.any(String)
//     })
//   })
// })

// test('taxonomy with metadata language', async ({ request }) => {
//   const response = await getTaxonomy(request, testCases.withMetadataLanguage)
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     categoryId: expect.any(String),
//     name: expect.any(String),
//     terms: expect.any(Array),
//     _links: expect.any(Object)
//   })

//   // Check terms are localized
//   data.terms.forEach((term: any) => {
//     expect(term).toMatchObject({
//       id: expect.any(String),
//       name: expect.any(String),
//       description: expect.any(String)
//     })
//   })
// })

// test('taxonomy with custom API key', async ({ request }) => {
//   const response = await getTaxonomy(request, testCases.withCustomApiKey)
//   expect(response.ok()).toBeTruthy()

//   const data = await response.json()
//   expect(data).toMatchObject({
//     categoryId: expect.any(String),
//     name: expect.any(String),
//     terms: expect.any(Array),
//     _links: expect.any(Object)
//   })

//   // API key specific checks
//   expect(data._links.self.href).toContain('apiKey=custom-key')
// })

// test('taxonomy returns 404 for non-existent category', async ({ request }) => {
//   const response = await getTaxonomy(request, {
//     categoryId: 'nonexistent',
//     params: {}
//   })

//   expect(response.status()).toBe(404)
//   const data = await response.json()
//   expect(data).toMatchObject({
//     message: expect.stringContaining('not found'),
//     logref: 404
//   })
// })
