import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { defaultJourney, oldJourney } from '../../journeyListData'
import { ThemeProvider } from '../../../ThemeProvider'
import { SortOrder } from '../../JourneySort'
import {
  ArchivedStatusTab,
  GET_ARCHIVED_JOURNEYS,
  RESTORE_ARCHIVED_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from './ArchivedStatusTab'

const archivedJourneysMock = {
  request: {
    query: GET_ARCHIVED_JOURNEYS
  },
  result: {
    data: {
      journeys: [defaultJourney, oldJourney]
    }
  }
}

const noJourneysMock = {
  request: {
    query: GET_ARCHIVED_JOURNEYS
  },
  result: {
    data: {
      journeys: []
    }
  }
}
describe('ActiveStatusTab', () => {
  it('should render journeys in descending createdAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[archivedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedStatusTab onLoad={noop} event="" />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'January 1'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'November 19, 2020'
    )
  })

  it('should order journeys in alphabetical order', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[archivedJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedStatusTab onLoad={noop} sortOrder={SortOrder.TITLE} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'An Old Journey Heading'
      )
    )
    expect(getAllByLabelText('journey-card')[1].textContent).toContain(
      'Default Journey Heading'
    )
  })

  it('should render loading skeleton', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedStatusTab onLoad={noop} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getAllByLabelText('journey-card')).toHaveLength(3)
    )
  })

  it('should call onLoad when query is loaded', async () => {
    const onLoad = jest.fn()
    render(
      <MockedProvider mocks={[noJourneysMock]}>
        <ThemeProvider>
          <SnackbarProvider>
            <ArchivedStatusTab onLoad={onLoad} />
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(onLoad).toHaveBeenCalled())
  })

  describe('Archive All', () => {
    it('should display the unarchive all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedStatusTab onLoad={noop} event="restoreAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Unarchive Journeys')).toBeInTheDocument()
    })

    it('should unarchive all journeys', async () => {
      const result = jest.fn(() => ({
        data: [{ id: defaultJourney.id, status: 'published' }]
      }))
      const archiveJourneysMock = {
        request: {
          query: RESTORE_ARCHIVED_JOURNEYS,
          variables: {
            ids: [defaultJourney.id, oldJourney.id]
          }
        },
        result
      }
      const onLoad = jest.fn()
      const { getByText } = render(
        <MockedProvider
          mocks={[archivedJourneysMock, archiveJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedStatusTab onLoad={onLoad} event="restoreAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
      fireEvent.click(getByText('Unarchive'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })
  })

  describe('Trash All', () => {
    it('should display the trash all dialog', () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedStatusTab onLoad={noop} event="trashAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      expect(getByText('Trash Journeys')).toBeInTheDocument()
    })

    it('should trash all journeys', async () => {
      const result = jest.fn(() => ({
        data: [{ id: defaultJourney.id, status: 'trashAllArchived' }]
      }))
      const trashJourneysMock = {
        request: {
          query: TRASH_ARCHIVED_JOURNEYS,
          variables: {
            ids: [defaultJourney.id, oldJourney.id]
          }
        },
        result
      }
      const onLoad = jest.fn()
      const { getByText } = render(
        <MockedProvider
          mocks={[archivedJourneysMock, trashJourneysMock, noJourneysMock]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <ArchivedStatusTab onLoad={onLoad} event="trashAllArchived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(onLoad).toHaveBeenCalled())
      fireEvent.click(getByText('Trash'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })
  })
})
