import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../../../../__generated__/globalTypes'

import { JOURNEY_ARCHIVE, JOURNEY_UNARCHIVE } from './ArchiveJourney'

import { ArchiveJourney } from '.'

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
        query: { tab: 'active' }
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
      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(getByText('Journey Archived')).toBeInTheDocument()
      expect(handeClose).toHaveBeenCalled()
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
        query: { tab: 'archived' }
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
