import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'
import { FormikHelpers } from 'formik'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactNode } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../../__generated__/globalTypes'
import { getTemplateGalleryPageCreateMock } from '../../../../libs/useTemplateGalleryPageCreateMutation/useTemplateGalleryPageCreateMutation.mock'
import { TEMPLATE_GALLERY_PAGE_UPDATE } from '../../../../libs/useTemplateGalleryPageUpdateMutation/useTemplateGalleryPageUpdateMutation'
import { getTemplateGalleryPageUpdateMock } from '../../../../libs/useTemplateGalleryPageUpdateMutation/useTemplateGalleryPageUpdateMutation.mock'

import { CollectionFormValues, useCollectionForm } from './useCollectionForm'

const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => {
  const actual = jest.requireActual('notistack')
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: mockEnqueueSnackbar,
      closeSnackbar: jest.fn()
    })
  }
})

const mockRevalidate = jest.fn(async () => undefined)
jest.mock('../../../../libs/useRevalidateTemplateGallery', () => ({
  useRevalidateTemplateGallery: () => mockRevalidate
}))

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
    mediaUrl: '',
    slug: 'my-collection',
    journeyIds: [],
    ...overrides
  }
}

function fakeHelpers(): FormikHelpers<CollectionFormValues> {
  return {
    setFieldError: jest.fn(),
    setFieldTouched: jest.fn().mockResolvedValue(undefined),
    setFieldValue: jest.fn().mockResolvedValue(undefined),
    setSubmitting: jest.fn(),
    setStatus: jest.fn(),
    setErrors: jest.fn(),
    setTouched: jest.fn().mockResolvedValue(undefined),
    setValues: jest.fn().mockResolvedValue(undefined),
    resetForm: jest.fn(),
    validateForm: jest.fn().mockResolvedValue({}),
    validateField: jest.fn(),
    submitForm: jest.fn().mockResolvedValue(undefined)
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
    mediaUrl: null,
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
    mockRevalidate.mockClear()
  })

  describe('initialValues', () => {
    it('returns empty defaults when no collection is provided (create mode)', () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: jest.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      expect(result.current.initialValues).toEqual({
        title: '',
        description: '',
        creatorName: '',
        creatorImageSrc: '',
        creatorImageAlt: '',
        mediaUrl: '',
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
        mediaUrl: 'https://m/x',
        status: TemplateGalleryPageStatus.published,
        templates: [
          {
            __typename: 'Journey',
            id: 'j1',
            title: 'A',
            primaryImageBlock: null
          },
          {
            __typename: 'Journey',
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
            onClose: jest.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      expect(result.current.initialValues).toEqual({
        title: 'Hydrate Title',
        description: 'D',
        creatorName: 'C',
        creatorImageSrc: 'https://img/x.png',
        creatorImageAlt: 'alt',
        mediaUrl: 'https://m/x',
        slug: 'hydrate-slug',
        journeyIds: ['j1', 'j2']
      })
      expect(result.current.isPublished).toBe(true)
    })
  })

  describe('schema', () => {
    it('rejects an empty title and accepts a valid form', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: jest.fn()
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

    it('only accepts Canva and Google Slides URLs for mediaUrl (NES-1649)', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: jest.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      // Reject anything else, even valid https URLs — the render layer
      // only knows how to embed Canva and Google Slides.
      await expect(
        result.current.schema.validate(
          defaultValues({ mediaUrl: 'http://insecure.example' })
        )
      ).rejects.toThrow(/canva or google slides/i)
      await expect(
        result.current.schema.validate(
          defaultValues({ mediaUrl: 'https://www.youtube.com/watch?v=abc' })
        )
      ).rejects.toThrow(/canva or google slides/i)
      await expect(
        result.current.schema.validate(
          defaultValues({ mediaUrl: 'https://www.loom.com/share/abc' })
        )
      ).rejects.toThrow(/canva or google slides/i)

      // Accept real-world Canva share URLs with utm tags / extra params —
      // intentionally more permissive than the Strategy section's regex.
      await expect(
        result.current.schema.validate(
          defaultValues({
            mediaUrl: 'https://www.canva.com/design/DAHJBsAPHB4/view'
          })
        )
      ).resolves.toBeTruthy()
      await expect(
        result.current.schema.validate(
          defaultValues({
            mediaUrl:
              'https://www.canva.com/design/DAHJBsAPHB4/view?utm_content=DAHJBsAPHB4&utm_campaign=designshare'
          })
        )
      ).resolves.toBeTruthy()

      // Accept Google Slides /pub URLs regardless of query-param order.
      await expect(
        result.current.schema.validate(
          defaultValues({
            mediaUrl:
              'https://docs.google.com/presentation/d/e/2PACX-1vS/pub?start=true&loop=false&delayms=3000'
          })
        )
      ).resolves.toBeTruthy()
      await expect(
        result.current.schema.validate(
          defaultValues({
            mediaUrl:
              'https://docs.google.com/presentation/d/e/2PACX-1vS/pub?delayms=3000&loop=true&start=false'
          })
        )
      ).resolves.toBeTruthy()
    })

    it('rejects mediaUrl values with whitespace or trailing junk that bypass a loose prefix match', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: jest.fn()
          }),
        { wrapper: wrapperWithMocks([]) }
      )

      // Whitespace anywhere — would be invalid as an iframe src.
      await expect(
        result.current.schema.validate(
          defaultValues({
            mediaUrl: 'https://www.canva.com/design/DAH JBsAPHB4/view'
          })
        )
      ).rejects.toThrow(/canva or google slides/i)

      // Non-canva host smuggled past a non-anchored regex via newline.
      await expect(
        result.current.schema.validate(
          defaultValues({
            mediaUrl:
              'https://www.canva.com/design/x\nhttps://attacker.example/exploit'
          })
        )
      ).rejects.toThrow(/canva or google slides/i)

      // Trailing fragment / query is fine when it stays in the allowed char
      // set; junk that includes a quote or angle bracket is rejected.
      await expect(
        result.current.schema.validate(
          defaultValues({
            mediaUrl:
              'https://www.canva.com/design/DAHJBsAPHB4/view"><script>alert(1)</script>'
          })
        )
      ).rejects.toThrow(/canva or google slides/i)
    })

    it('rejects slugs with uppercase or invalid characters', async () => {
      const { result } = renderHook(
        () =>
          useCollectionForm({
            mode: 'create',
            teamId: 'team-1',
            onClose: jest.fn()
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
            onClose: jest.fn()
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
      const onClose = jest.fn()
      const createMock = getTemplateGalleryPageCreateMock({
        input: {
          teamId: 'team-1',
          title: 'New',
          creatorName: 'C',
          creatorImageSrc: null,
          creatorImageAlt: null,
          description: null,
          mediaUrl: null,
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
      const onClose = jest.fn()
      const collection = makeCollection({
        id: 'page-7',
        title: 'Old',
        description: 'Old desc',
        slug: 'old-slug',
        creatorName: 'Old',
        status: TemplateGalleryPageStatus.published,
        templates: [
          {
            __typename: 'Journey',
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
            mediaUrl: '',
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
      // Revalidate the pre-update slug (caller-known) and the post-update
      // slug from the server response. Hook dedupes inside.
      expect(mockRevalidate).toHaveBeenCalledTimes(1)
      expect(mockRevalidate).toHaveBeenCalledWith(['old-slug', 'my-collection'])
    })

    it('omits journeyIds when membership is unchanged', async () => {
      const onClose = jest.fn()
      const collection = makeCollection({
        id: 'page-7',
        title: 'Old',
        templates: [
          {
            __typename: 'Journey',
            id: 'j1',
            title: 'A',
            primaryImageBlock: null
          },
          {
            __typename: 'Journey',
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
            mediaUrl: '',
            slug: collection.slug,
            journeyIds: ['j1', 'j2']
          },
          fakeHelpers()
        )
      })

      expect(updateMock.result).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalled()
      // Default makeCollection status is `draft` — edits to a draft have
      // no live public page to bust, so revalidate should not fire.
      expect(mockRevalidate).not.toHaveBeenCalled()
    })

    it('revalidates when the server response reports published, even if the cached status was draft (concurrent-publish race)', async () => {
      // Cached pre-mutation status is draft (the default). The server
      // response overrides to `published`, simulating a sibling-tab
      // publish that landed between cache hydration and submit.
      const onClose = jest.fn()
      const collection = makeCollection({
        id: 'page-7',
        title: 'Old',
        slug: 'old-slug',
        status: TemplateGalleryPageStatus.draft
      })
      const updateMock = getTemplateGalleryPageUpdateMock(
        {
          id: 'page-7',
          input: { title: 'New title' }
        },
        { status: TemplateGalleryPageStatus.published }
      )

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
            mediaUrl: '',
            slug: collection.slug,
            journeyIds: []
          },
          fakeHelpers()
        )
      })

      expect(mockRevalidate).toHaveBeenCalledTimes(1)
      expect(mockRevalidate).toHaveBeenCalledWith(['old-slug', 'my-collection'])
    })
  })

  describe('handleSubmit — error mapping', () => {
    it('maps a graphQLErrors[0].extensions.field to a Formik field error for known fields', async () => {
      const onClose = jest.fn()
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
            mediaUrl: '',
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
      const onClose = jest.fn()
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
            mediaUrl: '',
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

  describe('handleSubmit — parentBusy short-circuit', () => {
    it('does not fire any mutation and shows an info snackbar', async () => {
      const onClose = jest.fn()
      const createMock = getTemplateGalleryPageCreateMock({
        input: {
          teamId: 'team-1',
          title: 'New',
          creatorName: '',
          creatorImageSrc: null,
          creatorImageAlt: null,
          description: null,
          mediaUrl: null,
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
