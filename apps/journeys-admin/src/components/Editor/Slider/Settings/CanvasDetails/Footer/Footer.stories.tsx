import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields_chatButtons as ChatButton } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { GetAllTeamHosts_hosts as Host } from '../../../../../../../__generated__/GetAllTeamHosts'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ChatPlatform,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { Footer } from './Footer'

const Demo: Meta<typeof Footer> = {
  ...simpleComponentConfig,
  component: Footer,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Footer'
}

const defaultHost: Host = {
  id: 'hostId',
  __typename: 'Host' as const,
  title: 'Cru International',
  location: 'Florida, USA',
  src1: 'https://tinyurl.com/3bxusmyb',
  src2: null
}

const Template: StoryObj<
  ComponentProps<typeof Footer> & {
    host: Host | null
    chatButtons: ChatButton[]
  }
> = {
  render: ({ host, chatButtons }) => {
    return (
      <JourneyProvider
        value={{
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
            host
          } as unknown as Journey,
          variant: 'admin'
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
}

export const Default = { ...Template, args: { host: null } }

export const Filled = {
  ...Template,
  args: {
    host: defaultHost,
    chatButtons: [
      {
        id: '1',
        link: 'https://m.me/user',
        platform: ChatPlatform.facebook
      }
    ]
  }
}

export default Demo
