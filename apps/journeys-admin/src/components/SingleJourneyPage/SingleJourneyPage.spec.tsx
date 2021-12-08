import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import SingleJourneyPage from './SingleJourneyPage'
import {
  defaultJourney,
  publishedJourney
} from '../JourneyList/journeyListData'
import { JOURNEY_UPDATE } from './SingleJourneyMenu'
import { JourneyStatus } from '../../../__generated__/globalTypes'

describe('SingleJourneyPage', () => {
  it('should publish journey', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_UPDATE,
              variables: {
                input: {
                  id: defaultJourney.id,
                  title: 'Journey',
                  description: ' Description',
                  status: JourneyStatus.published
                }
              }
            },
            result: {
              data: {
                journeyUpdate: {
                  id: defaultJourney.id,
                  __typename: 'Journey',
                  title: 'Journey',
                  description: ' Description',
                  status: JourneyStatus.published
                }
              }
            }
          }
        ]}
      >
        <SingleJourneyPage journey={defaultJourney} />
      </MockedProvider>
    )
    const status = getByTestId('status')
    expect(status).toHaveTextContent('Draft')

    const menu = getByRole('button')
    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Publish' })
    fireEvent.click(menuItem)

    await waitFor(() => {
      expect(status).toHaveTextContent('Published')
    })
  })

  it('should not publish if journey is published', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SingleJourneyPage journey={publishedJourney} />
      </MockedProvider>
    )

    const menu = getByRole('button')

    fireEvent.click(menu)

    const menuItem = getByRole('menuitem', { name: 'Publish' })

    expect(menuItem).toHaveAttribute('aria-disabled', 'true')
  })
})
