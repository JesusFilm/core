import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../../test/campaignFactory'
import { getClient } from '../../../../test/client'
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
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

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
        [FRENCH]: { value: 'Noël 2026', source: 'human' }
      },
      blocks: [
        ...fixture.blocks.map((block) => {
          if (block.id === hero.id)
            return {
              ...block,
              titleTranslations: {
                [FRENCH]: { value: "Partagez l'histoire", source: 'machine' },
                [SPANISH]: { value: 'Comparte la historia', source: 'human' }
              },
              ledeTranslations: {
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
          lede: null,
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
        'videos'
      ].map(
        (key) =>
          `interface:CampaignString:value:${key === 'copy' ? 'machine' : 'null'}`
      ),
      'interface:CampaignButtonBlock:label:null',
      'interface:CampaignButtonBlock:label:null',
      'interface:CampaignTypographyBlock:content:null',
      'interface:CampaignButtonBlock:label:null',
      'interface:CampaignButtonBlock:label:null',
      'landing:CampaignHeroBlock:eyebrow:null',
      'landing:CampaignHeroBlock:title:machine',
      'landing:CampaignHeroBlock:lede:human',
      'landing:CampaignButtonBlock:label:null',
      'landing:CampaignRegionSwitcherBlock:title:null',
      'landing:CampaignVideoCarouselBlock:eyebrow:null',
      'landing:CampaignVideoCarouselBlock:title:null',
      'landing:CampaignJourneyListBlock:eyebrow:null',
      'landing:CampaignJourneyListBlock:title:null',
      'landing:CampaignJourneyListBlock:lede:null',
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
      defaultValue: 'Christmas 2026',
      value: 'Noël 2026',
      source: 'human',
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
      defaultValue: 'Christmas 2026',
      value: null,
      source: null,
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
      defaultValue: 'Share the story of Christmas',
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

  it.each([
    ['needsReview', 'machine', 3],
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
    })

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
    })

    const result = await translations()

    expect(result.errors?.[0]?.extensions).toMatchObject({ code: 'FORBIDDEN' })
  })
})
