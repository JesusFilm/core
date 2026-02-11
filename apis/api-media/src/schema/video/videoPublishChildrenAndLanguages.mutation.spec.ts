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

describe('videoPublishChildrenAndLanguages', () => {
  const VIDEO_PUBLISH_CHILDREN_LANG = graphql(`
    mutation VideoPublishChildrenAndLanguages($id: ID!) {
      videoPublishChildrenAndLanguages(id: $id) {
        parentId
        publishedChildrenCount
        publishedChildIds
        publishedVariantsCount
        publishedVariantIds
      }
    }
  `)

  it('publishes parent, children and all child variants, returns counts', async () => {
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
        { id: 'c2', published: false }
      ]
    } as any)
    prismaMock.videoVariant.findMany.mockResolvedValue([
      { id: 'v1', videoId: 'c1', languageId: '529' },
      { id: 'v2', videoId: 'c2', languageId: '987' }
    ] as any)
    prismaMock.video.update.mockResolvedValue({} as any)
    prismaMock.video.updateMany.mockResolvedValue({ count: 2 } as any)
    prismaMock.videoVariant.updateMany.mockResolvedValue({ count: 2 } as any)

    const res = await authClient({
      document: VIDEO_PUBLISH_CHILDREN_LANG,
      variables: { id: 'parent' }
    })

    expect(res).toHaveProperty(
      'data.videoPublishChildrenAndLanguages.parentId',
      'parent'
    )
    expect(res).toHaveProperty(
      'data.videoPublishChildrenAndLanguages.publishedChildrenCount',
      2
    )
    expect(res).toHaveProperty(
      'data.videoPublishChildrenAndLanguages.publishedVariantsCount',
      2
    )
    expect(
      (
        res as any
      ).data.videoPublishChildrenAndLanguages.publishedChildIds.sort()
    ).toEqual(['c1', 'c2'])
    expect(
      (
        res as any
      ).data.videoPublishChildrenAndLanguages.publishedVariantIds.sort()
    ).toEqual(['v1', 'v2'])
  })
})
