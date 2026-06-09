import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type Mock } from 'vitest'

import { JourneyStatus } from '../../../../../../../__generated__/globalTypes'
import { TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY } from '../../../../../../libs/useTemplateGalleryPageAssignJourneyMutation'

import { JOURNEY_ARCHIVE, JOURNEY_UNARCHIVE } from './ArchiveJourney'

import { ArchiveJourney } from '.'

// After journeysArchive resolves, the dialog issues a best-effort
// templateGalleryPageAssignJourney({ pageId: null }) to sever
// collection membership. Success-path archive tests need this mock.
function unassignMock(journeyId = 'journey-id') {
  return {
    request: {
      query: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId, pageId: null }
    },
    result: { data: { templateGalleryPageAssignJourney: null } }
  }
}

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
        </MockedProvider>
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
            },
            unassignMock()
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
        </MockedProvider>
      )

      fireEvent.click(getByRole('menuitem', { name: 'Archive' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(getByText('Journey Archived')).toBeInTheDocument()
      expect(handeClose).toHaveBeenCalled()
    })

    it('removes the archived journey from every cached TemplateGalleryPage.templates list and evicts the TemplateGalleryItem variant', async () => {
      const cache = new InMemoryCache()
      cache.restore({
        'TemplateGalleryPageAdmin:page-A': {
          __typename: 'TemplateGalleryPageAdmin',
          id: 'page-A',
          templates: [
            { __ref: 'TemplateGalleryItem:journey-id' },
            { __ref: 'TemplateGalleryItem:other-journey' }
          ]
        },
        'TemplateGalleryPageAdmin:page-B': {
          __typename: 'TemplateGalleryPageAdmin',
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
            },
            unassignMock()
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
        </MockedProvider>
      )

      fireEvent.click(getByRole('menuitem', { name: 'Archive' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() => {
        expect(
          cache.extract()['TemplateGalleryItem:journey-id']
        ).toBeUndefined()
      })

      const finalSnapshot = cache.extract()
      expect(finalSnapshot['TemplateGalleryPageAdmin:page-A']?.templates).toEqual([
        { __ref: 'TemplateGalleryItem:other-journey' }
      ])
      expect(finalSnapshot['TemplateGalleryPageAdmin:page-B']?.templates).toEqual([])
    })

    it('unassigns the journey from its collection after archiving', async () => {
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
        data: { templateGalleryPageAssignJourney: null }
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
                query: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
                variables: { journeyId: 'journey-id', pageId: null }
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
        </MockedProvider>
      )

      fireEvent.click(getByRole('menuitem', { name: 'Archive' }))
      await waitFor(() => expect(archiveResult).toHaveBeenCalled())
      await waitFor(() => expect(unassignResult).toHaveBeenCalled())
    })

    it('fires the success snackbar BEFORE the unassign mutation resolves (does not block UX)', async () => {
      // Mike review (NES-1644): waitFor doesn't assert ordering. Hold
      // the unassign mock indefinitely; the snackbar must still appear.
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
      let unassignCalled = false
      const unassignNeverResolves = new Promise<{
        data: { templateGalleryPageAssignJourney: null }
      }>(() => {
        // Intentionally never resolves.
      })

      const { getByRole, getByText } = render(
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
                query: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
                variables: { journeyId: 'journey-id', pageId: null }
              },
              result: () => {
                unassignCalled = true
                return unassignNeverResolves as unknown as {
                  data: { templateGalleryPageAssignJourney: null }
                }
              }
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
        </MockedProvider>
      )

      fireEvent.click(getByRole('menuitem', { name: 'Archive' }))
      await waitFor(() => expect(archiveResult).toHaveBeenCalled())
      await waitFor(() =>
        expect(getByText('Journey Archived')).toBeInTheDocument()
      )
      expect(unassignCalled).toBe(true)
    })

    it('still surfaces success when the unassign mutation fails (best-effort)', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(noop)
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

      const { getByRole, getByText } = render(
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
                query: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
                variables: { journeyId: 'journey-id', pageId: null }
              },
              error: new Error('unassign exploded')
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
        </MockedProvider>
      )

      fireEvent.click(getByRole('menuitem', { name: 'Archive' }))
      await waitFor(() => expect(archiveResult).toHaveBeenCalled())
      await waitFor(() =>
        expect(getByText('Journey Archived')).toBeInTheDocument()
      )
      expect(warn).toHaveBeenCalledWith(
        '[ArchiveJourney] failed to unassign archived journey from its collection',
        expect.objectContaining({ journeyId: 'journey-id' })
      )
      warn.mockRestore()
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
        </MockedProvider>
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
        </MockedProvider>
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
        </MockedProvider>
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
        </MockedProvider>
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
        </MockedProvider>
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
        </MockedProvider>
      )

      fireEvent.click(getByRole('menuitem', { name: 'Unarchive' }))
      await waitFor(() =>
        expect(getByText('Journey Unarchive failed')).toBeInTheDocument()
      )
    })
  })
})
