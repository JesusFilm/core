import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test.fixme(
  'compare media component links between environments',
  async ({ request }) => {
    const params = createQueryParams({ ids: testData.mediaComponentLinks })
    const [baseData, compareData] = await makeParallelRequests(
      request,
      '/v2/media-component-links',
      params
    )

    expect(baseData._embedded.mediaComponentsLinks).toBeDefined()
    expect(compareData._embedded.mediaComponentsLinks).toBeDefined()

    // Sort because the order does not matter
    const sortContainedBy = (mediaComponentLinks: any[]) => {
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
  }
)
