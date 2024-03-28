import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { journey } from '../../Settings/GoalDetails/data'

import { SocialPreview } from './SocialPreview'


const SocialPreviewStory: Meta<typeof SocialPreview> = {
  ...journeysAdminConfig,
  component: SocialPreview,
  title: 'Journeys-Admin/Editor/Slider/Content/Social/SocialPreview'
}

type Story = StoryObj<ComponentProps<typeof SocialPreview> & { journey: Journey }>

const Template: Story = {
  render: (args) => (
    <Box sx={{paddingLeft: 2, borderColor: 'red', borderWidth: 4}}> 
      <JourneyProvider value={{ journey: args.journey, variant: 'admin' }} >
        <SocialPreview />
      </JourneyProvider>
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: {
      title: 'Where did Jesus body go',
      primaryImageBlock: {
        id: 'image1.id',
        __typename: 'ImageBlock',
        parentBlockId: null,
        parentOrder: 0,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'random image from unsplash',
        width: 1920,
        height: 1080,
        blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
      },
      },
      SocialPreview: {
        title: 'a'
      }
  }
}

export const Empty = {
  ...Template,
  args: {
    journey: {
      ...journey,
    },
  }
}

export default SocialPreviewStory
