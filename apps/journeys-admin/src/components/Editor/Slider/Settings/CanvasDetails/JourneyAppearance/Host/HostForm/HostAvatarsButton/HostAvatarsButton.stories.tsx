import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { HostAvatarsButton } from './HostAvatarsButton'

const Demo: Meta<typeof HostAvatarsButton> = {
  ...simpleComponentConfig,
  component: HostAvatarsButton,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Host/HostForm/HostAvatarsButton'
}

const defaultHost = {
  id: 'hostId',
  __typename: 'Host' as const,
  teamId: 'teamId',
  title: 'Cru International',
  location: null,
  src1: null,
  src2: null
}

const journey = {
  __typename: 'Journey',
  id: 'journeyId',
  seoTitle: 'My awesome journey',
  host: defaultHost
} as unknown as Journey

const Template: StoryObj<typeof HostAvatarsButton> = {
  render: ({ ...args }) => {
    return (
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { ...journey, host: { ...defaultHost, ...args } },
            variant: 'admin'
          }}
        >
          <HostAvatarsButton />
        </JourneyProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getByTestId('avatar2'))
  }
}

export const Image = {
  ...Template,
  args: {
    src1: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    src2: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80'
  },
  play: async () => {
    await userEvent.click(screen.getByTestId('avatar1'))
  }
}

export default Demo
