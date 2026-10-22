import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { authClient, mockUser } from '../../../../test/campaignBlockSetup'
import { campaignFactory } from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const FRENCH = '496'
const SPANISH = '21028'

describe('campaignTranslations', () => {
  const CAMPAIGN_TRANSLATIONS = graphql(`
    query CampaignTranslations(
      $campaignId: ID!
      $languageId: ID!
      $filter: CampaignTranslationFilter
    ) {
      campaignTranslations(
        campaignId: $campaignId
        languageId: $languageId
        filter: $filter
      ) {
        group
        field
        maxLength
        defaultValue
        value
        source
        needsReview
        target {
          typename
          blockId
          regionId
          stringId
          campaignId
        }
      }
    }
  `)

  async function translations(
    variables: {
      languageId?: string
      filter?: string
      campaignId?: string
    } = {}
  ): Promise<any> {
    return await authClient({
      document: CAMPAIGN_TRANSLATIONS,
      variables: { campaignId: 'campaignId', languageId: FRENCH, ...variables }
    })
  }

  const fixture = campaignFactory({ role: 'member' })
    .withLanguage(FRENCH)
    .withLanguage(SPANISH)
    .withRegion('Europe')
    .build()
  const hero = fixture.blocks.find((block) => block.id === 'heroId')!
  const region = fixture.regions[0]

  function build(): typeof fixture {
    return {
      ...fixture,
      titleTranslations: {
        [FRENCH]: { value: 'Campagne 2026', source: 'human' }
      },
      blocks: [
        ...fixture.blocks.map((block) => {
          if (block.id === hero.id)
            return {
              ...block,
              titleTranslations: {
                [FRENCH]: {
                  value: "Partagez l'histoire",
                  source: 'machine',
                  uncertain: true
                },
                [SPANISH]: { value: 'Comparte la historia', source: 'human' }
              },
              descriptionTranslations: {
                [FRENCH]: { value: 'Choisissez', source: 'human' }
              }
            }
          return block
        }),
        {
          ...hero,
          id: 'regionLineId',
          typename: 'CampaignTypographyBlock',
          pageId: null,
          regionId: region.id,
          parentOrder: 0,
          eyebrow: null,
          title: null,
          description: null,
          content: 'EUR'
        }
      ],
      strings: fixture.strings.map((string) =>
        string.key === 'copy'
          ? {
              ...string,
              valueTranslations: {
                [FRENCH]: { value: 'Copier le lien', source: 'machine' }
              }
            }
          : string
      ),
      regions: [
        {
          ...region,
          nameTranslations: {
            [FRENCH]: { value: 'Europe', source: 'machine' }
          }
        }
      ]
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.campaign.findUnique.mockResolvedValue(build())
  })

  it('returns every translatable text in the view order with the language’s entry and source', async () => {
    const result = await translations()
    const rows = result.data.campaignTranslations

    expect(
      rows.map(
        (row: any) =>
          `${row.group}:${row.target.typename}:${row.field}:${row.source}`
      )
    ).toEqual([
      'interface:Campaign:title:human',
      ...[
        'allRegions',
        'step1',
        'step2',
        'step2help',
        'step3',
        'step4',
        'copy',
        'copied',
        'downloadQr',
        'open',
        'watch',
        'openTemplate',
        'youtube',
        'totalVisitors',
        'topCountry',
        'seeAllOnWatch',
        'videos',
        'noJourneys'
      ].map(
        (key) =>
          `interface:CampaignString:value:${key === 'copy' ? 'machine' : 'null'}`
      ),
      'interface:CampaignImageBlock:alt:null',
      'interface:CampaignButtonBlock:label:null',
      'interface:CampaignButtonBlock:label:null',
      'interface:CampaignTypographyBlock:content:null',
      'interface:CampaignButtonBlock:label:null',
      'interface:CampaignButtonBlock:label:null',
      'landing:CampaignHeroBlock:eyebrow:null',
      'landing:CampaignHeroBlock:title:machine',
      'landing:CampaignHeroBlock:description:human',
      'landing:CampaignButtonBlock:label:null',
      'landing:CampaignRegionSwitcherBlock:title:null',
      'landing:CampaignVideoCarouselBlock:eyebrow:null',
      'landing:CampaignVideoCarouselBlock:title:null',
      'landing:CampaignJourneyListBlock:eyebrow:null',
      'landing:CampaignJourneyListBlock:title:null',
      'landing:CampaignJourneyListBlock:description:null',
      'landing:CampaignAnalyticsBlock:eyebrow:null',
      'landing:CampaignAnalyticsBlock:title:null',
      'region:CampaignRegionHeaderBlock:intro:null',
      'region:CampaignRegionShareBlock:title:null',
      'region:CampaignRegionShareBlock:intro:null',
      'region:CampaignJourneyListBlock:eyebrow:null',
      'region:CampaignJourneyListBlock:title:null',
      'region:CampaignAnalyticsBlock:eyebrow:null',
      'region:CampaignAnalyticsBlock:title:null',
      'region:CampaignRegionSwitcherBlock:title:null',
      'regions:CampaignRegion:name:machine',
      'regions:CampaignTypographyBlock:content:null'
    ])
    expect(rows[0]).toEqual({
      group: 'interface',
      field: 'title',
      maxLength: 100,
      defaultValue: 'Outreach 2026',
      value: 'Campagne 2026',
      source: 'human',
      needsReview: false,
      target: {
        typename: 'Campaign',
        blockId: null,
        regionId: null,
        stringId: null,
        campaignId: 'campaignId'
      }
    })
    expect(rows.find((row: any) => row.target.blockId === 'heroId')).toEqual({
      group: 'landing',
      field: 'eyebrow',
      maxLength: 80,
      defaultValue: 'Your campaign',
      value: null,
      source: null,
      needsReview: false,
      target: {
        typename: 'CampaignHeroBlock',
        blockId: 'heroId',
        regionId: null,
        stringId: null,
        campaignId: null
      }
    })
    expect(
      rows.find(
        (row: any) => row.target.blockId === 'heroId' && row.field === 'title'
      )
    ).toMatchObject({
      defaultValue: 'Share the story',
      value: "Partagez l'histoire",
      source: 'machine'
    })
    expect(
      rows.find((row: any) => row.target.regionId === region.id)
    ).toMatchObject({
      group: 'regions',
      field: 'name',
      defaultValue: 'Europe',
      value: 'Europe',
      target: { typename: 'CampaignRegion', regionId: region.id }
    })
  })

  it('reads only the requested language', async () => {
    const result = await translations({ languageId: SPANISH })
    const title = result.data.campaignTranslations.find(
      (row: any) => row.target.blockId === 'heroId' && row.field === 'title'
    )

    expect(title).toMatchObject({
      value: 'Comparte la historia',
      source: 'human'
    })
  })

  it('flags only the machine lines the model was unsure of as needing review', async () => {
    const result = await translations()
    const rows = result.data.campaignTranslations
    const byKey = Object.fromEntries(
      rows.map((row: any) => [`${row.target.typename}:${row.field}`, row])
    )
    const copyId = fixture.strings.find((string) => string.key === 'copy')?.id
    const copyRow = rows.find((row: any) => row.target.stringId === copyId)

    expect(byKey['CampaignHeroBlock:title']).toMatchObject({
      source: 'machine',
      needsReview: true
    })
    expect(copyRow).toMatchObject({
      source: 'machine',
      needsReview: false
    })
    expect(byKey['Campaign:title']).toMatchObject({
      source: 'human',
      needsReview: false
    })
    expect(byKey['CampaignHeroBlock:eyebrow']).toMatchObject({
      source: null,
      needsReview: false
    })
  })

  it.each([
    ['needsReview', 'machine', 1],
    ['edited', 'human', 2],
    ['missing', null, null]
  ])('filters %s to rows whose source is %s', async (filter, source, count) => {
    const result = await translations({ filter })
    const rows = result.data.campaignTranslations

    expect(rows.length).toBeGreaterThan(0)
    expect(rows.every((row: any) => row.source === source)).toBe(true)
    if (count != null) expect(rows).toHaveLength(count)
    if (filter === 'missing')
      expect(rows.every((row: any) => row.value === null)).toBe(true)
  })

  it('treats an empty stored value as missing', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...build(),
      titleTranslations: { [FRENCH]: { value: '', source: 'human' } }
    })

    const result = await translations({ filter: 'missing' })

    expect(result.data.campaignTranslations[0]).toMatchObject({
      field: 'title',
      target: { typename: 'Campaign' },
      value: null,
      source: null
    })
  })

  it('reads the sections inside a Columns section, and their extras, in place', async () => {
    const current = build()
    const landingPageId = hero.pageId
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...current,
      blocks: [
        ...current.blocks,
        {
          ...hero,
          id: 'columnsId',
          typename: 'CampaignColumnsBlock',
          pageId: landingPageId,
          parentOrder: 99,
          eyebrow: null,
          title: null,
          description: null
        },
        {
          ...hero,
          id: 'columnId',
          typename: 'CampaignColumnBlock',
          pageId: landingPageId,
          parentBlockId: 'columnsId',
          parentOrder: 0,
          eyebrow: null,
          title: null,
          description: null
        },
        {
          ...hero,
          id: 'nestedMediaId',
          typename: 'CampaignFeaturedMediaBlock',
          pageId: landingPageId,
          parentBlockId: 'columnId',
          parentOrder: 0,
          eyebrow: null,
          title: 'Inside a column',
          description: null
        },
        {
          ...hero,
          id: 'nestedExtraId',
          typename: 'CampaignTypographyBlock',
          pageId: landingPageId,
          parentBlockId: 'nestedMediaId',
          parentOrder: 0,
          eyebrow: null,
          title: null,
          description: null,
          content: 'An extra inside the column'
        }
      ]
    } as never)

    const result = await translations()

    const landing = result.data.campaignTranslations
      .filter((row: any) => row.group === 'landing')
      .map((row: any) => `${row.target.blockId}:${row.field}`)
    expect(landing.slice(-2)).toEqual([
      'nestedMediaId:title',
      'nestedExtraId:content'
    ])
  })

  it('leaves out live blocks whose parent section was deleted', async () => {
    const current = build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...current,
      blocks: [
        ...current.blocks,
        {
          ...hero,
          id: 'orphanId',
          parentBlockId: 'deletedSectionId',
          parentOrder: 0,
          title: 'Orphaned title'
        }
      ]
    } as never)

    const result = await translations()

    expect(
      result.data.campaignTranslations.some(
        (row: any) => row.target.blockId === 'orphanId'
      )
    ).toBe(false)
    expect(
      result.data.campaignTranslations.some(
        (row: any) => row.target.blockId === 'heroId'
      )
    ).toBe(true)
  })

  it('lists the text of a section in a Column Slot, with its extras, in reading order after the Columns section', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' })
        .withLanguage(FRENCH)
        .withColumnsSection()
        .build()
    )

    const result = await translations()
    const landing = result.data.campaignTranslations
      .filter((row: any) => row.group === 'landing')
      .map((row: any) => `${row.target.blockId}:${row.field}`)

    expect(landing.slice(-5)).toEqual([
      'landingAnalyticsId:eyebrow',
      'landingAnalyticsId:title',
      'columnHeroId:title',
      'columnHeroExtraId:content',
      'columnHeroCoverId:alt'
    ])
    expect(
      result.data.campaignTranslations.find(
        (row: any) => row.target.blockId === 'columnHeroId'
      )
    ).toMatchObject({
      defaultValue: 'Column hero',
      value: null,
      source: null
    })
  })

  it('skips fields that have no default-language text', async () => {
    const result = await translations()

    expect(
      result.data.campaignTranslations.some(
        (row: any) =>
          row.target.blockId === 'regionLineId' && row.field !== 'content'
      )
    ).toBe(false)
    expect(
      result.data.campaignTranslations.some(
        (row: any) =>
          row.target.blockId === 'landingSwitcherId' && row.field === 'eyebrow'
      )
    ).toBe(false)
  })

  it('rejects the default language and languages the campaign does not have', async () => {
    for (const languageId of ['529', '1']) {
      const result = await translations({ languageId })
      expect(result.errors?.[0]?.extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'languageId'
      })
    }
  })

  it('returns NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await translations()

    expect(result.errors?.[0]?.extensions).toMatchObject({ code: 'NOT_FOUND' })
  })

  it('returns FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...build(),
      team: { ...fixture.team, userTeams: [] }
    } as never)

    const result = await translations()

    expect(result.errors?.[0]?.extensions).toMatchObject({ code: 'FORBIDDEN' })
  })
})
