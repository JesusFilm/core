import { type MockedFunction, vi } from 'vitest'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import {
  buildShortLink,
  buildShortLinkWithDomain
} from '../../../test/shortLinkFixtures'

import { publishLink } from './edge'

vi.mock('./edge', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./edge')>()),
  publishLink: vi.fn(),
  unpublishLink: vi.fn(),
  publishDomain: vi.fn(),
  publishDomainWithLinks: vi.fn(),
  unpublishDomain: vi.fn()
}))

const publishLinkMock = publishLink as MockedFunction<typeof publishLink>

const SHORT_LINK_BULK_UPDATE_MUTATION = graphql(`
  mutation ShortLinkBulkUpdateMutation(
    $input: MutationShortLinkBulkUpdateInput!
  ) {
    shortLinkBulkUpdate(input: $input) {
      ... on MutationShortLinkBulkUpdateSuccess {
        data {
          id
          status
          tags
        }
      }
      ... on NotFoundError {
        message
        location {
          path
          value
        }
      }
    }
  }
`)

describe('shortLinkBulkUpdate', () => {
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: { id: 'userId' } }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'testUserId',
      roles: ['shortLinkEditor'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        await callback(prismaMock)
    )
    publishLinkMock.mockResolvedValue(null)
  })

  it('pauses, retags and re-campaigns every link and republishes each', async () => {
    prismaMock.shortLink.findMany.mockResolvedValue([
      buildShortLink({ id: 'l1', tags: ['old', 'keep'] }),
      buildShortLink({ id: 'l2', tags: [] })
    ])
    prismaMock.shortLink.update
      .mockResolvedValueOnce(
        buildShortLinkWithDomain({
          id: 'l1',
          status: 'paused',
          tags: ['keep', 'new']
        })
      )
      .mockResolvedValueOnce(
        buildShortLinkWithDomain({ id: 'l2', status: 'paused', tags: ['new'] })
      )

    const result = await authClient({
      document: SHORT_LINK_BULK_UPDATE_MUTATION,
      variables: {
        input: {
          ids: ['l1', 'l2', 'l1'],
          status: 'paused',
          addTags: ['new'],
          removeTags: ['old'],
          addCampaignIds: ['c1'],
          removeCampaignIds: ['c2']
        }
      }
    })

    expect(result).toEqual({
      data: {
        shortLinkBulkUpdate: {
          data: [
            { id: 'l1', status: 'paused', tags: ['keep', 'new'] },
            { id: 'l2', status: 'paused', tags: ['new'] }
          ]
        }
      }
    })
    expect(prismaMock.shortLink.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['l1', 'l2'] }, deletedAt: null },
      select: { id: true, tags: true }
    })
    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: {
        status: 'paused',
        tags: ['keep', 'new'],
        campaigns: { connect: [{ id: 'c1' }], disconnect: [{ id: 'c2' }] }
      }
    })
    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l2' },
      data: {
        status: 'paused',
        tags: ['new'],
        campaigns: { connect: [{ id: 'c1' }], disconnect: [{ id: 'c2' }] }
      }
    })
    expect(publishLinkMock).toHaveBeenCalledTimes(2)
    expect(publishLinkMock).toHaveBeenCalledWith('l1', prismaMock)
    expect(publishLinkMock).toHaveBeenCalledWith('l2', prismaMock)
  })

  it('returns a NotFoundError listing the missing ids without writing', async () => {
    prismaMock.shortLink.findMany.mockResolvedValue([
      buildShortLink({ id: 'l1' })
    ])
    const result = await authClient({
      document: SHORT_LINK_BULK_UPDATE_MUTATION,
      variables: { input: { ids: ['l1', 'missing'], status: 'active' } }
    })
    expect(result).toEqual({
      data: {
        shortLinkBulkUpdate: {
          message: 'short link not found',
          location: [{ path: ['input', 'ids'], value: 'missing' }]
        }
      }
    })
    expect(prismaMock.shortLink.update).not.toHaveBeenCalled()
    expect(publishLinkMock).not.toHaveBeenCalled()
  })

  it('returns an empty list for no ids', async () => {
    const result = await authClient({
      document: SHORT_LINK_BULK_UPDATE_MUTATION,
      variables: { input: { ids: [] } }
    })
    expect(result).toEqual({ data: { shortLinkBulkUpdate: { data: [] } } })
    expect(prismaMock.shortLink.findMany).not.toHaveBeenCalled()
  })
})
