import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignBySlug', () => {
  const publicClient = getClient()

  const CAMPAIGN_BY_SLUG = graphql(`
    query CampaignBySlug($slug: String!) {
      campaignBySlug(slug: $slug) {
        id
        title
        slug
        status
        shareJourneys {
          id
        }
        templateJourneys {
          id
        }
        media {
          id
          type
          embedUrl
          muxPlaybackId
        }
      }
    }
  `)

  const journey = (
    id: string,
    overrides: Record<string, unknown> = {}
  ): Record<string, unknown> => ({
    id,
    title: id,
    slug: id,
    status: 'published',
    teamId: 'team-1',
    template: false,
    deletedAt: null,
    languageId: '529',
    ...overrides
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(null)
  })

  it('returns a published campaign with role-split, team-filtered journeys to an anonymous visitor', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1',
      title: 'World Cup',
      slug: 'world-cup',
      status: 'published',
      journeys: [
        { role: 'share', order: 0, journey: journey('share-1') },
        // Transferred to another team after being attached → dropped.
        {
          role: 'share',
          order: 1,
          journey: journey('share-other-team', { teamId: 'team-2' })
        },
        // Flagged as template after being attached as share → dropped.
        {
          role: 'share',
          order: 2,
          journey: journey('share-now-template', { template: true })
        },
        {
          role: 'template',
          order: 0,
          journey: journey('tpl-1', { template: true })
        },
        // Unflagged after being attached as template → dropped.
        { role: 'template', order: 1, journey: journey('tpl-unflagged') }
      ],
      media: {
        id: 'm1',
        type: 'link',
        embedUrl: 'https://www.youtube.com/embed/abc',
        muxVideoId: 'parked',
        muxPlaybackId: 'parked-pb',
        muxName: null,
        muxDuration: null
      }
    } as any)

    const result = await publicClient({
      document: CAMPAIGN_BY_SLUG,
      variables: { slug: 'world-cup' }
    })

    expect(result).toEqual({
      data: {
        campaignBySlug: {
          id: 'c1',
          title: 'World Cup',
          slug: 'world-cup',
          status: 'published',
          shareJourneys: [{ id: 'share-1' }],
          templateJourneys: [{ id: 'tpl-1' }],
          media: {
            id: 'm1',
            type: 'link',
            embedUrl: 'https://www.youtube.com/embed/abc',
            muxPlaybackId: null
          }
        }
      }
    })
    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'world-cup', status: 'published' }
      })
    )
  })

  it('collapses media to null when the active slot is empty', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1',
      title: 'World Cup',
      slug: 'world-cup',
      status: 'published',
      journeys: [],
      media: {
        id: 'm1',
        type: 'mux',
        embedUrl: 'https://www.youtube.com/embed/abc',
        muxVideoId: null,
        muxPlaybackId: null,
        muxName: null,
        muxDuration: null
      }
    } as any)

    const result = await publicClient({
      document: CAMPAIGN_BY_SLUG,
      variables: { slug: 'world-cup' }
    })

    expect(result).toMatchObject({
      data: { campaignBySlug: { media: null } }
    })
  })

  it('returns null for an unknown or draft slug (published-only where filter)', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(null)

    const result = await publicClient({
      document: CAMPAIGN_BY_SLUG,
      variables: { slug: 'draft-slug' }
    })

    expect(result).toEqual({ data: { campaignBySlug: null } })
    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'draft-slug', status: 'published' }
      })
    )
  })

  it('returns null without hitting the DB for a malformed or over-long slug', async () => {
    for (const slug of ['NOT VALID!!', 'a'.repeat(201)]) {
      const result = await publicClient({
        document: CAMPAIGN_BY_SLUG,
        variables: { slug }
      })
      expect(result).toEqual({ data: { campaignBySlug: null } })
    }
    expect(prismaMock.campaign.findFirst).not.toHaveBeenCalled()
  })
})
