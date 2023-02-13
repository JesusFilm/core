import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { publishedJourney } from '../../journeyListData'
import {
  GetJourneys_journeys as Journey,
  GetJourneys_journeys_userJourneys as UserJourney
} from '../../../../../__generated__/GetJourneys'
import { ThemeProvider } from '../../../ThemeProvider'
import { JourneyCardVariant } from '../JourneyCard'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { JourneyCardInfo } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('JourneyCardInfo', () => {
  it('should show the langauge name', () => {
    const { getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCardInfo
            journey={publishedJourney}
            variant={JourneyCardVariant.default}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })

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

    const { getAllByLabelText, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCardInfo
            journey={actionRequiredJourney}
            variant={JourneyCardVariant.actionRequired}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    // avatar length is double of expected because avatar group is rendered twice and displayed based of screen size
    expect(getAllByLabelText('avatar')).toHaveLength(2)
    expect(getByText('1 user')).toBeInTheDocument()
    expect(
      getByText('requested editing rights for your journey')
    ).toBeInTheDocument()
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

    const { getAllByLabelText, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCardInfo
            journey={actionRequiredJourney}
            variant={JourneyCardVariant.actionRequired}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getAllByLabelText('avatar')).toHaveLength(4)
    expect(getByText('2 users')).toBeInTheDocument()
  })
})
