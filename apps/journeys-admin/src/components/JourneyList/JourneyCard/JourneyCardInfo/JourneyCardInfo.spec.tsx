import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import {
  GetAdminJourneys_journeys as Journey,
  GetAdminJourneys_journeys_userJourneys as UserJourney
} from '../../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../ThemeProvider'
import { publishedJourney } from '../../journeyListData'
import { JourneyCardVariant } from '../journeyCardVariant'

import { JourneyCardInfo } from '.'
import '../../../../../test/i18n'

describe('JourneyCardInfo', () => {
  it('should should show user requesting access', () => {
    const uj = publishedJourney.userJourneys as unknown as UserJourney[]
    const actionRequiredJourney = {
      ...publishedJourney,
      userJourneys: [
        ...uj,
        {
          __typename: 'UserJourney',
          id: 'userJourney4.id',
          role: UserJourneyRole.inviteRequested,
          user: {
            __typename: 'User',
            id: 'user4.id',
            firstName: 'Four',
            lastName: 'LastName',
            imageUrl: null
          }
        }
      ]
    } as unknown as Journey

    const { getAllByTestId, getAllByRole } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCardInfo
            journey={actionRequiredJourney}
            variant={JourneyCardVariant.actionRequired}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getAllByTestId('avatar')).toHaveLength(1)
    expect(getAllByRole('button')).toHaveLength(1)
  })

  it('should should show many users requesting access', () => {
    const uj = publishedJourney.userJourneys as unknown as UserJourney[]
    const actionRequiredJourney = {
      ...publishedJourney,
      userJourneys: [
        ...uj,
        {
          __typename: 'UserJourney',
          id: 'userJourney4.id',
          role: UserJourneyRole.inviteRequested,
          user: {
            __typename: 'User',
            id: 'user4.id',
            firstName: 'Four',
            lastName: 'LastName',
            imageUrl: null
          }
        },
        {
          __typename: 'UserJourney',
          id: 'userJourney5.id',
          role: UserJourneyRole.inviteRequested,
          user: {
            __typename: 'User',
            id: 'user5.id',
            firstName: 'Five',
            lastName: 'LastName',
            imageUrl: null
          }
        }
      ]
    } as unknown as Journey

    const { getAllByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCardInfo
            journey={actionRequiredJourney}
            variant={JourneyCardVariant.actionRequired}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getAllByTestId('avatar')).toHaveLength(2)
  })

  it('should render the response and analytics items', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCardInfo
            journey={publishedJourney}
            variant={JourneyCardVariant.default}
          />
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByTestId('AnalyticsItem')).toBeInTheDocument()
    expect(getByTestId('ResponsesItem')).toBeInTheDocument()
  })
})
