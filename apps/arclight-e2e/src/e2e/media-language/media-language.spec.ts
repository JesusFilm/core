import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import { getObjectDiff } from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test.fixme(
  'compare single media language between environments',
  async ({ request }) => {
    const params = createQueryParams({})

    const [baseData, compareData] = await makeParallelRequests(
      request,
      `/v2/media-languages/${testData.languageId}`,
      params
    )

    // Verify counts structure for base environment
    expect(baseData.counts).toBeDefined()
    const countFields = [
      'speakerCount',
      'countriesCount',
      'series',
      'featureFilm',
      'shortFilm'
    ]

    countFields.forEach((field) => {
      expect(baseData.counts[field]).toEqual(
        expect.objectContaining({
          value: expect.any(Number),
          description: expect.any(String)
        })
      )
    })

    // Remove counts before comparison
    const cleanedBaseData = { ...baseData, counts: undefined }
    const cleanedCompareData = { ...compareData, counts: undefined }

    const diffs = getObjectDiff(cleanedBaseData, cleanedCompareData)
    expect(
      diffs,
      `Differences found in media language ${testData.languageId}`
    ).toHaveLength(0)
  }
)
