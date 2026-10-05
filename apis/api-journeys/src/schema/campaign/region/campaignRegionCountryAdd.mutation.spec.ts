import { type MockedFunction, vi } from 'vitest'

import {
  authClient,
  setupCampaignBlockSpec
} from '../../../../test/campaignBlockSpec'
import {
  CampaignFixture,
  campaignFactory
} from '../../../../test/campaignFactory'
import { campaignRegionWithAcl } from '../../../../test/campaignRegionFactory'
import { prismaMock } from '../../../../test/prismaMock'
import { graphql } from '../../../lib/graphql/subgraphGraphql'
import { fetchCountry } from '../gatewayClient'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('../gatewayClient', () => ({ fetchCountry: vi.fn() }))

const mockFetchCountry = fetchCountry as MockedFunction<typeof fetchCountry>

function countryRow(countryId: string, order: number) {
  return {
    id: `eurCountry-${countryId}`,
    regionId: 'eurRegionId',
    countryId,
    order
  }
}

describe('campaignRegionCountryAdd', () => {
  const ADD = graphql(`
    mutation CampaignRegionCountryAdd($regionId: ID!, $countryId: ID!) {
      campaignRegionCountryAdd(regionId: $regionId, countryId: $countryId) {
        id
        regionId
        countryId
        order
        country {
          id
        }
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    setupCampaignBlockSpec()
    fixture = campaignFactory().withRegion('EUR').build()
    mockFetchCountry.mockResolvedValue({ id: 'FR' })
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(fixture, 'eurRegionId')
    )
    prismaMock.campaignRegionCountry.findMany.mockResolvedValue([
      countryRow('DE', 0)
    ])
    prismaMock.campaignRegionCountry.create.mockImplementation((async ({
      data
    }: any) => ({ id: 'newCountryRowId', ...data })) as never)
  })

  async function add(countryId: string): Promise<any> {
    return await authClient({
      document: ADD,
      variables: { regionId: 'eurRegionId', countryId }
    })
  }

  it('appends an existing api-languages country as a federation reference', async () => {
    const result = await add('FR')

    expect(result).toEqual({
      data: {
        campaignRegionCountryAdd: {
          id: 'newCountryRowId',
          regionId: 'eurRegionId',
          countryId: 'FR',
          order: 1,
          country: { id: 'FR' }
        }
      }
    })
    expect(mockFetchCountry).toHaveBeenCalledWith('FR')
    expect(prismaMock.campaignRegionCountry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { regionId: 'eurRegionId', countryId: 'FR', order: 1 }
      })
    )
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('rejects a country api-languages does not know (BAD_USER_INPUT, field countryId)', async () => {
    mockFetchCountry.mockResolvedValue(null)

    const result = await add('XX')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'countryId'
    })
    expect(prismaMock.campaignRegionCountry.create).not.toHaveBeenCalled()
  })

  it('rejects the same country twice (BAD_USER_INPUT, field countryId)', async () => {
    const result = await add('DE')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'countryId'
    })
    expect(mockFetchCountry).not.toHaveBeenCalled()
    expect(prismaMock.campaignRegionCountry.create).not.toHaveBeenCalled()
  })

  it('caps a region at 250 countries (BAD_USER_INPUT, field countryId)', async () => {
    prismaMock.campaignRegionCountry.findMany.mockResolvedValue(
      Array.from({ length: 250 }, (_, index) => countryRow(`C${index}`, index))
    )

    const result = await add('FR')

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'countryId'
    })
    expect(prismaMock.campaignRegionCountry.create).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId'
      )
    )

    const result = await add('FR')

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('throws NOT_FOUND for an unknown region', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(null)

    const result = await add('FR')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
