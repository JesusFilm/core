import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

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

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.Mock

describe('ArchiveJourney', () => {
  const handeClose = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
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
      const result = jest.fn(() => ({
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

      const result = jest.fn(() => ({
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
      expect(finalSnapshot['TemplateGalleryPage:page-A']?.templates).toEqual([
        { __ref: 'TemplateGalleryItem:other-journey' }
      ])
      expect(finalSnapshot['TemplateGalleryPage:page-B']?.templates).toEqual([])
    })

    it('unassigns the journey from its collection after archiving', async () => {
      const archiveResult = jest.fn(() => ({
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
      const unassignResult = jest.fn(() => ({
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

    it('still surfaces success when the unassign mutation fails (best-effort)', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
      const archiveResult = jest.fn(() => ({
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
      const result = jest.fn(() => ({
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
      const result = jest.fn(() => ({
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
