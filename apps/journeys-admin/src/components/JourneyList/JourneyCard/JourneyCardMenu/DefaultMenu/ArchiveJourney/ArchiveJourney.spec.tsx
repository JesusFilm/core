import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import MenuList from '@mui/material/MenuList'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type Mock } from 'vitest'

import { JourneyStatus } from '../../../../../../../__generated__/globalTypes'
import { TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY } from '../../../../../../libs/useTemplateGalleryPageRemoveJourneyMutation'

import { JOURNEY_ARCHIVE, JOURNEY_UNARCHIVE } from './ArchiveJourney'

import { ArchiveJourney } from '.'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as Mock

describe('ArchiveJourney', () => {
  const handeClose = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("activeTab === 'active'", () => {
    beforeEach(() => {
      mockUseRouter.mockReturnValue({
        query: { status: 'active' }
      })
    })

    it('should show archive journey button', () => {
      const { getByRole } = render(
        <MockedProvider>
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.draft}
              id="journey-id"
              published={false}
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )
      expect(getByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()
    })

    it('should archive journey', async () => {
      const result = vi.fn(() => ({
        data: {
          journeysArchive: [
            {
              id: 'journey-id',
              __typename: 'Journey',
              status: JourneyStatus.archived
            }
          ]
        }
      }))

      const { getByRole, getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_ARCHIVE,
                variables: {
                  ids: ['journey-id']
                }
              },
              result
            }
          ]}
        >
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.draft}
              id="journey-id"
              published={false}
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )

      fireEvent.click(getByRole('menuitem', { name: 'Archive' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(getByText('Journey Archived')).toBeInTheDocument()
      expect(handeClose).toHaveBeenCalled()
    })

    it('removes the archived journey from every cached TemplateGalleryPage.templates list and evicts the TemplateGalleryItem variant', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'TemplateGalleryPage:page-A': {
          __typename: 'TemplateGalleryPage',
          id: 'page-A',
          templates: [
            { __ref: 'TemplateGalleryItem:journey-id' },
            { __ref: 'TemplateGalleryItem:other-journey' }
          ]
        },
        'TemplateGalleryPage:page-B': {
          __typename: 'TemplateGalleryPage',
          id: 'page-B',
          templates: [{ __ref: 'TemplateGalleryItem:journey-id' }]
        },
        'TemplateGalleryItem:journey-id': {
          __typename: 'TemplateGalleryItem',
          id: 'journey-id'
        },
        'TemplateGalleryItem:other-journey': {
          __typename: 'TemplateGalleryItem',
          id: 'other-journey'
        }
      })

      const result = vi.fn(() => ({
        data: {
          journeysArchive: [
            {
              id: 'journey-id',
              __typename: 'Journey',
              status: JourneyStatus.archived
            }
          ]
        }
      }))

      const { getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: JOURNEY_ARCHIVE,
                variables: { ids: ['journey-id'] }
              },
              result
            }
          ]}
        >
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.draft}
              id="journey-id"
              published={false}
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )

      fireEvent.click(getByRole('menuitem', { name: 'Archive' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() => {
        expect(
          cache.extract()['TemplateGalleryItem:journey-id']
        ).toBeUndefined()
      })

      const finalSnapshot = cache.extract()
      expect(finalSnapshot['TemplateGalleryPage:page-A']?.templates).toEqual([
        { __ref: 'TemplateGalleryItem:other-journey' }
      ])
      expect(finalSnapshot['TemplateGalleryPage:page-B']?.templates).toEqual([])
    })

    it('archives without a separate membership cleanup request', async () => {
      const archiveResult = vi.fn(() => ({
        data: {
          journeysArchive: [
            {
              id: 'journey-id',
              __typename: 'Journey',
              status: JourneyStatus.archived
            }
          ]
        }
      }))
      const unassignResult = vi.fn(() => ({
        data: { templateGalleryPageRemoveJourney: [] }
      }))

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_ARCHIVE,
                variables: { ids: ['journey-id'] }
              },
              result: archiveResult
            },
            {
              request: {
                query: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY,
                variables: { journeyId: 'journey-id' }
              },
              result: unassignResult
            }
          ]}
        >
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.draft}
              id="journey-id"
              published={false}
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )

      fireEvent.click(getByRole('menuitem', { name: 'Archive' }))
      await waitFor(() => expect(archiveResult).toHaveBeenCalled())
      expect(unassignResult).not.toHaveBeenCalled()
    })

    it('should show error if archive fails', async () => {
      const { getByRole, getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_ARCHIVE,
                variables: {
                  ids: ['journey-id']
                }
              },
              error: new Error('error')
            }
          ]}
        >
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.draft}
              id="journey-id"
              published={false}
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )

      fireEvent.click(getByRole('menuitem', { name: 'Archive' }))
      await waitFor(() =>
        expect(getByText('Journey Archive failed')).toBeInTheDocument()
      )
    })

    it('should not show unarchive journey button', () => {
      const { queryByRole } = render(
        <MockedProvider>
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.archived}
              id="journey-id"
              published={false}
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )
      expect(
        queryByRole('menuitem', { name: 'Unarchive' })
      ).not.toBeInTheDocument()
    })
  })

  describe("activeTab === 'archived'", () => {
    beforeEach(() => {
      mockUseRouter.mockReturnValue({
        query: { status: 'archived' }
      })
    })

    it('should show unarchive journey button', () => {
      const { getByRole } = render(
        <MockedProvider>
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.archived}
              id="journey-id"
              published={false}
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )
      expect(getByRole('menuitem', { name: 'Unarchive' })).toBeInTheDocument()
    })

    it('should unarchive journey to draft', async () => {
      const result = vi.fn(() => ({
        data: {
          journeysRestore: [
            {
              id: 'journey-id',
              __typename: 'Journey',
              status: JourneyStatus.draft
            }
          ]
        }
      }))

      const { getByRole, getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_UNARCHIVE,
                variables: {
                  ids: ['journey-id']
                }
              },
              result
            }
          ]}
        >
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.archived}
              id="journey-id"
              published={false}
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )

      fireEvent.click(getByRole('menuitem', { name: 'Unarchive' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(getByText('Journey Unarchived')).toBeInTheDocument()
      expect(handeClose).toHaveBeenCalled()
    })

    it('should unarchive journey to published', async () => {
      const result = vi.fn(() => ({
        data: {
          journeysRestore: [
            {
              id: 'journey-id',
              __typename: 'Journey',
              status: JourneyStatus.published
            }
          ]
        }
      }))

      const { getByRole, getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_UNARCHIVE,
                variables: {
                  ids: ['journey-id']
                }
              },
              result
            }
          ]}
        >
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.archived}
              id="journey-id"
              published
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )

      fireEvent.click(getByRole('menuitem', { name: 'Unarchive' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(getByText('Journey Unarchived')).toBeInTheDocument()
      expect(handeClose).toHaveBeenCalled()
    })

    it('should show error if unarchive fails', async () => {
      const { getByRole, getByText } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_UNARCHIVE,
                variables: {
                  ids: ['journey-id']
                }
              },
              error: new Error('error')
            }
          ]}
        >
          <SnackbarProvider>
            <ArchiveJourney
              status={JourneyStatus.archived}
              id="journey-id"
              published={false}
              handleClose={handeClose}
            />
          </SnackbarProvider>
        </MockedProvider>,
        { wrapper: MenuList }
      )

      fireEvent.click(getByRole('menuitem', { name: 'Unarchive' }))
      await waitFor(() =>
        expect(getByText('Journey Unarchive failed')).toBeInTheDocument()
      )
    })
  })
})
