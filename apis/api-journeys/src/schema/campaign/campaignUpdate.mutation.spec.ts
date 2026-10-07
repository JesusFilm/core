import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignUpdate', () => {
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

  const CAMPAIGN_UPDATE = graphql(`
    mutation CampaignUpdate($id: ID!, $input: CampaignUpdateInput!) {
      campaignUpdate(id: $id, input: $input) {
        id
        title
        slug
      }
    }
  `)

  async function update(input: {
    title?: string
    slug?: string
  }): Promise<any> {
    return await authClient({
      document: CAMPAIGN_UPDATE,
      variables: { id: 'campaignId', input }
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
    prismaMock.campaign.findFirst.mockResolvedValue(null)
  })

  it('updates the title for a member and leaves the slug alone', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.update.mockResolvedValue({
      ...campaign,
      title: 'Easter 2027'
    })

    const result = await update({ title: '  Easter 2027  ' })

    expect(result).toEqual({
      data: {
        campaignUpdate: {
          id: 'campaignId',
          title: 'Easter 2027',
          slug: 'christmas-2026'
        }
      }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'campaignId' },
        data: { title: 'Easter 2027' }
      })
    )
  })

  it('validates an author-edited slug through the gallery rules and saves it', async () => {
    const campaign = campaignFactory({ role: 'manager' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.update.mockResolvedValue({
      ...campaign,
      slug: 'xmas-2026'
    })

    const result = await update({ slug: ' Xmas 2026 ' })

    expect(result.data.campaignUpdate.slug).toBe('xmas-2026')
    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith({
      where: { slug: 'xmas-2026', NOT: { id: 'campaignId' } },
      select: { id: true }
    })
    expect(prismaMock.campaign.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { slug: 'xmas-2026' } })
    )
  })

  it('requires a title (BAD_USER_INPUT, field title)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = await update({ title: '   ' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'title'
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })

  it('caps the title at 100 characters (BAD_USER_INPUT, field title)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )

    const result = await update({ title: 'x'.repeat(101) })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'title'
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })

  it.each([
    ['the pattern', '!!!'],
    ['the length', 'b'.repeat(201)],
    ['the reserved list (campaign)', 'campaign'],
    ['the reserved list (campaigns)', 'campaigns']
  ])(
    'rejects a slug failing %s (BAD_USER_INPUT, field slug)',
    async (_rule, slug) => {
      prismaMock.campaign.findUnique.mockResolvedValue(
        campaignFactory({ role: 'member' }).build()
      )

      const result = await update({ slug })

      expect(result.errors[0].extensions).toMatchObject({
        code: 'BAD_USER_INPUT',
        field: 'slug'
      })
      expect(prismaMock.campaign.update).not.toHaveBeenCalled()
    }
  )

  it('rejects a slug another campaign already uses (BAD_USER_INPUT, field slug)', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    prismaMock.campaign.findFirst.mockResolvedValue({ id: 'other' } as any)

    const result = await update({ slug: 'taken' })

    expect(result.errors[0]).toMatchObject({
      message: 'slug already in use',
      extensions: { code: 'BAD_USER_INPUT', field: 'slug' }
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })

  it('surfaces the unique-constraint race on slug as BAD_USER_INPUT, field slug', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ role: 'member' }).build()
    )
    prismaMock.campaign.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['slug'] }
      })
    )

    const result = await update({ slug: 'raced' })

    expect(result.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      field: 'slug'
    })
  })

  it('does not regenerate the slug when the title changes', async () => {
    const campaign = campaignFactory({ role: 'member' }).build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)
    prismaMock.campaign.update.mockResolvedValue({
      ...campaign,
      title: 'Completely different'
    })

    const result = await update({ title: 'Completely different' })

    expect(result.data.campaignUpdate.slug).toBe('christmas-2026')
    expect(prismaMock.campaign.findMany).not.toHaveBeenCalled()
    const { data } = prismaMock.campaign.update.mock.calls[0][0]
    expect(data).not.toHaveProperty('slug')
  })

  it('throws FORBIDDEN for a user outside the team', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(
      campaignFactory({ userId: 'someoneElse' }).build()
    )

    const result = await update({ title: 'Nope' })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update campaign',
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.campaign.update).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND for an unknown id', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(null)

    const result = await update({ title: 'Nope' })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'campaign not found',
          extensions: expect.objectContaining({ code: 'NOT_FOUND' })
        })
      ]
    })
  })
})
