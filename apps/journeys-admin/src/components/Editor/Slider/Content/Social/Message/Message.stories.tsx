import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import {} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'

import { Message } from '.'

const MessageStory: Meta<typeof Message> = {
  ...simpleComponentConfig,
  component: Message,
  title: 'Journeys-Admin/Editor/Slider/Content/Social/Message'
}

type Story = StoryObj<ComponentProps<typeof Message> & { journey: Journey }>

const Template: Story = {
  render: (args) => (
    <JourneyProvider
      value={{
        journey: args.journey
      }}
    >
      <Message />
    </JourneyProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: {
      id: 'journey.id',
      primaryImageBlock: {
        src: 'https://images.unsplash.com/photo-1616488000000-000000000000?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
      },
      seoDescription: 'journey description',
      seoTitle: 'journey title'
    }
  }
}

export const Fallback = {
  ...Template,
  args: {
    journey: {
      id: 'journey.id'
    }
  }
}

export default MessageStory
