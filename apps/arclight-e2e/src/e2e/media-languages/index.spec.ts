import { expect, test } from '@playwright/test'

import {
  createQueryParams,
  makeParallelRequests
} from '../../framework/helpers'
import type { MediaLanguage } from '../../types'
import {
  convertArrayToObject,
  getObjectDiff
} from '../../utils/comparison-utils'
import { testData } from '../../utils/testData'

test.fixme(
  'compare media languages between environments',
  async ({ request }) => {
    const params = createQueryParams({ ids: testData.languageIds })

    const [baseData, compareData] = await makeParallelRequests(
      request,
      '/v2/media-languages',
      params
    )

    // Verify counts structure for base environment
    const countFields = [
      'speakerCount',
      'countriesCount',
      'series',
      'featureFilm',
      'shortFilm'
    ]

    for (const language of baseData._embedded.mediaLanguages) {
      expect(language.counts).toBeDefined()
      countFields.forEach((field) => {
        expect(language.counts[field]).toEqual(
          expect.objectContaining({
            value: expect.any(Number),
            description: expect.any(String)
          })
        )
      })
    }

    // Clean data before comparison
    const cleanLanguages = (languages: MediaLanguage[]) => {
      return languages.map((language) => ({ ...language, counts: undefined }))
    }

    const baseLanguages = cleanLanguages(baseData._embedded.mediaLanguages)
    const compareLanguages = cleanLanguages(
      compareData._embedded.mediaLanguages
    )

    const baseLanguageMap = convertArrayToObject(baseLanguages, 'languageId')
    const compareLanguageMap = convertArrayToObject(
      compareLanguages,
      'languageId'
    )

    const diffs = getObjectDiff(baseLanguageMap, compareLanguageMap)
    expect(diffs, 'Differences found in media languages').toHaveLength(0)
  }
)
