import { expect, test } from '@playwright/test'

import { getBaseUrl } from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/media-component-utils'
import testData from '../../utils/testData.json'

test('compare media component links between environments', async ({
  request
}) => {
  const baseUrl = await getBaseUrl()
  const compareUrl = 'https://api.arclight.org'
  const { apiKey } = testData

  const queryParams = new URLSearchParams({ apiKey })

  const [baseData, compareData] = await Promise.all([
    request
      .get(`${baseUrl}/v2/media-component-links?${queryParams}`)
      .then((res) => res.json()),
    request
      .get(`${compareUrl}/v2/media-component-links?${queryParams}`)
      .then((res) => res.json())
  ])

  expect(baseData._embedded.mediaComponentsLinks).toBeDefined()
  expect(compareData._embedded.mediaComponentsLinks).toBeDefined()

  // Sort because the order does not matter
  const sortContainedBy = (data: any) => {
    data._embedded.mediaComponentsLinks.forEach((link: any) => {
      if (link.linkedMediaComponentIds?.containedBy) {
        link.linkedMediaComponentIds.containedBy.sort()
      }
    })
    return data
  }

  const baseMediaComponentLinks = convertArrayToObject(
    sortContainedBy(baseData),
    'mediaComponentId'
  )
  const compareMediaComponentLinks = convertArrayToObject(
    sortContainedBy(compareData),
    'mediaComponentId'
  )

  const diffs = getObjectDiff(
    baseMediaComponentLinks,
    compareMediaComponentLinks
  )

  expect(diffs).toHaveLength(0)
})
