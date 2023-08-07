import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyStatus, Role } from '../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../libs/storybook'
import { TeamProvider } from '../../Team/TeamProvider'
import { defaultJourney } from '../data'

import { GET_LANGUAGES } from './LanguageDialog'
import { GET_ROLE, JOURNEY_PUBLISH, Menu } from './Menu'

const MenuStory = {
  ...simpleComponentConfig,
  component: Menu,
  title: 'Journeys-Admin/JourneyView/Menu'
}

const journeyMocks = [
  {
    request: {
      query: GET_LANGUAGES,
      variables: {
        languageId: '529'
      }
    },
    result: {
      data: {
        languages: [
          {
            __typename: 'Language',
            id: '529',
            name: [
              {
                value: 'English',
                primary: true,
                __typename: 'Translation'
              }
            ]
          },
          {
            id: '496',
            __typename: 'Language',
            name: [
              {
                value: 'Français',
                primary: true,
                __typename: 'Translation'
              },
              {
                value: 'French',
                primary: false,
                __typename: 'Translation'
              }
            ]
          },
          {
            id: '1106',
            __typename: 'Language',
            name: [
              {
                value: 'Deutsch',
                primary: true,
                __typename: 'Translation'
              },
              {
                value: 'German, Standard',
                primary: false,
                __typename: 'Translation'
              }
            ]
          }
        ]
      }
    }
  },
  {
    request: {
      query: JOURNEY_PUBLISH,
      variables: { id: defaultJourney.id }
    },
    result: {
      data: {
        journeyPublish: {
          id: defaultJourney.id,
          __typename: 'Journey',
          status: JourneyStatus.published
        }
      }
    }
  }
]

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={args.mocks}>
    <TeamProvider>
      <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
        <Menu {...args} />
      </JourneyProvider>
    </TeamProvider>
  </MockedProvider>
)

export const Draft = Template.bind({})
Draft.args = { journey: defaultJourney, forceOpen: true, mocks: journeyMocks }
Draft.play = () => {
  const button = screen.getByRole('button')
  userEvent.click(button)
}

export const Published = Template.bind({})
Published.args = {
  journey: {
    ...defaultJourney,
    publishedAt: '2021-11-19T12:34:56.647Z',
    status: JourneyStatus.published
  },
  mocks: journeyMocks
}
Published.play = () => {
  const button = screen.getByRole('button')
  userEvent.click(button)
}

export const TemplateMenu = Template.bind({})
TemplateMenu.args = {
  journey: {
    ...defaultJourney,
    userJourneys: null,
    template: true
  }
}
TemplateMenu.play = () => {
  const button = screen.getByRole('button')
  userEvent.click(button)
}

export const PublisherMenu = Template.bind({})
PublisherMenu.args = {
  journey: {
    ...defaultJourney,
    userJourneys: null,
    template: true
  },
  mocks: [
    ...journeyMocks,
    {
      request: {
        query: GET_ROLE
      },
      result: {
        data: {
          getUserRole: {
            id: 'userRoleId',
            userId: '1',
            roles: [Role.publisher]
          }
        }
      }
    }
  ]
}
PublisherMenu.play = () => {
  const button = screen.getByRole('button')
  userEvent.click(button)
}

export const Loading = Template.bind({})
Loading.args = { journey: undefined }

export default MenuStory as Meta
