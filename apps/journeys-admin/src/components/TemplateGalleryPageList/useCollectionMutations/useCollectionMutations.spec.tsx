import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactNode } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../../__generated__/globalTypes'
import { TEMPLATE_GALLERY_PAGE_DELETE } from '../../../libs/useTemplateGalleryPageDeleteMutation/useTemplateGalleryPageDeleteMutation'
import { getTemplateGalleryPageDeleteMock } from '../../../libs/useTemplateGalleryPageDeleteMutation/useTemplateGalleryPageDeleteMutation.mock'
import { TEMPLATE_GALLERY_PAGE_PUBLISH } from '../../../libs/useTemplateGalleryPagePublishMutation/useTemplateGalleryPagePublishMutation'
import { getTemplateGalleryPagePublishMock } from '../../../libs/useTemplateGalleryPagePublishMutation/useTemplateGalleryPagePublishMutation.mock'
import { TEMPLATE_GALLERY_PAGE_UNPUBLISH } from '../../../libs/useTemplateGalleryPageUnpublishMutation/useTemplateGalleryPageUnpublishMutation'
import { getTemplateGalleryPageUnpublishMock } from '../../../libs/useTemplateGalleryPageUnpublishMutation/useTemplateGalleryPageUnpublishMutation.mock'

import { useCollectionMutations } from './useCollectionMutations'

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
jest.mock('../../../libs/useRevalidateTemplateGallery', () => ({
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

function makeCollection(
  overrides: Partial<TemplateGalleryPage> = {}
): TemplateGalleryPage {
  return {
    __typename: 'TemplateGalleryPage',
    id: 'page-1',
    title: 'My Collection',
    description: '',
    slug: 'old-slug',
    status: TemplateGalleryPageStatus.draft,
    creatorName: 'Creator',
    creatorImageSrc: null,
    creatorImageAlt: null,
    mediaUrl: null,
    publishedAt: null,
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
    templates: [],
    ...overrides
  }
}

describe('useCollectionMutations', () => {
  beforeEach(() => {
    mockEnqueueSnackbar.mockClear()
    mockRevalidate.mockClear()
  })

  describe('publish', () => {
    it('returns the collection with server-set fields merged in (status, publishedAt, updatedAt, slug)', async () => {
      const collection = makeCollection({ id: 'page-7', slug: 'old-slug' })
      const publishMock = getTemplateGalleryPagePublishMock({ id: 'page-7' })

      const { result } = renderHook(() => useCollectionMutations(), {
        wrapper: wrapperWithMocks([publishMock])
      })

      let resolved: TemplateGalleryPage | null = null
      await act(async () => {
        resolved = await result.current.publish(collection)
      })

      expect(publishMock.result).toHaveBeenCalledTimes(1)
      // Server-set fields take precedence over the input.
      expect(resolved).toEqual({
        ...collection,
        status: TemplateGalleryPageStatus.published,
        publishedAt: '2026-05-06T00:00:00Z',
        updatedAt: '2026-05-06T00:00:00Z',
        slug: 'collection'
      })
      // No success snackbar — the parent opens a success dialog instead.
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
      expect(result.current.busyId).toBe(null)
      // Revalidate is fired with both the pre-publish slug (caller's input)
      // and the post-publish slug (server response) so any change is covered.
      expect(mockRevalidate).toHaveBeenCalledTimes(1)
      expect(mockRevalidate).toHaveBeenCalledWith(['old-slug', 'collection'])
    })

    it('sets busyId to the collection id while in flight and clears on success', async () => {
      const collection = makeCollection({ id: 'page-7' })
      const publishMock = getTemplateGalleryPagePublishMock({ id: 'page-7' })

      const { result } = renderHook(() => useCollectionMutations(), {
        wrapper: wrapperWithMocks([publishMock])
      })

      let promise: Promise<TemplateGalleryPage | null>
      act(() => {
        promise = result.current.publish(collection)
      })

      await waitFor(() => {
        expect(result.current.busyId).toBe('page-7')
      })

      await act(async () => {
        await promise
      })

      // setBusyId(null) runs inside publish's finally block. React's state
      // update is enqueued but not necessarily visible by the time await
      // returns control — CI scheduling has been observed to race this. Use
      // waitFor so the assertion polls until the post-finally render lands.
      await waitFor(() => {
        expect(result.current.busyId).toBe(null)
      })
    })

    it('returns null and shows an error snackbar when the mutation fails', async () => {
      const collection = makeCollection({ id: 'page-7' })
      const errorMock: MockedResponse = {
        request: {
          query: TEMPLATE_GALLERY_PAGE_PUBLISH,
          variables: { id: 'page-7' }
        },
        result: {
          errors: [new GraphQLError('Backend exploded')]
        }
      }

      const { result } = renderHook(() => useCollectionMutations(), {
        wrapper: wrapperWithMocks([errorMock])
      })

      let resolved: TemplateGalleryPage | null = collection
      await act(async () => {
        resolved = await result.current.publish(collection)
      })

      expect(resolved).toBe(null)
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringMatching(/backend exploded/i),
        expect.objectContaining({ variant: 'error' })
      )
      expect(result.current.busyId).toBe(null)
    })
  })

  describe('unpublish', () => {
    it('revalidates and shows a success snackbar when unpublishing a published collection', async () => {
      const collection = makeCollection({
        id: 'page-7',
        status: TemplateGalleryPageStatus.published
      })
      const unpublishMock = getTemplateGalleryPageUnpublishMock({
        id: 'page-7'
      })

      const { result } = renderHook(() => useCollectionMutations(), {
        wrapper: wrapperWithMocks([unpublishMock])
      })

      await act(async () => {
        await result.current.unpublish(collection)
      })

      expect(unpublishMock.result).toHaveBeenCalledTimes(1)
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Collection unpublished',
        expect.objectContaining({ variant: 'success' })
      )
      expect(result.current.busyId).toBe(null)
      // Revalidate so the now-unpublished public URL stops serving the
      // cached page and falls through to 404.
      expect(mockRevalidate).toHaveBeenCalledTimes(1)
      expect(mockRevalidate).toHaveBeenCalledWith(['old-slug'])
    })

    it('skips revalidate when the collection was already a draft', async () => {
      const collection = makeCollection({
        id: 'page-7',
        status: TemplateGalleryPageStatus.draft
      })
      const unpublishMock = getTemplateGalleryPageUnpublishMock({
        id: 'page-7'
      })

      const { result } = renderHook(() => useCollectionMutations(), {
        wrapper: wrapperWithMocks([unpublishMock])
      })

      await act(async () => {
        await result.current.unpublish(collection)
      })

      // The mutation still runs — the server is idempotent — but there is
      // no public page to bust, so we don't burn a revalidate roundtrip.
      expect(unpublishMock.result).toHaveBeenCalledTimes(1)
      expect(mockRevalidate).not.toHaveBeenCalled()
    })

    it('shows an error snackbar when the mutation fails', async () => {
      const collection = makeCollection({ id: 'page-7' })
      const errorMock: MockedResponse = {
        request: {
          query: TEMPLATE_GALLERY_PAGE_UNPUBLISH,
          variables: { id: 'page-7' }
        },
        result: {
          errors: [new GraphQLError('Cannot unpublish')]
        }
      }

      const { result } = renderHook(() => useCollectionMutations(), {
        wrapper: wrapperWithMocks([errorMock])
      })

      await act(async () => {
        await result.current.unpublish(collection)
      })

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringMatching(/cannot unpublish/i),
        expect.objectContaining({ variant: 'error' })
      )
      expect(result.current.busyId).toBe(null)
      expect(mockRevalidate).not.toHaveBeenCalled()
    })
  })

  describe('ungroup', () => {
    it('revalidates and shows a success snackbar when deleting a published collection', async () => {
      const collection = makeCollection({
        id: 'page-7',
        status: TemplateGalleryPageStatus.published
      })
      const deleteMock = getTemplateGalleryPageDeleteMock({ id: 'page-7' })

      const { result } = renderHook(() => useCollectionMutations(), {
        wrapper: wrapperWithMocks([deleteMock])
      })

      await act(async () => {
        await result.current.ungroup(collection)
      })

      expect(deleteMock.result).toHaveBeenCalledTimes(1)
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Collection removed',
        expect.objectContaining({ variant: 'success' })
      )
      expect(result.current.busyId).toBe(null)
      // Revalidate so the now-deleted public URL stops serving the cached
      // page.
      expect(mockRevalidate).toHaveBeenCalledTimes(1)
      expect(mockRevalidate).toHaveBeenCalledWith(['old-slug'])
    })

    it('skips revalidate when the deleted collection was only a draft', async () => {
      const collection = makeCollection({
        id: 'page-7',
        status: TemplateGalleryPageStatus.draft
      })
      const deleteMock = getTemplateGalleryPageDeleteMock({ id: 'page-7' })

      const { result } = renderHook(() => useCollectionMutations(), {
        wrapper: wrapperWithMocks([deleteMock])
      })

      await act(async () => {
        await result.current.ungroup(collection)
      })

      expect(deleteMock.result).toHaveBeenCalledTimes(1)
      expect(mockRevalidate).not.toHaveBeenCalled()
    })

    it('shows an error snackbar with the server message on failure', async () => {
      const collection = makeCollection({ id: 'page-7' })
      const errorMock: MockedResponse = {
        request: {
          query: TEMPLATE_GALLERY_PAGE_DELETE,
          variables: { id: 'page-7' }
        },
        result: {
          errors: [new GraphQLError('Has dependent rows')]
        }
      }

      const { result } = renderHook(() => useCollectionMutations(), {
        wrapper: wrapperWithMocks([errorMock])
      })

      await act(async () => {
        await result.current.ungroup(collection)
      })

      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        expect.stringMatching(/has dependent rows/i),
        expect.objectContaining({ variant: 'error' })
      )
      expect(result.current.busyId).toBe(null)
      expect(mockRevalidate).not.toHaveBeenCalled()
    })
  })
})
