import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import Stack from '@mui/material/Stack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields_chatButtons as ChatButton } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'

import {
  ChatPlatform,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { Footer } from './Footer'

const Demo = {
  ...simpleComponentConfig,
  component: Footer,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Footer'
}

const Template: Story<
  ComponentProps<typeof Footer> & {
    hostTitle: string | null
    chatButtons: ChatButton[]
  }
> = ({ hostTitle, chatButtons }) => {
  return (
    <JourneyProvider
      value={{
        admin: true,
        journey: {
          id: 'journeyId',
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base,
          language: {
            __typename: 'Language',
            id: '529',
            bcp47: 'en',
            iso3: 'eng'
          },
          chatButtons,
          host: {
            title: hostTitle
          }
        } as unknown as Journey
      }}
    >
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <Footer />
      </Stack>
    </JourneyProvider>
  )
}

export const Default = Template.bind({})
Default.args = { hostTitle: null, chatButtons: [] }

export const Filled = Template.bind({})
Filled.args = {
  hostTitle: `John Geronimo "The Rock" Johnson`,
  chatButtons: [
    {
      id: '1',
      link: 'https://m.me/user',
      platform: ChatPlatform.facebook
    }
  ]
}

export default Demo as Meta
