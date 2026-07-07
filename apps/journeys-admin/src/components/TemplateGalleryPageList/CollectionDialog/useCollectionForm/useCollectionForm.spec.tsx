import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'
import { FormikHelpers } from 'formik'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactNode } from 'react'
import { type MockedFunction } from 'vitest'

import {
  GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage,
  GetTemplateGalleryPages_templateGalleryPages_media as TemplateGalleryPageMedia
} from '../../../../../__generated__/GetTemplateGalleryPages'
import {
  TemplateGalleryPageMediaType,
  TemplateGalleryPageStatus
} from '../../../../../__generated__/globalTypes'
import { sendCollectionTemplateAddEvent } from '../../../../libs/sendCollectionEvent'
import { getTemplateGalleryPageCreateMock } from '../../../../libs/useTemplateGalleryPageCreateMutation/useTemplateGalleryPageCreateMutation.mock'
import { getTemplateGalleryPagePublishMock } from '../../../../libs/useTemplateGalleryPagePublishMutation/useTemplateGalleryPagePublishMutation.mock'
import { TEMPLATE_GALLERY_PAGE_UPDATE } from '../../../../libs/useTemplateGalleryPageUpdateMutation/useTemplateGalleryPageUpdateMutation'
import { getTemplateGalleryPageUpdateMock } from '../../../../libs/useTemplateGalleryPageUpdateMutation/useTemplateGalleryPageUpdateMutation.mock'

import { CollectionMediaValues, EMPTY_MEDIA } from './collectionMedia'
import { CollectionFormValues, useCollectionForm } from './useCollectionForm'

const mockEnqueueSnackbar = vi.fn()
vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack')
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: mockEnqueueSnackbar,
      closeSnackbar: vi.fn()
    })
  }
})

vi.mock('../../../../libs/sendCollectionEvent', () => ({
  sendCollectionDescriptionUpdateEvent: vi.fn(),
  sendCollectionMediaUpdateEvent: vi.fn(),
  sendCollectionPublishEvent: vi.fn(),
  sendCollectionSlugUpdateEvent: vi.fn(),
  sendCollectionTemplateAddEvent: vi.fn()
}))

const mockSendCollectionTemplateAddEvent =
  sendCollectionTemplateAddEvent as MockedFunction<
    typeof sendCollectionTemplateAddEvent
  >

const NONE: CollectionMediaValues = EMPTY_MEDIA
function linkForm(url: string): CollectionMediaValues {
  return { ...EMPTY_MEDIA, type: TemplateGalleryPageMediaType.link, url }
}
function muxForm(
  overrides: Partial<CollectionMediaValues> = {}
): CollectionMediaValues {
  return {
    ...EMPTY_MEDIA,
    type: TemplateGalleryPageMediaType.mux,
    ...overrides
  }
}

function wrapperWithMocks(
  mocks: ReadonlyArray<MockedResponse>
): ({ children }: { children: ReactNode }) => JSX.Element {
  return function Wrapper({ children }) {
    return (
      <MockedProvider cache={new InMemoryCache()} mocks={mocks}>
        <SnackbarProvider>{children as JSX.Element}</SnackbarProvider>
      </MockedProvider>
    )
  }
}

function defaultValues(
  overrides: Partial<CollectionFormValues> = {}
): CollectionFormValues {
  return {
    title: 'My Collection',
    description: '',
    creatorName: 'Creator',
    creatorImageSrc: '',
    creatorImageAlt: '',
    media: NONE,
    slug: 'my-collection',
    journeyIds: [],
    ...overrides
  }
}

function linkMedia(embedUrl: string): TemplateGalleryPageMedia {
  return {
    __typename: 'TemplateGalleryPageMedia',
    id: 'media-1',
    type: TemplateGalleryPageMediaType.link,
    embedUrl,
    muxVideoId: null,
    muxPlaybackId: null,
    muxName: null,
    muxDuration: null
  }
}

function muxMedia(
  muxPlaybackId: string,
  muxName: string | null = null,
  muxDuration: number | null = null,
  muxVideoId: string | null = 'vid-existing'
): TemplateGalleryPageMedia {
  return {
    __typename: 'TemplateGalleryPageMedia',
    id: 'media-1',
    type: TemplateGalleryPageMediaType.mux,
    embedUrl: null,
    muxVideoId,
    muxPlaybackId,
    muxName,
    muxDuration
  }
}

function fakeHelpers(): FormikHelpers<CollectionFormValues> {
  return {
    setFieldError: vi.fn(),
    setFieldTouched: vi.fn().mockResolvedValue(undefined),
    setFieldValue: vi.fn().mockResolvedValue(undefined),
    setSubmitting: vi.fn(),
    setStatus: vi.fn(),
    setErrors: vi.fn(),
    setTouched: vi.fn().mockResolvedValue(undefined),
    setValues: vi.fn().mockResolvedValue(undefined),
    resetForm: vi.fn(),
    validateForm: vi.fn().mockResolvedValue({}),
    validateField: vi.fn(),
    submitForm: vi.fn().mockResolvedValue(undefined)
  } as unknown as FormikHelpers<CollectionFormValues>
}

function makeCollection(
  overrides: Partial<TemplateGalleryPage> = {}
): TemplateGalleryPage {
  return {
    __typename: 'TemplateGalleryPage',
    id: 'page-1',
    title: 'Original Title',
    description: 'Original description',
    slug: 'original-slug',
    status: TemplateGalleryPageStatus.draft,
    creatorName: 'Original Creator',
    creatorImageSrc: null,
    creatorImageAlt: null,
    media: null,
    publishedAt: null,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    templates: [],
    ...overrides
  }
}

describe('useCollectionForm', () => {
  beforeEach(() => {
    mockEnqueueSnackbar.mockClear()
  })

  describe('initialValues', () => {
    it('returns empty defaults when no collection is provided (create mode)', () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      expect(result.current.initialValues).toEqual({
        title: '',
        description: '',
        creatorName: '',
        creatorImageSrc: '',
        creatorImageAlt: '',
        media: EMPTY_MEDIA,
        slug: '',
        journeyIds: []
      })
      expect(result.current.isPublished).toBe(false)
    })

    it('hydrates from collection in edit mode and exposes isPublished', () => {
      const collection = makeCollection({
        title: 'Hydrate Title',
        description: 'D',
        slug: 'hydrate-slug',
        creatorName: 'C',
        creatorImageSrc: 'https://img/x.png',
        creatorImageAlt: 'alt',
        media: linkMedia('https://www.youtube-nocookie.com/embed/x'),
        status: TemplateGalleryPageStatus.published,
        templates: [
          {
            __typename: 'TemplateGalleryItem',
            id: 'j1',
            title: 'A',
            primaryImageBlock: null
          },
          {
            __typename: 'TemplateGalleryItem',
            id: 'j2',
            title: 'B',
            primaryImageBlock: null
          }
        ]
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      expect(result.current.initialValues).toEqual({
        title: 'Hydrate Title',
        description: 'D',
        creatorName: 'C',
        creatorImageSrc: 'https://img/x.png',
        creatorImageAlt: 'alt',
        media: linkForm('https://www.youtube-nocookie.com/embed/x'),
        slug: 'hydrate-slug',
        journeyIds: ['j1', 'j2']
      })
      expect(result.current.isPublished).toBe(true)
    })

    it('hydrates an existing mux row, seeding the real videoId and both denormalized fields', () => {
      const collection = makeCollection({
        media: muxMedia('pb-9', 'My clip', 125, 'vid-9')
      })
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )
      expect(result.current.initialValues.media).toEqual({
        type: TemplateGalleryPageMediaType.mux,
        url: '',
        muxVideoId: 'vid-9',
        muxPlaybackId: 'pb-9',
        muxName: 'My clip',
        muxDuration: 125
      })
    })

    it('seeds BOTH slots when the row retains a parked payload', () => {
      const collection = makeCollection({
        media: {
          __typename: 'TemplateGalleryPageMedia',
          id: 'media-1',
          type: TemplateGalleryPageMediaType.link,
          embedUrl: 'https://x.test/a',
          muxVideoId: 'vid-parked',
          muxPlaybackId: 'pb-parked',
          muxName: null,
          muxDuration: null
        }
      })
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )
      expect(result.current.initialValues.media).toMatchObject({
        type: TemplateGalleryPageMediaType.link,
        url: 'https://x.test/a',
        muxVideoId: 'vid-parked',
        muxPlaybackId: 'pb-parked'
      })
    })
  })

  describe('schema', () => {
    it('rejects an empty title and accepts a valid form', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      await expect(
        result.current.schema.validate(defaultValues({ title: '' }))
      ).rejects.toThrow()
      await expect(
        result.current.schema.validate(defaultValues())
      ).resolves.toBeTruthy()
    })

    it('accepts every media state, including empty active slots (they render nothing)', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      // No media completeness rule anymore: none, a link (with or without a
      // URL), and a mux slot (with or without an id) all pass — the server
      // validates real URLs and an empty active slot simply renders nothing.
      for (const media of [
        NONE,
        linkForm('https://x.test/a'),
        linkForm(''),
        muxForm({ muxVideoId: 'vid-1' }),
        muxForm({ muxVideoId: '', muxPlaybackId: 'pb-1' }),
        muxForm()
      ]) {
        await expect(
          result.current.schema.validate(defaultValues({ media }))
        ).resolves.toBeTruthy()
      }
    })

    it('rejects slugs with uppercase or invalid characters', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      await expect(
        result.current.schema.validate(defaultValues({ slug: 'BadSlug' }))
      ).rejects.toThrow()
      await expect(
        result.current.schema.validate(defaultValues({ slug: 'good-slug-1' }))
      ).resolves.toBeTruthy()
    })

    it('accepts an empty slug — create mode does not render the slug field and the server generates one', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      await expect(
        result.current.schema.validate(defaultValues({ slug: '' }))
      ).resolves.toBeTruthy()
    })
  })

  describe('handleSubmit — create branch', () => {
    it('fires templateGalleryPageCreate with mapped input (media omitted when none) and closes', async () => {
      const onClose = vi.fn()
      const createMock = getTemplateGalleryPageCreateMock({
        input: {
          teamId: 'team-1',
          title: 'New',
          creatorName: 'C',
          creatorImageSrc: null,
          creatorImageAlt: null,
          description: null,
          journeyIds: ['j1']
        }
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose
          }),
        { wrapper: wrapperWithMocks([createMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          defaultValues({
            title: 'New',
            creatorName: 'C',
            journeyIds: ['j1']
          }),
          fakeHelpers()
        )
      })

      expect(createMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Collection created',
        expect.objectContaining({ variant: 'success' })
      )
    })
  })

  describe('handleSubmit — update branch', () => {
    it('sends only the changed fields (diff vs original)', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-7',
        title: 'Old',
        description: 'Old desc',
        slug: 'old-slug',
        creatorName: 'Old',
        status: TemplateGalleryPageStatus.published,
        templates: [
          {
            __typename: 'TemplateGalleryItem',
            id: 'j1',
            title: 'A',
            primaryImageBlock: null
          }
        ]
      })

      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-7',
        input: {
          title: 'New title',
          journeyIds: ['j1', 'j2']
        }
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: 'New title',
            description: 'Old desc',
            creatorName: 'Old',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: NONE,
            slug: 'old-slug',
            journeyIds: ['j1', 'j2']
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Collection updated',
        expect.objectContaining({ variant: 'success' })
      )
    })

    it('sends description as empty string when the user clears a non-empty description', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-8',
        title: 'Title',
        description: 'Old desc',
        slug: 'slug',
        creatorName: 'Creator'
      })

      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-8',
        input: { description: '' }
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: collection.title,
            description: '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: NONE,
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('omits journeyIds when membership is unchanged', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-7',
        title: 'Old',
        templates: [
          {
            __typename: 'TemplateGalleryItem',
            id: 'j1',
            title: 'A',
            primaryImageBlock: null
          },
          {
            __typename: 'TemplateGalleryItem',
            id: 'j2',
            title: 'B',
            primaryImageBlock: null
          }
        ]
      })

      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-7',
        input: { title: 'New title' }
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: 'New title',
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: NONE,
            slug: collection.slug,
            journeyIds: ['j1', 'j2']
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalled()
    })

    // NES-1698: the template-add analytics event must fire once per id the
    // save actually added (diffed against the persisted templates), and
    // never for reorders — lock the wiring in so a refactor can't silently
    // over/under-count adds.
    describe('analytics wiring (NES-1698)', () => {
      const templatesJ1J2: TemplateGalleryPage['templates'] = [
        {
          __typename: 'TemplateGalleryItem',
          id: 'j1',
          title: 'A',
          primaryImageBlock: null
        },
        {
          __typename: 'TemplateGalleryItem',
          id: 'j2',
          title: 'B',
          primaryImageBlock: null
        }
      ]

      function valuesWithJourneyIds(
        collection: TemplateGalleryPage,
        journeyIds: string[]
      ): CollectionFormValues {
        return {
          title: collection.title,
          description: collection.description ?? '',
          creatorName: collection.creatorName ?? '',
          creatorImageSrc: '',
          creatorImageAlt: '',
          media: NONE,
          slug: collection.slug,
          journeyIds
        }
      }

      beforeEach(() => {
        mockSendCollectionTemplateAddEvent.mockClear()
      })

      it('fires one template-add event per template the save actually added', async () => {
        const collection = makeCollection({
          id: 'page-7',
          templates: templatesJ1J2
        })
        const updateMock = getTemplateGalleryPageUpdateMock({
          id: 'page-7',
          input: { journeyIds: ['j1', 'j2', 'j3'] }
        })

        const { result } = renderHook(
          () =>
            useCollectionForm({
              mode: 'edit',
              teamId: 'team-1',
              collection,
              onClose: vi.fn()
            }),
          { wrapper: wrapperWithMocks([updateMock]) }
        )

        await act(async () => {
          await result.current.handleSubmit(
            valuesWithJourneyIds(collection, ['j1', 'j2', 'j3']),
            fakeHelpers()
          )
        })

        expect(updateMock.result).toHaveBeenCalledTimes(1)
        expect(mockSendCollectionTemplateAddEvent).toHaveBeenCalledTimes(1)
        expect(mockSendCollectionTemplateAddEvent).toHaveBeenCalledWith({
          collectionId: 'page-7',
          templateId: 'j3'
        })
      })

      it('fires no template-add event for a pure reorder', async () => {
        const collection = makeCollection({
          id: 'page-7',
          templates: templatesJ1J2
        })
        const updateMock = getTemplateGalleryPageUpdateMock({
          id: 'page-7',
          input: { journeyIds: ['j2', 'j1'] }
        })

        const { result } = renderHook(
          () =>
            useCollectionForm({
              mode: 'edit',
              teamId: 'team-1',
              collection,
              onClose: vi.fn()
            }),
          { wrapper: wrapperWithMocks([updateMock]) }
        )

        await act(async () => {
          await result.current.handleSubmit(
            valuesWithJourneyIds(collection, ['j2', 'j1']),
            fakeHelpers()
          )
        })

        expect(updateMock.result).toHaveBeenCalledTimes(1)
        expect(mockSendCollectionTemplateAddEvent).not.toHaveBeenCalled()
      })

      it('fires one add event for the added id when a save adds one template and removes another', async () => {
        const collection = makeCollection({
          id: 'page-7',
          templates: templatesJ1J2
        })
        const updateMock = getTemplateGalleryPageUpdateMock({
          id: 'page-7',
          input: { journeyIds: ['j1', 'j3'] }
        })

        const { result } = renderHook(
          () =>
            useCollectionForm({
              mode: 'edit',
              teamId: 'team-1',
              collection,
              onClose: vi.fn()
            }),
          { wrapper: wrapperWithMocks([updateMock]) }
        )

        await act(async () => {
          await result.current.handleSubmit(
            valuesWithJourneyIds(collection, ['j1', 'j3']),
            fakeHelpers()
          )
        })

        expect(updateMock.result).toHaveBeenCalledTimes(1)
        expect(mockSendCollectionTemplateAddEvent).toHaveBeenCalledTimes(1)
        expect(mockSendCollectionTemplateAddEvent).toHaveBeenCalledWith({
          collectionId: 'page-7',
          templateId: 'j3'
        })
      })
    })

    it('skips slug from the update input when the user cleared the field (does not rename to empty)', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-7',
        title: 'Old',
        slug: 'old-slug',
        status: TemplateGalleryPageStatus.published
      })
      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-7',
        input: { title: 'New title' }
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: 'New title',
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: NONE,
            slug: '',
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('handleSubmit — error mapping', () => {
    it('maps a graphQLErrors[0].extensions.field to a Formik field error for known fields', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-9',
        slug: 'old-slug'
      })

      const errorMock: MockedResponse = {
        request: {
          query: TEMPLATE_GALLERY_PAGE_UPDATE,
          variables: { id: 'page-9', input: { slug: 'new-slug' } }
        },
        result: {
          errors: [
            new GraphQLError('Slug already taken', {
              extensions: { field: 'slug' }
            })
          ]
        }
      }

      const helpers = fakeHelpers()

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([errorMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: collection.title,
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: NONE,
            slug: 'new-slug',
            journeyIds: []
          },
          helpers
        )
      })

      expect(helpers.setFieldTouched).toHaveBeenCalledWith('slug', true, false)
      expect(helpers.setFieldError).toHaveBeenCalledWith(
        'slug',
        expect.stringMatching(/slug already taken/i)
      )
      expect(onClose).not.toHaveBeenCalled()
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
    })

    it('falls back to a snackbar when the field is unknown', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-10',
        title: 'Old'
      })

      const errorMock: MockedResponse = {
        request: {
          query: TEMPLATE_GALLERY_PAGE_UPDATE,
          variables: { id: 'page-10', input: { title: 'New' } }
        },
        result: {
          errors: [
            new GraphQLError('Something exploded', {
              extensions: { field: 'somethingElse' }
            })
          ]
        }
      }

      const helpers = fakeHelpers()

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([errorMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: 'New',
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: NONE,
            slug: collection.slug,
            journeyIds: []
          },
          helpers
        )
      })

      expect(helpers.setFieldError).not.toHaveBeenCalled()
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringMatching(/something exploded/i),
        expect.objectContaining({ variant: 'error' })
      )
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('handleSubmit — media', () => {
    it('sends new mux media on create', async () => {
      const onClose = vi.fn()
      const createMock = getTemplateGalleryPageCreateMock({
        input: {
          teamId: 'team-1',
          title: 'New',
          creatorName: 'Creator',
          creatorImageSrc: null,
          creatorImageAlt: null,
          description: null,
          media: {
            type: TemplateGalleryPageMediaType.mux,
            muxVideoId: 'vid-1'
          },
          journeyIds: []
        }
      })

      const { result } = renderHook(
        () => useCollectionForm({ mode: 'create', teamId: 'team-1', onClose }),
        { wrapper: wrapperWithMocks([createMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          defaultValues({
            title: 'New',
            media: muxForm({ muxVideoId: 'vid-1' })
          }),
          fakeHelpers()
        )
      })

      expect(createMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('sends a changed link with the update — links save on Save, not out of band', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-1',
        media: linkMedia('https://old.test/embed')
      })
      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-1',
        input: {
          title: 'New Title',
          media: {
            type: TemplateGalleryPageMediaType.link,
            url: 'https://new.test/x'
          }
        }
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: 'New Title',
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: linkForm('https://new.test/x'),
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalled()
    })

    it('sends url:null when the user clears the link field (type stays link)', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-1',
        media: linkMedia('https://old.test/embed')
      })
      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-1',
        input: {
          media: { type: TemplateGalleryPageMediaType.link, url: null }
        }
      })
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: collection.title,
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: linkForm(''),
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('sends only type:none when the user toggles None on a saved link (slot retained)', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-1',
        media: linkMedia('https://old.test/embed')
      })
      // Picking None keeps the link slot (so the user can switch back), so the
      // url is unchanged and omitted — only the type is sent.
      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-1',
        input: { media: { type: TemplateGalleryPageMediaType.none } }
      })
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: collection.title,
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: {
              ...linkForm('https://old.test/embed'),
              type: TemplateGalleryPageMediaType.none
            },
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('sends muxVideoId:null when the user removes an existing upload', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-1',
        media: muxMedia('pb-1', null, null, 'vid-1')
      })
      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-1',
        input: {
          media: { type: TemplateGalleryPageMediaType.mux, muxVideoId: null }
        }
      })
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: collection.title,
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: muxForm({ muxVideoId: '', muxPlaybackId: null }),
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does NOT resend an untouched existing upload', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-1',
        media: muxMedia('pb-1', null, null, 'vid-1')
      })
      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-1',
        input: { title: 'New Title' }
      })
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: 'New Title',
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            // The seeded, untouched form value: the real videoId + playbackId.
            media: muxForm({ muxVideoId: 'vid-1', muxPlaybackId: 'pb-1' }),
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalled()
    })

    it('advances the persisted baseline so a second identical save omits media', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-1',
        media: linkMedia('https://old.test/embed')
      })
      // Single-use mock: it matches ONLY a media-bearing update. The first save
      // consumes it; if the baseline did NOT advance, the second save would
      // re-send the same media input, find no matching mock, and fail.
      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-1',
        input: {
          media: {
            type: TemplateGalleryPageMediaType.link,
            url: 'https://new.test/x'
          }
        }
      })
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      const values = {
        title: collection.title,
        description: collection.description ?? '',
        creatorName: collection.creatorName ?? '',
        creatorImageSrc: '',
        creatorImageAlt: '',
        media: linkForm('https://new.test/x'),
        slug: collection.slug,
        journeyIds: []
      }
      // First save sends the changed link.
      await act(async () => {
        await result.current.handleSubmit(values, fakeHelpers())
      })
      expect(updateMock.result).toHaveBeenCalledTimes(1)

      // Second identical save: media now matches the advanced baseline, so it
      // is omitted, the input is empty, and no further mutation fires.
      await act(async () => {
        await result.current.handleSubmit(values, fakeHelpers())
      })
      expect(updateMock.result).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleSubmit — publish intent', () => {
    it('publishes after a publish-intent submit and resets the intent for the next one', async () => {
      const onClose = vi.fn()
      const onPublished = vi.fn()
      const collection = makeCollection({ id: 'page-1' })
      const publishMock = getTemplateGalleryPagePublishMock({ id: 'page-1' })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose,
            onPublished
          }),
        { wrapper: wrapperWithMocks([publishMock]) }
      )

      const untouchedValues = {
        title: collection.title,
        description: collection.description ?? '',
        creatorName: collection.creatorName ?? '',
        creatorImageSrc: '',
        creatorImageAlt: '',
        media: NONE,
        slug: collection.slug,
        journeyIds: []
      }
      await act(async () => {
        result.current.setSubmitIntent('publish')
        await result.current.handleSubmit(untouchedValues, fakeHelpers())
      })

      expect(publishMock.result).toHaveBeenCalledTimes(1)
      expect(onPublished).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'page-1',
          status: TemplateGalleryPageStatus.published
        })
      )
      expect(onClose).toHaveBeenCalledTimes(1)

      await act(async () => {
        await result.current.handleSubmit(untouchedValues, fakeHelpers())
      })
      expect(publishMock.result).toHaveBeenCalledTimes(1)
    })

    it('does not leak a publish intent through a short-circuited submit', async () => {
      const onClose = vi.fn()
      const onPublished = vi.fn()
      const collection = makeCollection({ id: 'page-1' })
      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-1',
        input: { title: 'New Title' }
      })

      const { result, rerender } = renderHook(
        (props: { parentBusy: boolean }) =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            parentBusy: props.parentBusy,
            onClose,
            onPublished
          }),
        {
          initialProps: { parentBusy: true },
          wrapper: wrapperWithMocks([updateMock])
        }
      )

      const values = {
        title: 'New Title',
        description: collection.description ?? '',
        creatorName: collection.creatorName ?? '',
        creatorImageSrc: '',
        creatorImageAlt: '',
        media: NONE,
        slug: collection.slug,
        journeyIds: []
      }
      await act(async () => {
        result.current.setSubmitIntent('publish')
        await result.current.handleSubmit(values, fakeHelpers())
      })
      expect(onPublished).not.toHaveBeenCalled()

      rerender({ parentBusy: false })
      await act(async () => {
        await result.current.handleSubmit(values, fakeHelpers())
      })
      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onPublished).not.toHaveBeenCalled()
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not publish on a plain submit (default save intent)', async () => {
      const onClose = vi.fn()
      const onPublished = vi.fn()
      const collection = makeCollection({ id: 'page-1' })
      const updateMock = getTemplateGalleryPageUpdateMock({
        id: 'page-1',
        input: { title: 'New Title' }
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose,
            onPublished
          }),
        { wrapper: wrapperWithMocks([updateMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: 'New Title',
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: NONE,
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onPublished).not.toHaveBeenCalled()
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleSubmit — media validation errors', () => {
    it('maps a backend media reason to an inline media field error and stays open', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({ id: 'page-1' })
      const errorMock: MockedResponse = {
        request: {
          query: TEMPLATE_GALLERY_PAGE_UPDATE,
          variables: {
            id: 'page-1',
            input: {
              media: {
                type: TemplateGalleryPageMediaType.link,
                url: 'https://youtu.be/p'
              }
            }
          }
        },
        result: {
          errors: [
            new GraphQLError('This video is private', {
              extensions: { code: 'BAD_USER_INPUT', reason: 'YOUTUBE_PRIVATE' }
            })
          ]
        }
      }

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([errorMock]) }
      )

      const helpers = fakeHelpers()
      await act(async () => {
        await result.current.handleSubmit(
          {
            title: collection.title,
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: linkForm('https://youtu.be/p'),
            slug: collection.slug,
            journeyIds: []
          },
          helpers
        )
      })

      expect(helpers.setFieldError).toHaveBeenCalledWith(
        'media',
        expect.stringMatching(/private/i)
      )
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('mediaDirty', () => {
    it('is true for an edited link and false for the untouched saved value', () => {
      const collection = makeCollection({
        id: 'page-1',
        media: linkMedia('https://x.test/embed')
      })
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      expect(
        result.current.mediaDirty(
          defaultValues({ media: linkForm('https://x.test/embed') })
        )
      ).toBe(false)
      expect(
        result.current.mediaDirty(
          defaultValues({ media: linkForm('https://new.test/y') })
        )
      ).toBe(true)
      // Toggling None on the saved link is also unsaved until Save.
      expect(
        result.current.mediaDirty(
          defaultValues({
            media: {
              ...linkForm('https://x.test/embed'),
              type: TemplateGalleryPageMediaType.none
            }
          })
        )
      ).toBe(true)
    })

    it('treats any pending media as dirty in create mode', () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      expect(result.current.mediaDirty(defaultValues({ media: NONE }))).toBe(
        false
      )
      expect(
        result.current.mediaDirty(
          defaultValues({ media: muxForm({ muxVideoId: 'vid-1' }) })
        )
      ).toBe(true)
    })
  })

  describe('handleSubmit — parentBusy short-circuit', () => {
    it('does not fire any mutation and shows an info snackbar', async () => {
      const onClose = vi.fn()
      const createMock = getTemplateGalleryPageCreateMock({
        input: {
          teamId: 'team-1',
          title: 'New',
          creatorName: '',
          creatorImageSrc: null,
          creatorImageAlt: null,
          description: null,
          journeyIds: []
        }
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            parentBusy: true,
            onClose
          }),
        { wrapper: wrapperWithMocks([createMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          defaultValues({ title: 'New' }),
          fakeHelpers()
        )
      })

      expect(createMock.result).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringMatching(/finishing previous action/i),
        expect.objectContaining({ variant: 'info' })
      )
    })
  })
})
