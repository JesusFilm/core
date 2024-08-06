import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import {} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'

import { Post } from '.'

const PostStory: Meta<typeof Post> = {
  ...journeysAdminConfig,
  component: Post,
  title: 'Journeys-Admin/Editor/Slider/Content/Social/Post'
}

type Story = StoryObj<ComponentProps<typeof Post> & { journey: Journey }>

const Template: Story = {
  render: (args) => (
    <JourneyProvider
      value={{
        journey: args.journey
      }}
    >
      <Post />
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

export default PostStory
