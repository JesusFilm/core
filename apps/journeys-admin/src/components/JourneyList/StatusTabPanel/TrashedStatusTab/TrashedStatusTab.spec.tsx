import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'
import { defaultJourney, oldJourney } from '../../journeyListData'
import { ThemeProvider } from '../../../ThemeProvider'
import { SortOrder } from '../../JourneySort'
import { TrashedStatusTab, GET_TRASHED_JOURNEYS } from './TrashedStatusTab'

describe('ActiveStatusTab', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-12-11'))
  })

  it('should render journeys in descending createdAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_TRASHED_JOURNEYS
            },
            result: {
              data: {
                journeys: [
                  { ...defaultJourney, trashedAt: '2021-12-07T03:22:41.135Z' },
                  { ...oldJourney, trashedAt: '2021-12-07T03:22:41.135Z' }
                ]
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <ThemeProvider>
            <TrashedStatusTab onLoad={noop} />
          </ThemeProvider>
        </SnackbarProvider>
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
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_TRASHED_JOURNEYS
            },
            result: {
              data: {
                journeys: [
                  { ...defaultJourney, trashedAt: '2021-12-07T03:22:41.135Z' },
                  { ...oldJourney, trashedAt: '2021-12-07T03:22:41.135Z' }
                ]
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <ThemeProvider>
            <TrashedStatusTab onLoad={noop} sortOrder={SortOrder.TITLE} />
          </ThemeProvider>
        </SnackbarProvider>
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

  it('should exclude journeys older than 40 days', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_TRASHED_JOURNEYS
            },
            result: {
              data: {
                journeys: [
                  { ...defaultJourney, trashedAt: '2021-12-07T03:22:41.135Z' },
                  { ...oldJourney, trashedAt: '2021-10-31T03:22:41.135Z' }
                ]
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <ThemeProvider>
            <TrashedStatusTab onLoad={noop} sortOrder={SortOrder.TITLE} />
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByLabelText('journey-card')[0].textContent).toContain(
        'Default Journey Heading'
      )
    )
    expect(getAllByLabelText('journey-card')[1]).toBeUndefined()
  })

  it('should render loading skeleton', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider mocks={[]}>
        <ThemeProvider>
          <TrashedStatusTab onLoad={noop} />
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
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_TRASHED_JOURNEYS
            },
            result: {
              data: {
                journeys: []
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <TrashedStatusTab onLoad={onLoad} />
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(onLoad).toHaveBeenCalled())
  })
})
