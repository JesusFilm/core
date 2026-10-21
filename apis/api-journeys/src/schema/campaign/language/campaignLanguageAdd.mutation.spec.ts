import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { mockQueueAdd } from '../../../../test/bullmqMock'
import { authClient, mockUser } from '../../../../test/campaignBlockSpec'
import { campaignFactory } from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { fetchLanguage } from '../gatewayClient'
import { CAMPAIGN_LANGUAGES_MAX } from '../validation'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))
vi.mock('../gatewayClient', () => ({ fetchLanguage: vi.fn() }))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>
const mockFetchLanguage = fetchLanguage as MockedFunction<typeof fetchLanguage>

const FRENCH = '496'
const SPANISH = '21028'

function languageRows(languageIds: string[]) {
  return languageIds.map((languageId, order) => ({
    id: `campaignLanguage-${languageId}`,
    campaignId: 'campaignId',
    languageId,
    order
  }))
}

describe('campaignLanguageAdd', () => {
  const CAMPAIGN_LANGUAGE_ADD = graphql(`
    mutation CampaignLanguageAdd($campaignId: ID!, $languageId: ID!) {
      campaignLanguageAdd(campaignId: $campaignId, languageId: $languageId) {
        id
        defaultLanguageId
        languages {
          languageId
          order
        }
      }
    }
  `)

  async function add(languageId: string): Promise<any> {
    return await authClient({
      document: CAMPAIGN_LANGUAGE_ADD,
      variables: { campaignId: 'campaignId', languageId }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    mockFetchLanguage.mockResolvedValue({ id: FRENCH, bcp47: 'fr' })
    prismaMock.campaignLanguage.findMany.mockResolvedValue(
      languageRows(['529'])
    )
  })

  it('appends the language at the end of the selector order for a member', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(
      campaignFactory({ role: 'member' }).withLanguage(FRENCH).build()
    )

    const result = await add(FRENCH)

    expect(result).toEqual({
      data: {
        campaignLanguageAdd: {
          id: 'campaignId',
          defaultLanguageId: '529',
          languages: [
            { languageId: '529', order: 0 },
            { languageId: FRENCH, order: 1 }
          ]
        }
      }
    })
    expect(mockFetchLanguage).toHaveBeenCalledWith(FRENCH)
    expect(prismaMock.campaignLanguage.create).toHaveBeenCalledWith({
      data: { campaignId: 'campaignId', languageId: FRENCH, order: 1 }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'campaignId' } })
    )
    expect(mockQueueAdd).not.toHaveBeenCalled()
  })

  it('locks the language rows, then the campaign, before it re-reads the languages and appends after them', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    prismaMock.campaignLanguage.findMany.mockResolvedValue(
      languageRows(['529', SPANISH])
    )
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(
      campaignFactory({ role: 'member' }).withLanguage(FRENCH).build()
    )

    await add(FRENCH)

    const lockSql = prismaMock.$queryRaw.mock.calls.map(([strings]) =>
      (strings as unknown as readonly string[]).join('')
    )
    expect(lockSql.every((sql) => sql.includes('FOR UPDATE'))).toBe(true)
    expect(lockSql.map((sql) => sql.match(/"(\w+)"/)?.[1])).toEqual([
      'CampaignLanguage',
      'Campaign'
    ])
    expect(
      Math.max(...prismaMock.$queryRaw.mock.invocationCallOrder)
    ).toBeLessThan(
      prismaMock.campaignLanguage.findMany.mock.invocationCallOrder[0]
    )
    expect(prismaMock.campaignLanguage.findMany).toHaveBeenCalledWith({
      where: { campaignId: 'campaignId' },
      orderBy: { order: 'asc' }
    })
    expect(prismaMock.campaignLanguage.create).toHaveBeenCalledWith({
      data: { campaignId: 'campaignId', languageId: FRENCH, order: 2 }
    })
  })

  it('rejects a language a concurrent add committed after the first read (BAD_USER_INPUT, not a 500)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    prismaMock.campaignLanguage.findMany.mockResolvedValue(
      languageRows(['529', FRENCH])
    )

    const result = await add(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'languageId is already a language of this campaign',
      extensions: { code: 'BAD_USER_INPUT', field: 'languageId' }
    })
    expect(prismaMock.campaignLanguage.create).not.toHaveBeenCalled()
  })

  it(`refuses a language past ${CAMPAIGN_LANGUAGES_MAX} (BAD_USER_INPUT, field languageId)`, async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    prismaMock.campaignLanguage.findMany.mockResolvedValue(
      languageRows(
        Array.from({ length: CAMPAIGN_LANGUAGES_MAX }, (_, index) =>
          String(index + 1)
        )
      )
    )

    const result = await add(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: `a campaign has at most ${CAMPAIGN_LANGUAGES_MAX} languages`,
      extensions: { code: 'BAD_USER_INPUT', field: 'languageId' }
    })
    expect(prismaMock.campaignLanguage.create).not.toHaveBeenCalled()
  })

  it(`allows the ${CAMPAIGN_LANGUAGES_MAX}th language`, async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    prismaMock.campaignLanguage.findMany.mockResolvedValue(
      languageRows(
        Array.from({ length: CAMPAIGN_LANGUAGES_MAX - 1 }, (_, index) =>
          String(index + 1)
        )
      )
    )
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = await add(FRENCH)

    expect(result.errors).toBeUndefined()
    expect(prismaMock.campaignLanguage.create).toHaveBeenCalledWith({
      data: {
        campaignId: 'campaignId',
        languageId: FRENCH,
        order: CAMPAIGN_LANGUAGES_MAX - 1
      }
    })
  })

  it('queues every page of a published campaign, the new language’s _lang pages included', async () => {
    const campaign = campaignFactory({ role: 'member' })
      .withRegion('EUR')
      .published()
      .build()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...campaign,
      customDomains: [{ name: 'outreach.example.org' }]
    } as any)
    prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(
      campaignFactory({ role: 'member' }).withLanguage(FRENCH).build()
    )
    prismaMock.campaignLanguage.findMany
      .mockResolvedValueOnce(languageRows(['529']))
      .mockResolvedValueOnce(languageRows(['529', FRENCH]))
    mockFetchLanguage.mockImplementation(async (id) => ({
      id,
      bcp47: id === FRENCH ? 'fr' : 'en'
    }))

    await add(FRENCH)

    expect(mockQueueAdd.mock.calls.map(([, data]) => data.paths[0])).toEqual([
      '/home/campaign/outreach-2026',
      '/home/campaign/outreach-2026/eur',
      '/home/campaign/outreach-2026/_lang/en',
      '/home/campaign/outreach-2026/_lang/en/eur',
      '/home/campaign/outreach-2026/_lang/fr',
      '/home/campaign/outreach-2026/_lang/fr/eur',
      '/outreach.example.org',
      '/outreach.example.org/eur',
      '/outreach.example.org/_lang/en',
      '/outreach.example.org/_lang/en/eur',
      '/outreach.example.org/_lang/fr',
      '/outreach.example.org/_lang/fr/eur'
    ])
  })

  it('rejects a language api-languages does not know (BAD_USER_INPUT, field languageId)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    mockFetchLanguage.mockResolvedValue(null)

    const result = await add('nope')

    expect(result.errors[0]).toMatchObject({
      message: 'languageId must be an existing language',
      extensions: { code: 'BAD_USER_INPUT', field: 'languageId' }
    })
    expect(prismaMock.campaignLanguage.create).not.toHaveBeenCalled()
  })

  it('rejects the same language twice (BAD_USER_INPUT, field languageId) without a gateway call', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).withLanguage(FRENCH).build()
    )

    const result = await add(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'languageId is already a language of this campaign',
      extensions: { code: 'BAD_USER_INPUT', field: 'languageId' }
    })
    expect(mockFetchLanguage).not.toHaveBeenCalled()
    expect(prismaMock.campaignLanguage.create).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a user outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await add(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'user is not allowed to update campaign',
      extensions: expect.objectContaining({ code: 'FORBIDDEN' })
    })
    expect(prismaMock.campaignLanguage.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown campaign', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await add(FRENCH)

    expect(result.errors[0]).toMatchObject({
      message: 'campaign not found',
      extensions: expect.objectContaining({ code: 'NOT_FOUND' })
    })
  })
})
