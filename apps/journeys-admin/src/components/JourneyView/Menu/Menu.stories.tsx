import { MockedProvider } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { simpleComponentConfig } from '../../../libs/storybook'
import { TeamProvider } from '../../Team/TeamProvider'
import { defaultJourney } from '../data'

import { GET_LANGUAGES } from './LanguageDialog'
import { Menu } from './Menu'

const MenuStory: Meta<typeof Menu> = {
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
  }
]

const Template: StoryObj<typeof Menu> = {
  render: ({ ...args }) => (
    <MockedProvider mocks={args.mocks}>
      <TeamProvider>
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
          <Stack direction="row">
            <Menu {...args} />
          </Stack>
        </JourneyProvider>
      </TeamProvider>
    </MockedProvider>
  )
}

export const Draft = {
  ...Template,
  args: { journey: defaultJourney, forceOpen: true, mocks: journeyMocks },
  play: async () => {
    const button = screen.getByRole('button')
    await userEvent.click(button)
  }
}

export const TemplateMenu = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      userJourneys: null,
      template: true
    }
  },
  play: async () => {
    const button = screen.getByRole('button')
    await userEvent.click(button)
  }
}

export const Loading = { ...Template, args: { journey: undefined } }

export default MenuStory
