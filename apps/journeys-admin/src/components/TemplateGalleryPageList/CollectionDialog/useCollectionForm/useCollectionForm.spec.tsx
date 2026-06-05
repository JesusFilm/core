import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'
import { FormikHelpers } from 'formik'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactNode } from 'react'

import {
  GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage,
  GetTemplateGalleryPages_templateGalleryPages_media as TemplateGalleryPageMedia
} from '../../../../../__generated__/GetTemplateGalleryPages'
import {
  TemplateGalleryPageMediaType,
  TemplateGalleryPageStatus
} from '../../../../../__generated__/globalTypes'
import { getTemplateGalleryPageCreateMock } from '../../../../libs/useTemplateGalleryPageCreateMutation/useTemplateGalleryPageCreateMutation.mock'
import { TEMPLATE_GALLERY_PAGE_UPDATE } from '../../../../libs/useTemplateGalleryPageUpdateMutation/useTemplateGalleryPageUpdateMutation'
import { getTemplateGalleryPageUpdateMock } from '../../../../libs/useTemplateGalleryPageUpdateMutation/useTemplateGalleryPageUpdateMutation.mock'

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
    media: { type: 'none' },
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
    muxPlaybackId: null,
    muxName: null,
    muxDuration: null
  }
}

function muxMedia(
  muxPlaybackId: string,
  muxName: string | null = null,
  muxDuration: number | null = null
): TemplateGalleryPageMedia {
  return {
    __typename: 'TemplateGalleryPageMedia',
    id: 'media-1',
    type: TemplateGalleryPageMediaType.mux,
    embedUrl: null,
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
        media: { type: 'none' },
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
        media: {
          type: 'link',
          url: 'https://www.youtube-nocookie.com/embed/x'
        },
        slug: 'hydrate-slug',
        journeyIds: ['j1', 'j2']
      })
      expect(result.current.isPublished).toBe(true)
    })

    it('hydrates an existing mux row, seeding playbackId with an empty videoId', () => {
      const collection = makeCollection({
        media: muxMedia('pb-9', 'My clip', 125)
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
        type: 'mux',
        muxVideoId: '',
        muxPlaybackId: 'pb-9',
        muxName: 'My clip',
        muxDuration: 125
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

    it('accepts a complete media value and rejects an incomplete one', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      // none, a link with a URL, and a completed mux upload all pass.
      await expect(
        result.current.schema.validate(defaultValues({ media: { type: 'none' } }))
      ).resolves.toBeTruthy()
      await expect(
        result.current.schema.validate(
          defaultValues({ media: { type: 'link', url: 'https://x.test/a' } })
        )
      ).resolves.toBeTruthy()
      await expect(
        result.current.schema.validate(
          defaultValues({ media: { type: 'mux', muxVideoId: 'vid-1' } })
        )
      ).resolves.toBeTruthy()
      // An existing mux row is valid via its persisted playbackId even
      // though the form's muxVideoId is empty.
      await expect(
        result.current.schema.validate(
          defaultValues({
            media: { type: 'mux', muxVideoId: '', muxPlaybackId: 'pb-1' }
          })
        )
      ).resolves.toBeTruthy()

      // An empty link URL and a pending upload (no id) are rejected.
      await expect(
        result.current.schema.validate(
          defaultValues({ media: { type: 'link', url: '' } })
        )
      ).rejects.toThrow()
      await expect(
        result.current.schema.validate(
          defaultValues({ media: { type: 'mux', muxVideoId: '' } })
        )
      ).rejects.toThrow()
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
    it('fires templateGalleryPageCreate with mapped input and closes the dialog', async () => {
      const onClose = vi.fn()
      const createMock = getTemplateGalleryPageCreateMock({
        input: {
          teamId: 'team-1',
          title: 'New',
          creatorName: 'C',
          creatorImageSrc: null,
          creatorImageAlt: null,
          description: null,
          media: null,
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

      // Only title and journeyIds change. Other fields stay the same and
      // must NOT appear in the input.
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
            media: { type: 'none' },
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
            media: { type: 'none' },
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
            media: { type: 'none' },
            slug: collection.slug,
            journeyIds: ['j1', 'j2']
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalled()
    })

    it('skips slug from the update input when the user cleared the field (does not rename to empty)', async () => {
      // P0-A regression guard. yup's `excludeEmptyString` lets an empty
      // slug pass validation (so create-mode's empty default doesn't
      // error), but we MUST NOT send `input.slug = ''` to the server —
      // it would rename the published page to an empty slug and break
      // every external link. The submit diff must drop the field when
      // the user cleared it.
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-7',
        title: 'Old',
        slug: 'old-slug',
        status: TemplateGalleryPageStatus.published
      })
      // The mock matches ONLY when the input contains title and no slug.
      // If the empty slug leaks through into the input, MockedProvider
      // will not find a matching mock and the spec fails.
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
            media: { type: 'none' },
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
            media: { type: 'none' },
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
            media: { type: 'none' },
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
          media: { type: TemplateGalleryPageMediaType.mux, muxVideoId: 'vid-1' },
          journeyIds: []
        }
      })

      const { result } = renderHook(
        () =>
          useCollectionForm({ mode: 'create', teamId: 'team-1', onClose }),
        { wrapper: wrapperWithMocks([createMock]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          defaultValues({
            title: 'New',
            media: { type: 'mux', muxVideoId: 'vid-1' }
          }),
          fakeHelpers()
        )
      })

      expect(createMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does NOT send media on update — it is persisted out of band', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-1',
        media: linkMedia('https://old.test/embed')
      })
      // Only the title diffs; media differs too but must be omitted from the
      // update input (media is saved via persistMedia, not the dialog Save).
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
            media: { type: 'link', url: 'https://new.test/x' },
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      // The mock only matches a title-only input — if media leaked into the
      // input the request wouldn't match and result would never fire.
      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalled()
    })

    it('does not fire an update at all when only media changed', async () => {
      const onClose = vi.fn()
      const collection = makeCollection({
        id: 'page-1',
        media: linkMedia('https://old.test/embed')
      })
      // No update mock registered: if handleSubmit fired one, MockedProvider
      // would error on the unmatched request.
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            onClose
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      await act(async () => {
        await result.current.handleSubmit(
          {
            title: collection.title,
            description: collection.description ?? '',
            creatorName: collection.creatorName ?? '',
            creatorImageSrc: '',
            creatorImageAlt: '',
            media: { type: 'none' },
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(mockEnqueueSnackbar).not.toHaveBeenCalledWith(
        expect.stringMatching(/updated/i),
        expect.anything()
      )
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('persistMedia', () => {
    it('is a no-op in create mode (no row to update yet)', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({ mode: 'create', teamId: 'team-1', onClose: vi.fn() }),
        { wrapper: wrapperWithMocks([]) }
      )

      let outcome: unknown
      await act(async () => {
        outcome = await result.current.persistMedia({
          type: 'link',
          url: 'https://canva.com/x'
        })
      })
      expect(outcome).toEqual({})
    })

    it('persists a link immediately and returns the server-normalized media', async () => {
      const collection = makeCollection({ id: 'page-1' })
      const updateMock = getTemplateGalleryPageUpdateMock(
        {
          id: 'page-1',
          input: {
            media: {
              type: TemplateGalleryPageMediaType.link,
              url: 'https://canva.com/x'
            }
          }
        },
        {
          media: {
            __typename: 'TemplateGalleryPageMedia',
            id: 'm1',
            type: TemplateGalleryPageMediaType.link,
            embedUrl: 'https://canva.com/embed/x',
            muxPlaybackId: null,
            muxName: null,
            muxDuration: null
          }
        }
      )

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

      let outcome: unknown
      await act(async () => {
        outcome = await result.current.persistMedia({
          type: 'link',
          url: 'https://canva.com/x'
        })
      })
      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(outcome).toEqual({
        media: { type: 'link', url: 'https://canva.com/embed/x' }
      })
    })

    it('clears the media row when committing none', async () => {
      const collection = makeCollection({
        id: 'page-1',
        media: linkMedia('https://old.test/embed')
      })
      const updateMock = getTemplateGalleryPageUpdateMock(
        { id: 'page-1', input: { media: null } },
        { media: null }
      )

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

      let outcome: unknown
      await act(async () => {
        outcome = await result.current.persistMedia({ type: 'none' })
      })
      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(outcome).toEqual({ media: { type: 'none' } })
    })

    it('is a no-op when the committed value matches what is already saved', async () => {
      const collection = makeCollection({
        id: 'page-1',
        media: linkMedia('https://x.test/embed')
      })
      // No update mock — re-committing the saved value must not hit the network.
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

      let outcome: unknown
      await act(async () => {
        outcome = await result.current.persistMedia({
          type: 'link',
          url: 'https://x.test/embed'
        })
      })
      expect(outcome).toEqual({})
    })

    it('returns a translated inline error on a backend media reason', async () => {
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
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([errorMock]) }
      )

      let outcome: { media?: unknown; error?: string } = {}
      await act(async () => {
        outcome = await result.current.persistMedia({
          type: 'link',
          url: 'https://youtu.be/p'
        })
      })
      expect(outcome.media).toBeUndefined()
      expect(outcome.error).toMatch(/private/i)
    })

    it('short-circuits with an info snackbar when the parent is busy', async () => {
      const collection = makeCollection({ id: 'page-1' })
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'edit',
            teamId: 'team-1',
            collection,
            parentBusy: true,
            onClose: vi.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      let outcome: unknown
      await act(async () => {
        outcome = await result.current.persistMedia({
          type: 'link',
          url: 'https://canva.com/x'
        })
      })
      expect(outcome).toEqual({})
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringMatching(/finishing previous action/i),
        expect.objectContaining({ variant: 'info' })
      )
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
          media: null,
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
