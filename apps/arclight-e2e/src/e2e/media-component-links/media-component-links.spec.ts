import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/media-component-utils'
import { apiKey, mediaComponentLinks } from '../../utils/testData.json'

test('compare media component links between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'

  const queryParams = new URLSearchParams({
    apiKey,
    ids: mediaComponentLinks.join(',')
  })

  const baseRequestUrl = `${baseUrl}/v2/media-component-links?${queryParams}`
  const compareRequestUrl = `${compareUrl}/v2/media-component-links?${queryParams}`

  const [baseResponse, compareResponse] = await Promise.all([
    request.get(baseRequestUrl),
    request.get(compareRequestUrl)
  ])

  expect(await baseResponse.ok()).toBe(true)
  expect(await compareResponse.ok()).toBe(true)

  const baseData = await baseResponse.json()
  const compareData = await compareResponse.json()

  expect(baseData._embedded.mediaComponentsLinks).toBeDefined()
  expect(compareData._embedded.mediaComponentsLinks).toBeDefined()

  // Sort because the order does not matter
  const sortContainedBy = (mediaComponentLinks: any) => {
    mediaComponentLinks.forEach((link: any) => {
      if (link.linkedMediaComponentIds?.containedBy) {
        link.linkedMediaComponentIds.containedBy.sort()
      }
    })
    return mediaComponentLinks
  }

  const baseMediaComponentLinks = convertArrayToObject(
    sortContainedBy(baseData._embedded.mediaComponentsLinks),
    'mediaComponentId'
  )
  const compareMediaComponentLinks = convertArrayToObject(
    sortContainedBy(compareData._embedded.mediaComponentsLinks),
    'mediaComponentId'
  )

  const diffs = getObjectDiff(
    baseMediaComponentLinks,
    compareMediaComponentLinks
  )

  expect(diffs).toHaveLength(0)
})
