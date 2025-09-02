import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'

import { createQueryParams, getBaseUrl } from '../../framework/helpers'

interface TestCase {
  params: Record<string, any>
}

const testCases = {
  containsAndContainedBy: {
    params: { ids: ['JFM1', '10_DarkroomFaith', '10_Darkroom01Doubt'] }
  },
  urduContent: {
    params: {
      ids: ['1_jf-0-0', '2_0-ConsideringChristmas'],
      metadataLanguageTags: ['ur']
    }
  }
}

async function getMediaComponentLinks(
  request: APIRequestContext,
  testCase: TestCase
) {
  const { params } = testCase
  const queryParams = createQueryParams(params)
  const response = await request.get(
    `${await getBaseUrl()}/v2/media-component-links?${queryParams}`
  )
  return response
}

test.describe('media component links', () => {
  test('verify contains and containedBy relationships', async ({ request }) => {
    const response = await getMediaComponentLinks(
      request,
      testCases.containsAndContainedBy
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toMatchObject({
      _embedded: {
        mediaComponentsLinks: expect.any(Array)
      },
      _links: expect.any(Object)
    })

    const links = data._embedded.mediaComponentsLinks
    expect(links).toHaveLength(3)

    const jfm1 = links.find((link) => link.mediaComponentId === 'JFM1')
    expect(jfm1).toBeDefined()
    expect(jfm1.linkedMediaComponentIds.contains).toBeDefined()
    expect(jfm1.linkedMediaComponentIds.containedBy).toBeUndefined()
    expect(jfm1.linkedMediaComponentIds.contains.length).toBeGreaterThan(0)

    const darkroom = links.find(
      (link) => link.mediaComponentId === '10_DarkroomFaith'
    )
    expect(darkroom).toBeDefined()
    expect(darkroom.linkedMediaComponentIds.contains).toBeDefined()
    expect(darkroom.linkedMediaComponentIds.containedBy).toBeDefined()
    expect(
      Array.isArray(darkroom.linkedMediaComponentIds.contains)
    ).toBeTruthy()
    expect(
      Array.isArray(darkroom.linkedMediaComponentIds.containedBy)
    ).toBeTruthy()
    expect(darkroom.linkedMediaComponentIds.contains.length).toBe(17)
    expect(darkroom.linkedMediaComponentIds.containedBy.length).toBe(2)
    expect(darkroom.linkedMediaComponentIds.contains).toContain(
      '10_Darkroom01Doubt'
    )
    expect(darkroom.linkedMediaComponentIds.containedBy).toContain('JFM1')

    const darkroomDoubt = links.find(
      (link) => link.mediaComponentId === '10_Darkroom01Doubt'
    )
    expect(darkroomDoubt).toBeDefined()
    expect(darkroomDoubt.linkedMediaComponentIds.containedBy).toBeDefined()
    expect(
      Array.isArray(darkroomDoubt.linkedMediaComponentIds.containedBy)
    ).toBeTruthy()
    expect(darkroomDoubt.linkedMediaComponentIds.containedBy.length).toBe(1)
    expect(darkroomDoubt.linkedMediaComponentIds.contains).toBeUndefined()
    expect(darkroomDoubt.linkedMediaComponentIds.containedBy).toContain(
      '10_DarkroomFaith'
    )
  })

  // TODO: Waiting on crowdin translations in stage
  test.fixme('verify Urdu content filtering', async ({ request }) => {
    const response = await getMediaComponentLinks(
      request,
      testCases.urduContent
    )
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const links = data._embedded.mediaComponentsLinks

    // Should only return JF content for Urdu
    expect(links).toHaveLength(1)
    expect(links[0].mediaComponentId).toBe('1_jf-0-0')
  })
})
