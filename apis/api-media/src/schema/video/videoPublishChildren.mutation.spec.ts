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
      publishedAt: null,
      children: [
        { id: 'c1', published: false },
        { id: 'c2', published: true },
        { id: 'c3', published: false }
      ]
    } as any)
    prismaMock.videoVariant.findMany.mockResolvedValue([])
    prismaMock.video.update.mockResolvedValue({} as any)
    prismaMock.video.updateMany.mockResolvedValue({ count: 2 } as any)

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
  })
})
