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

    const { getAllByTestId, getByText, getAllByRole } = render(
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
    expect(getAllByRole('button')).toHaveLength(2)
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

    const { getAllByTestId, getByText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyCardInfo
            journey={actionRequiredJourney}
            variant={JourneyCardVariant.actionRequired}
          />
        </ThemeProvider>
      </MockedProvider>
    )
    expect(getAllByTestId('avatar')).toHaveLength(4)
    expect(getByText('2 users')).toBeInTheDocument()
  })
})
