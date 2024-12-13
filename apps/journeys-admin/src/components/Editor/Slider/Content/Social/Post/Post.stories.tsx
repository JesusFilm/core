import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'

import { Post } from '.'

const PostStory: Meta<typeof Post> = {
  ...simpleComponentConfig,
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
        src: 'https://images.unsplash.com/photo-1552410260-0fd9b577afa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfGNvbGxlY3Rpb258Mnw0OTI0NTU2fHx8fHwyfHwxNzIyOTg3NzE3fA&ixlib=rb-4.0.3&q=80&w=1080'
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
