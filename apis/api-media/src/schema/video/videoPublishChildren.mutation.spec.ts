import { parse } from 'graphql'
import { vi } from 'vitest'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { enqueueVideoAlgoliaSync } from '../../workers/videoAlgoliaSync'

import { executeVideoPublishChildren } from './videoPublishChildren.mutation'

vi.mock('../../workers/videoAlgoliaSync', () => ({
  enqueueVideoAlgoliaSync: vi.fn(),
  videoOnlyScope: {
    syncVideoRecord: true,
    syncAllVariants: false,
    syncPublishedFlag: false,
    dirtyVariantIds: [],
    deletedVariantIds: []
  }
}))

const mockedEnqueueVideoAlgoliaSync = vi.mocked(enqueueVideoAlgoliaSync)

const authClient = getClient({
  headers: {
    authorization: 'token'
  },
  context: {
    currentRoles: ['publisher']
  }
})

describe('videoPublishChildren', () => {
  type AuthClientDocument = Parameters<typeof authClient>[0]['document']

  const VIDEO_PUBLISH_CHILDREN: AuthClientDocument = parse(/* GraphQL */ `
    mutation VideoPublishChildren(
      $id: ID!
      $mode: VideoPublishMode!
      $dryRun: Boolean!
    ) {
      videoPublishChildren(id: $id, mode: $mode, dryRun: $dryRun) {
        parentId
        publishedVideoCount
        publishedVideoIds
        publishedVariantsCount
        publishedVariantIds
        dryRun
        videosFailedValidation {
          videoId
          missingFields
          message
        }
      }
    }
  `) as AuthClientDocument

  beforeEach(() => {
    ;(prismaMock.video.findUnique as any).mockImplementation(
      async (args: any) => {
        if (args?.where?.id === 'parent') {
          return {
            id: 'parent',
            label: 'collection',
            publishedAt: null,
            children: [
              { id: 'c1', published: false, availableLanguages: [] },
              { id: 'c2', published: true, availableLanguages: [] },
              { id: 'c3', published: false, availableLanguages: [] }
            ],
            variants: [],
            availableLanguages: []
          } as any
        }

        return {
          id: args?.where?.id ?? 'video',
          label: 'featureFilm',
          publishedAt: null,
          children: [],
          variants: [],
          availableLanguages: []
        } as any
      }
    )
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'parent',
        label: 'collection',
        title: [{ value: 'Parent title' }],
        snippet: [{ value: 'Parent snippet' }],
        description: [{ value: 'Parent description' }],
        imageAlt: [{ value: 'Parent image alt' }],
        images: [{ id: 'parent-banner' }],
        variants: []
      },
      {
        id: 'c1',
        label: 'featureFilm',
        title: [{ value: 'Child title 1' }],
        snippet: [{ value: 'Child snippet 1' }],
        description: [{ value: 'Child description 1' }],
        imageAlt: [{ value: 'Child image alt 1' }],
        images: [{ id: 'c1-banner' }],
        variants: [{ id: 'c1-variant' }]
      },
      {
        id: 'c3',
        label: 'featureFilm',
        title: [{ value: 'Child title 3' }],
        snippet: [{ value: 'Child snippet 3' }],
        description: [{ value: 'Child description 3' }],
        imageAlt: [{ value: 'Child image alt 3' }],
        images: [{ id: 'c3-banner' }],
        variants: [{ id: 'c3-variant' }]
      }
    ] as any)
    prismaMock.videoVariant.findMany.mockResolvedValue([] as any)
    prismaMock.video.update.mockResolvedValue({} as any)
    prismaMock.video.updateMany.mockResolvedValue({ count: 2 } as any)
    prismaMock.videoVariant.updateMany.mockResolvedValue({ count: 1 } as any)
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback(prismaMock)
    )
    mockedEnqueueVideoAlgoliaSync.mockReset().mockResolvedValue(undefined)
  })

  describe('childrenVideosOnly mode', () => {
    it('publishes parent and children videos without any variants', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosOnly',
          dryRun: false
        }
      })

      expect(res).toHaveProperty('data.videoPublishChildren.parentId', 'parent')
      expect(res).toHaveProperty(
        'data.videoPublishChildren.publishedVideoCount',
        3
      )
      expect(
        (res as any).data.videoPublishChildren.publishedVideoIds.sort()
      ).toEqual(['c1', 'c3', 'parent'])
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds
      ).toEqual([])
      expect(
        (res as any).data.videoPublishChildren.publishedVariantsCount
      ).toBe(0)
      expect((res as any).data.videoPublishChildren.dryRun).toBe(false)
      expect(
        (res as any).data.videoPublishChildren.videosFailedValidation
      ).toEqual([])
      expect(prismaMock.videoVariant.updateMany).not.toHaveBeenCalled()
    })

    it('returns dry run summary without writing', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosOnly',
          dryRun: true
        }
      })

      expect((res as any).data.videoPublishChildren.dryRun).toBe(true)
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds
      ).toEqual([])
      expect((res as any).data.videoPublishChildren.publishedVideoCount).toBe(3)
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('skips already published parent and only publishes unpublished children', async () => {
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
        publishedAt: new Date('2024-01-01T00:00:00.000Z'),
        children: [
          { id: 'c1', published: false },
          { id: 'c2', published: true },
          { id: 'c3', published: false }
        ]
      } as any)
      ;(prismaMock.video.findMany as any).mockImplementation(
        async (args: any) => {
          const candidateIds = args?.where?.id?.in ?? []
          return [
            {
              id: 'c1',
              label: 'featureFilm',
              title: [{ value: 'Child title 1' }],
              snippet: [{ value: 'Child snippet 1' }],
              description: [{ value: 'Child description 1' }],
              imageAlt: [{ value: 'Child image alt 1' }],
              images: [{ id: 'c1-banner' }],
              variants: [{ id: 'c1-variant' }]
            },
            {
              id: 'c3',
              label: 'featureFilm',
              title: [{ value: 'Child title 3' }],
              snippet: [{ value: 'Child snippet 3' }],
              description: [{ value: 'Child description 3' }],
              imageAlt: [{ value: 'Child image alt 3' }],
              images: [{ id: 'c3-banner' }],
              variants: [{ id: 'c3-variant' }]
            }
          ].filter((video) => candidateIds.includes(video.id))
        }
      )

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosOnly',
          dryRun: false
        }
      })

      expect((res as any).data.videoPublishChildren.publishedVideoCount).toBe(2)
      expect(
        (res as any).data.videoPublishChildren.publishedVideoIds.sort()
      ).toEqual(['c1', 'c3'])
      expect(prismaMock.video.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['c1', 'c3'] } },
        data: { published: true, publishedAt: expect.any(Date) }
      })
      expect(prismaMock.video.update).not.toHaveBeenCalled()
    })
  })

  describe('childrenVideosAndVariants mode', () => {
    it('publishes parent, children, and all their unpublished variants', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { id: 'pv1', videoId: 'parent' },
          { id: 'cv1', videoId: 'c1' }
        ] as any)
        .mockResolvedValueOnce([] as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosAndVariants',
          dryRun: false
        }
      })

      expect(res).toHaveProperty('data.videoPublishChildren.parentId', 'parent')
      expect((res as any).data.videoPublishChildren.publishedVideoCount).toBe(3)
      expect(
        (res as any).data.videoPublishChildren.publishedVariantsCount
      ).toBe(2)
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds.sort()
      ).toEqual(['cv1', 'pv1'])
      expect(prismaMock.videoVariant.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['pv1', 'cv1'] } },
        data: { published: true }
      })

      // parent and c1 are both newly published this run (videoIdsToPublish),
      // so both get the published-flag batch update plus their own newly
      // published variant
      expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
        'parent',
        {
          syncVideoRecord: true,
          syncAllVariants: false,
          syncPublishedFlag: true,
          dirtyVariantIds: ['pv1'],
          deletedVariantIds: []
        },
        expect.anything()
      )
      expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
        'c1',
        {
          syncVideoRecord: true,
          syncAllVariants: false,
          syncPublishedFlag: true,
          dirtyVariantIds: ['cv1'],
          deletedVariantIds: []
        },
        expect.anything()
      )
    })

    it('publishes draft variants on already published children', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.video.findUnique.mockResolvedValue({
        id: 'parent',
        label: 'series',
        published: true,
        publishedAt: new Date('2024-01-01T00:00:00.000Z'),
        children: [
          { id: 'c1', published: true },
          { id: 'c2', published: true }
        ]
      } as any)
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'parent',
          label: 'series',
          title: [{ value: 'Parent title' }],
          snippet: [{ value: 'Parent snippet' }],
          description: [{ value: 'Parent description' }],
          imageAlt: [{ value: 'Parent image alt' }],
          images: [{ id: 'parent-banner' }],
          variants: []
        }
      ] as any)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { id: 'c1-spanish-draft', videoId: 'c1' }
        ] as any)
        .mockResolvedValueOnce([] as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosAndVariants',
          dryRun: false
        }
      })

      expect((res as any).data.videoPublishChildren.publishedVideoIds).toEqual(
        []
      )
      expect((res as any).data.videoPublishChildren.publishedVideoCount).toBe(0)
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds
      ).toEqual(['c1-spanish-draft'])
      expect(
        (res as any).data.videoPublishChildren.publishedVariantsCount
      ).toBe(1)
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        where: {
          videoId: { in: ['parent', 'c1', 'c2'] },
          published: false
        },
        select: { id: true, videoId: true }
      })
      expect(prismaMock.videoVariant.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['c1-spanish-draft'] } },
        data: { published: true }
      })
    })

    it('dry run includes draft variants on already published children', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.video.findUnique.mockResolvedValue({
        id: 'parent',
        label: 'series',
        published: true,
        publishedAt: new Date('2024-01-01T00:00:00.000Z'),
        children: [
          { id: 'c1', published: true },
          { id: 'c2', published: true }
        ]
      } as any)
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'parent',
          label: 'series',
          title: [{ value: 'Parent title' }],
          snippet: [{ value: 'Parent snippet' }],
          description: [{ value: 'Parent description' }],
          imageAlt: [{ value: 'Parent image alt' }],
          images: [{ id: 'parent-banner' }],
          variants: []
        }
      ] as any)
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { id: 'c1-spanish-draft', videoId: 'c1' }
      ] as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosAndVariants',
          dryRun: true
        }
      })

      expect((res as any).data.videoPublishChildren.dryRun).toBe(true)
      expect((res as any).data.videoPublishChildren.publishedVideoIds).toEqual(
        []
      )
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds
      ).toEqual(['c1-spanish-draft'])
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('returns dry run summary and performs no writes', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { id: 'pv1', videoId: 'parent' },
        { id: 'cv1', videoId: 'c1' }
      ] as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosAndVariants',
          dryRun: true
        }
      })

      expect((res as any).data.videoPublishChildren.dryRun).toBe(true)
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds.sort()
      ).toEqual(['cv1', 'pv1'])
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('does not require a published variant when variants are published in the same flow', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'parent',
          label: 'collection',
          title: [{ value: 'Parent title' }],
          snippet: [{ value: 'Parent snippet' }],
          description: [{ value: 'Parent description' }],
          imageAlt: [{ value: 'Parent image alt' }],
          images: [{ id: 'parent-banner' }],
          variants: []
        },
        {
          id: 'c1',
          label: 'featureFilm',
          title: [{ value: 'Child title 1' }],
          snippet: [{ value: 'Child snippet 1' }],
          description: [{ value: 'Child description 1' }],
          imageAlt: [{ value: 'Child image alt 1' }],
          images: [{ id: 'c1-banner' }],
          variants: [{ id: 'c1-unpublished-variant' }]
        },
        {
          id: 'c3',
          label: 'featureFilm',
          title: [{ value: 'Child title 3' }],
          snippet: [{ value: 'Child snippet 3' }],
          description: [{ value: 'Child description 3' }],
          imageAlt: [{ value: 'Child image alt 3' }],
          images: [{ id: 'c3-banner' }],
          variants: [{ id: 'c3-variant' }]
        }
      ] as any)
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          { id: 'pv1', videoId: 'parent' },
          { id: 'c1-unpublished-variant', videoId: 'c1' }
        ] as any)
        .mockResolvedValueOnce([] as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosAndVariants',
          dryRun: false
        }
      })

      expect(
        (res as any).data.videoPublishChildren.videosFailedValidation
      ).toEqual([])
      expect(
        (res as any).data.videoPublishChildren.publishedVideoIds.sort()
      ).toEqual(['c1', 'c3', 'parent'])
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds.sort()
      ).toEqual(['c1-unpublished-variant', 'pv1'])
    })
  })

  it('excludes variants on unpublished children that fail validation', async () => {
    prismaMock.userMediaRole.findUnique.mockResolvedValue({
      id: 'userId',
      userId: 'userId',
      roles: ['publisher'],
      createdAt: new Date(),
      updatedAt: new Date()
    })
    prismaMock.video.findUnique.mockResolvedValue({
      id: 'parent',
      label: 'series',
      published: true,
      publishedAt: new Date('2024-01-01T00:00:00.000Z'),
      children: [
        { id: 'valid-child', published: false },
        { id: 'invalid-child', published: false },
        { id: 'published-child', published: true }
      ]
    } as any)
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'parent',
        label: 'series',
        title: [{ value: 'Parent title' }],
        snippet: [{ value: 'Parent snippet' }],
        description: [{ value: 'Parent description' }],
        imageAlt: [{ value: 'Parent image alt' }],
        images: [{ id: 'parent-banner' }],
        variants: []
      },
      {
        id: 'valid-child',
        label: 'featureFilm',
        title: [{ value: 'Valid child title' }],
        snippet: [{ value: 'Valid child snippet' }],
        description: [{ value: 'Valid child description' }],
        imageAlt: [{ value: 'Valid child image alt' }],
        images: [{ id: 'valid-child-banner' }],
        variants: [{ id: 'valid-child-draft-variant' }]
      },
      {
        id: 'invalid-child',
        label: 'featureFilm',
        title: [{ value: 'Invalid child title' }],
        snippet: [],
        description: [{ value: 'Invalid child description' }],
        imageAlt: [{ value: 'Invalid child image alt' }],
        images: [{ id: 'invalid-child-banner' }],
        variants: [{ id: 'invalid-child-draft-variant' }]
      }
    ] as any)
    prismaMock.videoVariant.findMany.mockResolvedValueOnce([
      { id: 'valid-child-draft-variant', videoId: 'valid-child' },
      { id: 'published-child-draft-variant', videoId: 'published-child' }
    ] as any)

    const res = await authClient({
      document: VIDEO_PUBLISH_CHILDREN,
      variables: {
        id: 'parent',
        mode: 'childrenVideosAndVariants',
        dryRun: true
      }
    })

    expect(
      (res as any).data.videoPublishChildren.videosFailedValidation
    ).toEqual([
      {
        videoId: 'invalid-child',
        missingFields: ['Short Description'],
        message: 'invalid-child not published, missing: Short Description'
      }
    ])
    expect((res as any).data.videoPublishChildren.publishedVideoIds).toEqual([
      'valid-child'
    ])
    expect(
      (res as any).data.videoPublishChildren.publishedVariantIds.sort()
    ).toEqual(['published-child-draft-variant', 'valid-child-draft-variant'])
    expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
      where: {
        videoId: { in: ['parent', 'valid-child', 'published-child'] },
        published: false
      },
      select: { id: true, videoId: true }
    })
  })

  describe('variantsOnly mode', () => {
    it('publishes only unpublished variants of the given video without touching children', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { id: 'v1', videoId: 'parent' },
        { id: 'v2', videoId: 'parent' }
      ] as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'variantsOnly',
          dryRun: false
        }
      })

      expect(res).toHaveProperty('data.videoPublishChildren.parentId', 'parent')
      expect((res as any).data.videoPublishChildren.publishedVideoIds).toEqual(
        []
      )
      expect((res as any).data.videoPublishChildren.publishedVideoCount).toBe(0)
      expect(
        (res as any).data.videoPublishChildren.publishedVariantsCount
      ).toBe(2)
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds.sort()
      ).toEqual(['v1', 'v2'])
      expect(prismaMock.videoVariant.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['v1', 'v2'] } },
        data: { published: true }
      })
      expect(prismaMock.video.updateMany).not.toHaveBeenCalled()
    })

    it('returns dry run summary without writing', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([
        { id: 'v1', videoId: 'parent' }
      ] as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'variantsOnly',
          dryRun: true
        }
      })

      expect((res as any).data.videoPublishChildren.dryRun).toBe(true)
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds
      ).toEqual(['v1'])
      expect((res as any).data.videoPublishChildren.publishedVideoIds).toEqual(
        []
      )
      expect(prismaMock.videoVariant.updateMany).not.toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('fails when a feature film child has no published variants', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'parent',
          label: 'collection',
          title: [{ value: 'Parent title' }],
          snippet: [{ value: 'Parent snippet' }],
          description: [{ value: 'Parent description' }],
          imageAlt: [{ value: 'Parent image alt' }],
          images: [{ id: 'parent-banner' }],
          variants: []
        },
        {
          id: 'c1',
          label: 'featureFilm',
          title: [{ value: 'Child title 1' }],
          snippet: [{ value: 'Child snippet 1' }],
          description: [{ value: 'Child description 1' }],
          imageAlt: [{ value: 'Child image alt 1' }],
          images: [{ id: 'c1-banner' }],
          variants: []
        },
        {
          id: 'c3',
          label: 'featureFilm',
          title: [{ value: 'Child title 3' }],
          snippet: [{ value: 'Child snippet 3' }],
          description: [{ value: 'Child description 3' }],
          imageAlt: [{ value: 'Child image alt 3' }],
          images: [{ id: 'c3-banner' }],
          variants: [{ id: 'c3-published-variant' }]
        }
      ] as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosOnly',
          dryRun: false
        }
      })

      const failures = (res as any).data.videoPublishChildren
        .videosFailedValidation as Array<{
        videoId: string
        missingFields: string[]
      }>
      expect(failures).toEqual(
        expect.arrayContaining([
          {
            videoId: 'c1',
            missingFields: ['Published Video Variant'],
            message: 'c1 not published, missing: Published Video Variant'
          }
        ])
      )
      expect(
        (res as any).data.videoPublishChildren.publishedVideoIds.sort()
      ).toEqual(['c3', 'parent'])
    })

    it('returns failed validation videos when required fields are missing', async () => {
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
        children: []
      } as any)
      prismaMock.video.findMany.mockResolvedValue([
        {
          id: 'parent',
          label: 'featureFilm',
          title: [],
          snippet: [],
          description: [],
          imageAlt: [],
          images: [],
          variants: []
        }
      ] as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'childrenVideosOnly',
          dryRun: false
        }
      })

      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds
      ).toEqual([])
      expect(
        (res as any).data.videoPublishChildren.publishedVariantsCount
      ).toBe(0)
      expect(
        (res as any).data.videoPublishChildren.videosFailedValidation
      ).toEqual([
        {
          videoId: 'parent',
          missingFields: [
            'Title',
            'Short Description',
            'Description',
            'Image Alt Text',
            'Banner Image',
            'Published Video Variant'
          ],
          message:
            'parent not published, missing: Title, Short Description, Description, Image Alt Text, Banner Image, Published Video Variant'
        }
      ])
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })
  })

  describe('grandparent cascade race safety', () => {
    // Exercises a real three-level hierarchy (grandparent -> parent ->
    // child) through the actual, unmocked availableLanguages cascade, to
    // catch two regressions at once:
    //  - the cascade stopping at the immediate parent instead of reaching
    //    the grandparent (the single-hop bug this mutation must not
    //    reintroduce), and
    //  - a parent recompute racing a same-request child recompute and
    //    reading the child's stale, pre-write value instead of its
    //    just-committed one.
    //
    // `child`'s own `video.update` write is deliberately deferred onto the
    // next macrotask (a real `setTimeout`, not a manually-released gate) so
    // that any read of `child`'s availableLanguages issued *before* that
    // write lands - exactly what a reintroduced unordered `Promise.all`
    // over children and the parent together would do - would observe the
    // pre-publish value and produce a wrong grandparent result. The current
    // code only reads `child`'s value after explicitly awaiting its update,
    // so it always observes the post-publish value regardless of this
    // delay.
    it('propagates a child variant published in the same request through the parent to the grandparent, without racing the child write', async () => {
      const labels: Record<string, string> = {
        grandparent: 'collection',
        parent: 'featureFilm',
        child: 'featureFilm'
      }
      const childIdsByParent: Record<string, string[]> = {
        grandparent: ['parent'],
        parent: ['child']
      }
      const publishedState = new Map<string, boolean>([
        ['grandparent', true],
        ['parent', true],
        ['child', true]
      ])
      const availableLanguagesByVideo = new Map<string, string[]>([
        ['grandparent', []],
        ['parent', []],
        ['child', ['529']]
      ])
      const variantsByVideo: Record<
        string,
        Array<{ id: string; languageId: string; published: boolean }>
      > = {
        parent: [],
        child: [
          { id: 'child-v1', languageId: '529', published: true },
          { id: 'child-v2', languageId: '21028', published: false }
        ]
      }

      ;(prismaMock.video.findUnique as any).mockImplementation(
        async ({ where, select }: any) => {
          const id = where?.id
          if (id == null) return null

          // getVideoPublishParent's shape: a plain id+published children select.
          if (
            select?.children?.select?.id != null &&
            select?.children?.where == null
          ) {
            return {
              id,
              label: labels[id],
              published: publishedState.get(id) ?? false,
              publishedAt: new Date(),
              children: (childIdsByParent[id] ?? []).map((childId) => ({
                id: childId,
                published: publishedState.get(childId) ?? false
              }))
            }
          }

          // calculateAvailableLanguages' shape: published-only variants and
          // published-only children, selected down to availableLanguages.
          if (select?.children?.where != null) {
            return {
              variants: (variantsByVideo[id] ?? [])
                .filter((variant) => variant.published)
                .map((variant) => ({ languageId: variant.languageId })),
              children: (childIdsByParent[id] ?? [])
                .filter((childId) => publishedState.get(childId) === true)
                .map((childId) => ({
                  availableLanguages:
                    availableLanguagesByVideo.get(childId) ?? []
                }))
            }
          }

          // getStoredAvailableLanguages' shape (the cascade's before/after
          // change check). videoCacheReset's `{ slug: true }` shape falls
          // through to `null` below, which it already handles safely.
          if (select?.availableLanguages != null) {
            return {
              availableLanguages: availableLanguagesByVideo.get(id) ?? []
            }
          }

          return null
        }
      )
      ;(prismaMock.video.update as any).mockImplementation(
        async ({ where, data }: any) => {
          const id = where?.id
          const next = data?.availableLanguages?.set
          if (id === 'child') {
            // Force this write onto the macrotask queue so a concurrent
            // read issued from the same microtask turn would observe the
            // pre-write value - the exact shape of the race this test
            // guards against.
            await new Promise((resolve) => setTimeout(resolve, 0))
          }
          if (id != null && next != null) {
            availableLanguagesByVideo.set(id, next)
          }
          return {}
        }
      )
      ;(prismaMock.video.findMany as any).mockImplementation(
        async ({ where }: any) => {
          if (where?.children?.some?.id != null) {
            const childId = where.children.some.id
            return Object.entries(childIdsByParent)
              .filter(([, kids]) => kids.includes(childId))
              .map(([parentId]) => ({ id: parentId }))
          }

          // The publish-validation query - `parent` is already published so
          // it's the only candidate, and its fields only need to pass
          // validation, not exercise it.
          return [
            {
              id: 'parent',
              label: 'featureFilm',
              title: [{ value: 'Parent title' }],
              snippet: [{ value: 'Parent snippet' }],
              description: [{ value: 'Parent description' }],
              imageAlt: [{ value: 'Parent image alt' }],
              images: [{ id: 'parent-banner' }],
              variants: [{ id: 'parent-variant' }]
            }
          ]
        }
      )
      ;(prismaMock.videoVariant.findMany as any).mockImplementation(
        async ({ where }: any) => {
          const videoIds: string[] = where?.videoId?.in ?? []
          return videoIds.flatMap((videoId) =>
            (variantsByVideo[videoId] ?? [])
              .filter((variant) => !variant.published)
              .map((variant) => ({ id: variant.id, videoId }))
          )
        }
      )
      ;(prismaMock.videoVariant.updateMany as any).mockImplementation(
        async ({ where }: any) => {
          const ids: string[] = where?.id?.in ?? []
          let count = 0
          for (const variants of Object.values(variantsByVideo)) {
            for (const variant of variants) {
              if (ids.includes(variant.id)) {
                variant.published = true
                count++
              }
            }
          }
          return { count }
        }
      )

      await executeVideoPublishChildren(
        'parent',
        'childrenVideosAndVariants',
        false
      )

      expect(availableLanguagesByVideo.get('child')).toEqual(['529', '21028'])
      expect(availableLanguagesByVideo.get('parent')).toEqual(['529', '21028'])
      expect(availableLanguagesByVideo.get('grandparent')).toEqual([
        '529',
        '21028'
      ])
    })
  })
})
