import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { GET_USER_ROLE } from '@core/journeys/ui/useUserRoleQuery'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { Role } from '../../../../__generated__/globalTypes'
import { GET_CURRENT_USER } from '../../../libs/useCurrentUserLazyQuery'
import { GET_JOURNEY_WITH_USER_ROLES } from '../../JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/DefaultMenu'
import { GET_JOURNEY_WITH_BLOCKS } from '../../JourneyList/JourneyCard/JourneyCardMenu/JourneyCardMenu'
import {
  defaultTemplate,
  descriptiveTemplate,
  fakeDate,
  oldTemplate
} from '../data'

import { TemplateListItem } from '.'

describe('TemplateListItem', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(fakeDate))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  // Define common mocks for all tests
  const mocks: MockedResponse[] = [
    {
      request: {
        query: GET_USER_ROLE
      },
      result: {
        data: {
          getUserRole: {
            __typename: 'UserRole',
            id: 'user-role-id',
            userId: 'current-user-id',
            roles: [Role.publisher]
          }
        }
      }
    },
    {
      request: {
        query: GET_CURRENT_USER
      },
      result: {
        data: {
          me: {
            __typename: 'User',
            id: 'current-user-id',
            email: 'current@example.com'
          }
        }
      }
    },
    {
      request: {
        query: GET_JOURNEY_WITH_USER_ROLES,
        variables: { id: 'template-id' }
      },
      result: {
        data: {
          journey: {
            id: 'template-id',
            userJourneys: []
          }
        }
      }
    },
    {
      request: {
        query: GET_JOURNEY_WITH_BLOCKS,
        variables: { id: 'template-id' }
      },
      result: {
        data: {
          journey: {
            ...defaultTemplate,
            blocks: []
          }
        }
      }
    }
  ]

  it('should render', () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <TemplateListItem journey={oldTemplate} />
      </MockedProvider>
    )
    expect(getByText('An Old Template Heading')).toBeInTheDocument()
    expect(getByText('1 year ago')).toBeInTheDocument()
    expect(
      getByText(
        '- Template created before the current year should also show the year in the date'
      )
    ).toBeInTheDocument()
    expect(getByText('English')).toBeInTheDocument()
  })

  it('should show native and local language', () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <TemplateListItem journey={descriptiveTemplate} />
      </MockedProvider>
    )
    expect(getByText('普通話 (Chinese, Mandarin)')).toBeInTheDocument()
  })

  it('should show only native language if its the same as local language', () => {
    const template: Journey = {
      ...defaultTemplate,
      language: {
        __typename: 'Language',
        id: '529',
        name: [
          {
            __typename: 'LanguageName',
            value: 'English',
            primary: true
          },
          {
            __typename: 'LanguageName',
            value: 'English',
            primary: false
          }
        ]
      }
    }
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <TemplateListItem journey={template} />
      </MockedProvider>
    )
    expect(getByText('English')).toBeInTheDocument()
  })

  it('should link to template details', () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <TemplateListItem journey={defaultTemplate} />
      </MockedProvider>
    )
    expect(getByRole('link')).toHaveAttribute('href', '/publisher/template-id')
  })
})
