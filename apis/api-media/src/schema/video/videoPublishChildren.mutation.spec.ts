import { parse } from 'graphql'
import { vi } from 'vitest'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { enqueueVideoAlgoliaSync } from '../../workers/videoAlgoliaSync'
import { handleParentVariantCreation } from '../videoVariant/videoVariant'

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

vi.mock('../videoVariant/videoVariant', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../videoVariant/videoVariant')>()),
  handleParentVariantCreation: vi.fn()
}))

const mockedEnqueueVideoAlgoliaSync = vi.mocked(enqueueVideoAlgoliaSync)
const mockedHandleParentVariantCreation = vi.mocked(handleParentVariantCreation)

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
        missingParentLanguageIds
        recoveredParentLanguageIds
      }
    }
  `) as AuthClientDocument

  beforeEach(() => {
    ;(prismaMock.video.findUnique as any).mockImplementation(
      async (args: any) => {
        if (args?.where?.id === 'parent') {
          return {
            id: 'parent',
            slug: 'parent-slug',
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
    prismaMock.videoVariant.findMany.mockResolvedValue([])
    prismaMock.video.update.mockResolvedValue({} as any)
    prismaMock.video.updateMany.mockResolvedValue({ count: 2 })
    prismaMock.videoVariant.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback(prismaMock)
    )
    mockedEnqueueVideoAlgoliaSync.mockReset().mockResolvedValue(undefined)
    mockedHandleParentVariantCreation.mockReset().mockResolvedValue(undefined)
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
        .mockResolvedValueOnce([])

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
        .mockResolvedValueOnce([])

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
        .mockResolvedValueOnce([])

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

  describe('parentVariantsOnly mode', () => {
    function mockParentAndChildren(): void {
      prismaMock.video.findUnique.mockResolvedValueOnce({
        id: 'parent',
        variants: [{ languageId: 'en' }],
        children: [
          { id: 'c1', variants: [{ languageId: 'en' }] },
          { id: 'c2', variants: [{ languageId: 'es' }] }
        ]
      } as any)
    }

    // Backs the real (unmocked) createEmptyParentVariant helper so apply
    // tests exercise the actual scoped-write path instead of the
    // multi-parent-walking handleParentVariantCreation mock.
    function mockCreateEmptyParentVariantPrisma(): void {
      ;(prismaMock.videoVariant.findFirst as any).mockImplementation(
        async (args: any) => {
          if (args?.where?.videoId != null) return null
          return { slug: `lang/${args?.where?.languageId}` }
        }
      )
      ;(prismaMock.videoVariant.create as any).mockResolvedValue({
        id: 'created-variant'
      })
    }

    it('dry run reports missing language IDs without writing', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      mockParentAndChildren()

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'parentVariantsOnly',
          dryRun: true
        }
      })

      expect((res as any).data.videoPublishChildren.dryRun).toBe(true)
      expect(
        (res as any).data.videoPublishChildren.missingParentLanguageIds
      ).toEqual(['es'])
      expect((res as any).data.videoPublishChildren.publishedVideoIds).toEqual(
        []
      )
      expect((res as any).data.videoPublishChildren.publishedVideoCount).toBe(0)
      expect(
        (res as any).data.videoPublishChildren.publishedVariantIds
      ).toEqual([])
      expect(
        (res as any).data.videoPublishChildren.publishedVariantsCount
      ).toBe(0)
      expect(mockedHandleParentVariantCreation).not.toHaveBeenCalled()
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.video.updateMany).not.toHaveBeenCalled()
      expect(prismaMock.videoVariant.updateMany).not.toHaveBeenCalled()
    })

    it('only considers direct published children and their published variants', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      mockParentAndChildren()

      await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'parentVariantsOnly',
          dryRun: true
        }
      })

      expect(prismaMock.video.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'parent' },
          select: expect.objectContaining({
            children: expect.objectContaining({
              where: { published: true },
              select: expect.objectContaining({
                variants: expect.objectContaining({
                  where: { published: true }
                })
              })
            })
          })
        })
      )
    })

    it('apply creates only the missing parent Variant, scoped to the requested parent', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      mockParentAndChildren()
      mockCreateEmptyParentVariantPrisma()

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'parentVariantsOnly',
          dryRun: false
        }
      })

      expect((res as any).data.videoPublishChildren.dryRun).toBe(false)
      expect(
        (res as any).data.videoPublishChildren.missingParentLanguageIds
      ).toEqual(['es'])
      expect(
        (res as any).data.videoPublishChildren.recoveredParentLanguageIds
      ).toEqual(['es'])
      // handleParentVariantCreation walks every parent of the child Video —
      // the scoped recovery path must never use it.
      expect(mockedHandleParentVariantCreation).not.toHaveBeenCalled()
      expect(prismaMock.videoVariant.create).toHaveBeenCalledTimes(1)
      expect(prismaMock.videoVariant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            videoId: 'parent',
            languageId: 'es'
          })
        })
      )
      expect(prismaMock.video.updateMany).not.toHaveBeenCalled()
      expect(prismaMock.videoVariant.updateMany).not.toHaveBeenCalled()
    })

    it('creates the Variant only for the requested parent, never a sibling parent of a shared child', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      mockParentAndChildren()
      mockCreateEmptyParentVariantPrisma()
      // c2 is also a child of a different parent — handleParentVariantCreation
      // would discover it via this query and write there too.
      prismaMock.video.findMany.mockResolvedValueOnce([
        { id: 'parent' },
        { id: 'other-parent' }
      ] as any)

      await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'parentVariantsOnly',
          dryRun: false
        }
      })

      expect(prismaMock.videoVariant.create).toHaveBeenCalledTimes(1)
      expect(prismaMock.videoVariant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ videoId: 'parent' })
        })
      )
      expect(prismaMock.videoVariant.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ videoId: 'other-parent' })
        })
      )
    })

    it('reports a failed recovery separately and still creates the others', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.video.findUnique.mockResolvedValueOnce({
        id: 'parent',
        variants: [],
        children: [
          { id: 'c1', variants: [{ languageId: 'en' }] },
          { id: 'c2', variants: [{ languageId: 'es' }] }
        ]
      } as any)
      mockCreateEmptyParentVariantPrisma()
      ;(prismaMock.videoVariant.create as any).mockImplementation(
        async (args: any) => {
          if (args?.data?.languageId === 'es') {
            throw new Error('create failed')
          }
          return { id: 'created-variant' }
        }
      )

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'parentVariantsOnly',
          dryRun: false
        }
      })

      expect(
        (res as any).data.videoPublishChildren.missingParentLanguageIds.sort()
      ).toEqual(['en', 'es'])
      expect(
        (res as any).data.videoPublishChildren.recoveredParentLanguageIds
      ).toEqual(['en'])
    })

    it('is idempotent when no parent languages are missing', async () => {
      prismaMock.userMediaRole.findUnique.mockResolvedValue({
        id: 'userId',
        userId: 'userId',
        roles: ['publisher'],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      prismaMock.video.findUnique.mockResolvedValueOnce({
        id: 'parent',
        variants: [{ languageId: 'en' }, { languageId: 'es' }],
        children: [
          { id: 'c1', variants: [{ languageId: 'en' }] },
          { id: 'c2', variants: [{ languageId: 'es' }] }
        ]
      } as any)

      const res = await authClient({
        document: VIDEO_PUBLISH_CHILDREN,
        variables: {
          id: 'parent',
          mode: 'parentVariantsOnly',
          dryRun: false
        }
      })

      expect(
        (res as any).data.videoPublishChildren.missingParentLanguageIds
      ).toEqual([])
      expect(mockedHandleParentVariantCreation).not.toHaveBeenCalled()
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
    // A small in-memory video graph wired up behind the prisma mock, so
    // these tests drive the actual, unmocked availableLanguages cascade
    // across several real videos instead of asserting against canned
    // responses. `availableLanguages` is a *stored* value here: every write
    // the cascade makes lands back in the store, so a later read in the
    // same request observes the just-written value, exactly as it would
    // against real rows.
    interface HierarchyVideo {
      label: string
      published: boolean
      availableLanguages: string[]
      childIds: string[]
      variants: Array<{ id: string; languageId: string; published: boolean }>
    }

    interface Hierarchy {
      store: Record<string, HierarchyVideo>
      /** ids written by `video.update`, in the order the writes committed */
      writes: string[]
      /** ids passed to `calculateAvailableLanguages`, in read order */
      recomputes: string[]
    }

    // `deferWriteFor` pushes that video's `video.update` onto the next
    // macrotask (a real `setTimeout`, not a manually released gate). Any
    // read of its availableLanguages issued before that write lands - what
    // an unordered `Promise.all` over children and parent together would
    // do - observes the stale, pre-publish value and produces a wrong
    // parent/grandparent result.
    function installHierarchy(
      initial: Record<string, HierarchyVideo>,
      { deferWriteFor }: { deferWriteFor?: string } = {}
    ): Hierarchy {
      const store: Record<string, HierarchyVideo> = structuredClone(initial)
      const writes: string[] = []
      const recomputes: string[] = []

      ;(prismaMock.video.findUnique as any).mockImplementation(
        async ({ where, select }: any) => {
          const id = where?.id
          const video = id == null ? null : store[id]
          if (video == null) return null

          // getVideoPublishParent's shape: a plain id+published children
          // select, with no `where` narrowing the children.
          if (
            select?.children?.select?.id != null &&
            select?.children?.where == null
          ) {
            return {
              id,
              label: video.label,
              published: video.published,
              publishedAt: new Date(),
              children: video.childIds.map((childId) => ({
                id: childId,
                published: store[childId]?.published ?? false
              }))
            }
          }

          // calculateAvailableLanguages' shape: published-only variants and
          // published-only children, alongside the row's *stored*
          // availableLanguages - the "before" half of the cascade's
          // change-detection comparison. Omitting availableLanguages here
          // would hand the cascade `before === undefined`, which never
          // compares equal to anything, silently disabling the comparison
          // this suite exists to exercise.
          if (select?.children?.where != null) {
            recomputes.push(id)
            return {
              label: video.label,
              availableLanguages: video.availableLanguages,
              variants: video.variants
                .filter((variant) => variant.published)
                .map((variant) => ({ languageId: variant.languageId })),
              children: video.childIds
                .filter((childId) => store[childId]?.published === true)
                .map((childId) => ({
                  availableLanguages: store[childId].availableLanguages
                }))
            }
          }

          // videoCacheReset's `{ slug: true }` shape - it handles a null row
          // safely, and cache behaviour is not what these tests assert on.
          return null
        }
      )
      ;(prismaMock.video.update as any).mockImplementation(
        async ({ where, data }: any) => {
          const id = where?.id
          const next = data?.availableLanguages?.set
          if (id === deferWriteFor) {
            await new Promise((resolve) => setTimeout(resolve, 0))
          }
          if (id != null && next != null && store[id] != null) {
            store[id].availableLanguages = next
            writes.push(id)
          }
          return {}
        }
      )
      ;(prismaMock.video.findMany as any).mockImplementation(
        async ({ where }: any) => {
          // findContainerParentIds - who lists this video as a child?
          const childId = where?.children?.some?.id
          if (childId != null) {
            const labels: string[] = where?.label?.in ?? []
            return Object.keys(store)
              .filter(
                (id) =>
                  store[id].childIds.includes(childId) &&
                  labels.includes(store[id].label)
              )
              .map((id) => ({ id }))
          }

          // buildVideoPublishPlan's validation query. Every candidate is
          // complete - these tests exercise the language cascade, not
          // publish validation.
          const candidateIds: string[] = where?.id?.in ?? []
          return candidateIds
            .filter((id) => store[id] != null)
            .map((id) => ({
              id,
              label: store[id].label,
              title: [{ value: `${id} title` }],
              snippet: [{ value: `${id} snippet` }],
              description: [{ value: `${id} description` }],
              imageAlt: [{ value: `${id} image alt` }],
              images: [{ id: `${id}-banner` }],
              variants: [{ id: `${id}-variant` }]
            }))
        }
      )
      ;(prismaMock.videoVariant.findMany as any).mockImplementation(
        async ({ where }: any) => {
          const videoIds: string[] = where?.videoId?.in ?? []
          return videoIds.flatMap((videoId) =>
            (store[videoId]?.variants ?? [])
              .filter((variant) => !variant.published)
              .map((variant) => ({ id: variant.id, videoId }))
          )
        }
      )
      ;(prismaMock.videoVariant.updateMany as any).mockImplementation(
        async ({ where }: any) => {
          const ids: string[] = where?.id?.in ?? []
          let count = 0
          for (const video of Object.values(store)) {
            for (const variant of video.variants) {
              if (ids.includes(variant.id)) {
                variant.published = true
                count++
              }
            }
          }
          return { count }
        }
      )

      return { store, writes, recomputes }
    }

    // Exercises a real three-level hierarchy (grandparent -> parent ->
    // child) through the actual, unmocked availableLanguages cascade, to
    // catch two regressions at once:
    //  - the cascade stopping at the immediate parent instead of reaching
    //    the grandparent (the single-hop bug this mutation must not
    //    reintroduce), and
    //  - a parent recompute racing a same-request child recompute and
    //    reading the child's stale, pre-write value instead of its
    //    just-committed one.
    it('propagates a child variant published in the same request through the parent to the grandparent, without racing the child write', async () => {
      const { store, writes, recomputes } = installHierarchy(
        {
          grandparent: {
            label: 'collection',
            published: true,
            availableLanguages: ['529'],
            childIds: ['parent'],
            variants: []
          },
          parent: {
            label: 'featureFilm',
            published: true,
            availableLanguages: ['529'],
            childIds: ['child'],
            variants: []
          },
          child: {
            label: 'featureFilm',
            published: true,
            availableLanguages: ['529'],
            childIds: [],
            variants: [
              { id: 'child-v1', languageId: '529', published: true },
              { id: 'child-v2', languageId: '21028', published: false }
            ]
          }
        },
        { deferWriteFor: 'child' }
      )

      await executeVideoPublishChildren(
        'parent',
        'childrenVideosAndVariants',
        false
      )

      // Every level ends up holding the newly published language, not just
      // the child and its immediate parent.
      expect(store.child.availableLanguages).toEqual(['529', '21028'])
      expect(store.parent.availableLanguages).toEqual(['529', '21028'])
      expect(store.grandparent.availableLanguages).toEqual(['529', '21028'])

      // The child's write committed before the parent was even recomputed -
      // the ordering guarantee, asserted directly rather than inferred from
      // the values above.
      expect(writes.indexOf('child')).toBeGreaterThanOrEqual(0)
      expect(writes.indexOf('child')).toBeLessThan(
        recomputes.lastIndexOf('parent')
      )
      expect(writes).toEqual(['child', 'parent', 'grandparent'])
    })

    it('stops cascading above an ancestor whose recomputed value is unchanged', async () => {
      // root -> grandparent -> {parent -> child, uncle}. `uncle` is an
      // already-published sibling that already carries both languages, so
      // grandparent's stored value is *already* correct and recomputing it
      // changes nothing - there is nothing above it that this publish could
      // affect, and `root` must never be recomputed or written.
      const { store, writes, recomputes } = installHierarchy({
        root: {
          label: 'collection',
          published: true,
          availableLanguages: ['529', '21028'],
          childIds: ['grandparent'],
          variants: []
        },
        grandparent: {
          label: 'collection',
          published: true,
          availableLanguages: ['529', '21028'],
          childIds: ['parent', 'uncle'],
          variants: []
        },
        uncle: {
          label: 'featureFilm',
          published: true,
          availableLanguages: ['529', '21028'],
          childIds: [],
          variants: []
        },
        parent: {
          label: 'featureFilm',
          published: true,
          availableLanguages: ['529'],
          childIds: ['child'],
          variants: []
        },
        child: {
          label: 'featureFilm',
          published: true,
          availableLanguages: ['529'],
          childIds: [],
          variants: [
            { id: 'child-v1', languageId: '529', published: true },
            { id: 'child-v2', languageId: '21028', published: false }
          ]
        }
      })

      await executeVideoPublishChildren(
        'parent',
        'childrenVideosAndVariants',
        false
      )

      // The levels that genuinely changed still got there.
      expect(store.child.availableLanguages).toEqual(['529', '21028'])
      expect(store.parent.availableLanguages).toEqual(['529', '21028'])

      // grandparent is recomputed and written once - we can't know it is
      // unaffected until after computing it - but the walk stops there.
      expect(writes).toEqual(['child', 'parent', 'grandparent'])
      expect(recomputes).not.toContain('root')
      expect(store.root.availableLanguages).toEqual(['529', '21028'])
    })
  })
})
