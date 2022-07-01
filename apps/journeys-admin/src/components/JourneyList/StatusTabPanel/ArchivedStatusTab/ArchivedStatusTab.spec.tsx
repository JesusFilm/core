import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { defaultJourney, oldJourney } from '../../journeyListData'
import { ThemeProvider } from '../../../ThemeProvider'
import { SortOrder } from '../../JourneySort'
import { ArchivedStatusTab, GET_ARCHIVED_JOURNEYS } from './ArchivedStatusTab'

describe('ActiveStatusTab', () => {
  it('should render journeys in descending createdAt date by default', async () => {
    const { getAllByLabelText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ARCHIVED_JOURNEYS
            },
            result: {
              data: {
                journeys: [defaultJourney, oldJourney]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <ArchivedStatusTab onLoad={noop} />
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
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_ARCHIVED_JOURNEYS
            },
            result: {
              data: {
                journeys: [defaultJourney, oldJourney]
              }
            }
          }
        ]}
      >
        <ThemeProvider>
          <ArchivedStatusTab onLoad={noop} sortOrder={SortOrder.TITLE} />
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
          <ArchivedStatusTab onLoad={noop} />
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
              query: GET_ARCHIVED_JOURNEYS
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
          <ArchivedStatusTab onLoad={onLoad} />
        </ThemeProvider>
      </MockedProvider>
    )
    await waitFor(() => expect(onLoad).toHaveBeenCalled())
  })
})
