import { parse } from 'graphql'

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
  const VIDEO_PUBLISH_CHILDREN = parse(/* GraphQL */ `
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
  `)

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
})
