import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'

const authClient = getClient({
  headers: {
    authorization: 'token'
  },
  context: {
    currentRoles: ['publisher']
  }
})

describe('videoPublishChildren', () => {
  const VIDEO_PUBLISH_CHILDREN = graphql(`
    mutation VideoPublishChildren($id: ID!) {
      videoPublishChildren(id: $id) {
        parentId
        publishedChildrenCount
        publishedChildIds
      }
    }
  `)

  it('publishes parent and all unpublished children, returns counts', async () => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'userId',
      roles: ['publisher'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    prismaMock.video.findUnique.mockResolvedValue({
      id: 'parent',
      label: 'collection',
      publishedAt: null,
      children: [
        { id: 'c1', published: false },
        { id: 'c2', published: true },
        { id: 'c3', published: false }
      ]
    } as any)
    prismaMock.videoVariant.findMany
      .mockResolvedValueOnce([{ id: 'pv1' }] as any)
      .mockResolvedValueOnce([])
    prismaMock.video.update.mockResolvedValue({} as any)
    prismaMock.video.updateMany.mockResolvedValue({ count: 2 } as any)
    prismaMock.videoVariant.updateMany.mockResolvedValue({ count: 1 } as any)
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback(prismaMock)
    )

    const res = await authClient({
      document: VIDEO_PUBLISH_CHILDREN,
      variables: { id: 'parent' }
    })

    expect(res).toHaveProperty('data.videoPublishChildren.parentId', 'parent')
    expect(res).toHaveProperty(
      'data.videoPublishChildren.publishedChildrenCount',
      2
    )
    expect(
      (res as any).data.videoPublishChildren.publishedChildIds.sort()
    ).toEqual(['c1', 'c3'])
    expect(prismaMock.videoVariant.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['pv1'] } },
      data: { published: true }
    })
  })

  it('does not create empty parent variants for feature films', async () => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'userId',
      roles: ['publisher'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    prismaMock.video.findUnique.mockResolvedValue({
      id: 'parent',
      label: 'featureFilm',
      publishedAt: null,
      children: [{ id: 'c1', published: false }]
    } as any)
    prismaMock.videoVariant.findMany.mockResolvedValue([] as any)
    prismaMock.video.update.mockResolvedValue({} as any)
    prismaMock.video.updateMany.mockResolvedValue({ count: 1 } as any)
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback(prismaMock)
    )

    await authClient({
      document: VIDEO_PUBLISH_CHILDREN,
      variables: { id: 'parent' }
    })

    expect(prismaMock.videoVariant.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
      where: { videoId: 'parent', published: false },
      select: { id: true }
    })
  })
})
