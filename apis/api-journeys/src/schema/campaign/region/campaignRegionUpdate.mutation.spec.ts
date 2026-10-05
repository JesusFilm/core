import { Prisma } from '@core/prisma/journeys/client'

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

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

describe('campaignRegionUpdate', () => {
  const UPDATE = graphql(`
    mutation CampaignRegionUpdate(
      $id: ID!
      $input: CampaignRegionUpdateInput!
    ) {
      campaignRegionUpdate(id: $id, input: $input) {
        id
        name
        slug
        listed
      }
    }
  `)

  let fixture: CampaignFixture

  beforeEach(() => {
    setupCampaignBlockSpec()
    fixture = campaignFactory().withRegion('EUR').withRegion('AFR').build()
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(fixture, 'eurRegionId')
    )
    prismaMock.campaignRegion.findFirst.mockResolvedValue(null)
    prismaMock.journey.findFirst.mockResolvedValue(null)
    prismaMock.campaignRegion.update.mockImplementation((async ({
      where,
      data
    }: any) => ({
      ...fixture.regions.find((region) => region.id === where.id),
      ...data
    })) as never)
  })

  async function update(
    input: { name?: string; slug?: string; listed?: boolean },
    id = 'eurRegionId'
  ): Promise<any> {
    return await authClient({ document: UPDATE, variables: { id, input } })
  }

  it('renames the region in the default language and leaves the slug alone', async () => {
    const result = await update({ name: '  Europe  ' })

    expect(result).toEqual({
      data: {
        campaignRegionUpdate: {
          id: 'eurRegionId',
          name: 'Europe',
          slug: 'eur',
          listed: true
        }
      }
    })
    expect(prismaMock.campaignRegion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'eurRegionId' },
        data: { name: 'Europe' }
      })
    )
    expect(prismaMock.campaign.update).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      data: { updatedAt: expect.any(Date) }
    })
  })

  it('requires a name (BAD_USER_INPUT, field name)', async () => {
    const result = await update({ name: '   ' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'name'
    })
    expect(prismaMock.campaignRegion.update).not.toHaveBeenCalled()
  })

  it('caps the name at 60 characters (BAD_USER_INPUT, field name)', async () => {
    const result = await update({ name: 'x'.repeat(61) })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'name'
    })
    expect(prismaMock.campaignRegion.update).not.toHaveBeenCalled()
  })

  it('validates an author-edited slug with the gallery rules, unique within the campaign', async () => {
    const result = await update({ slug: ' Europe West ' })

    expect(result.data.campaignRegionUpdate.slug).toBe('europe-west')
    expect(prismaMock.campaignRegion.findFirst).toHaveBeenCalledWith({
      where: {
        campaignId: 'campaignId',
        slug: 'europe-west',
        NOT: { id: 'eurRegionId' }
      },
      select: { id: true }
    })
    expect(prismaMock.journey.findFirst).toHaveBeenCalledWith({
      where: { teamId: 'teamId', slug: 'europe-west', deletedAt: null },
      select: { id: true, title: true }
    })
  })

  it.each([
    ['embed', 'the viewer’s own first path segment'],
    ['campaign', 'the campaign prefix'],
    ['template-gallery', 'the gallery prefix'],
    ['api', 'the api prefix'],
    ['admin', 'a RESERVED_SLUGS entry']
  ])('rejects the reserved slug %s (%s)', async (slug) => {
    const result = await update({ slug })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'slug'
    })
  })

  it('rejects a malformed or over-long slug (BAD_USER_INPUT, field slug)', async () => {
    expect((await update({ slug: '---' })).errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'slug'
    })
    expect(
      (await update({ slug: 'x'.repeat(201) })).errors[0].extensions
    ).toMatchObject({ code: 'BAD_USER_INPUT', field: 'slug' })
  })

  it('rejects a slug another region of the campaign already has', async () => {
    prismaMock.campaignRegion.findFirst.mockResolvedValue({
      id: 'afrRegionId'
    } as never)

    const result = await update({ slug: 'afr' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'slug'
    })
    expect(prismaMock.campaignRegion.update).not.toHaveBeenCalled()
  })

  it('rejects the slug of a journey in the campaign’s team, naming the journey', async () => {
    prismaMock.journey.findFirst.mockResolvedValue({
      id: 'journeyId',
      title: 'Christmas Europe'
    } as never)

    const result = await update({ slug: 'christmas-europe' })

    expect(result.errors[0]).toMatchObject({
      message: expect.stringContaining('Christmas Europe'),
      extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
    })
    expect(prismaMock.campaignRegion.update).not.toHaveBeenCalled()
  })

  it('maps the unique-constraint race on the slug to BAD_USER_INPUT, field slug', async () => {
    prismaMock.campaignRegion.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['campaignId', 'slug'] }
      })
    )

    const result = await update({ slug: 'lac' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'slug'
    })
  })

  it('lists and unlists as a one-field change', async () => {
    const result = await update({ listed: false })

    expect(result.data.campaignRegionUpdate.listed).toBe(false)
    expect(prismaMock.campaignRegion.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { listed: false } })
    )
  })

  it('throws FORBIDDEN for a caller outside the team', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(
      campaignRegionWithAcl(
        campaignFactory({ userId: 'someoneElse' }).withRegion('EUR').build(),
        'eurRegionId'
      )
    )

    const result = await update({ name: 'Europe' })

    expect(result.errors[0].extensions).toMatchObject({ code: 'FORBIDDEN' })
  })

  it('throws NOT_FOUND for an unknown region', async () => {
    prismaMock.campaignRegion.findUnique.mockResolvedValue(null)

    const result = await update({ name: 'Europe' }, 'missing')

    expect(result.errors[0].extensions).toMatchObject({ code: 'NOT_FOUND' })
  })
})
