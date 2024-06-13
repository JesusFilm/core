import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { defaultJourney } from '../../../Editor/data'

import { SocialImage } from './SocialImage'

const SocialImageStory: Meta<typeof SocialImage> = {
  ...simpleComponentConfig,
  component: SocialImage,
  title: 'Journeys-Admin/TemplateView/TemplateViewHeader/SocialImage',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<
  ComponentProps<typeof SocialImage> & { journey: Journey }
> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
        <Box sx={{ p: 5, backgroundColor: 'background.paper' }}>
          <SocialImage />
        </Box>
      </JourneyProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: {
      ...defaultJourney,
      primaryImageBlock: {
        id: 'image1.id',
        __typename: 'ImageBlock',
        parentBlockId: null,
        parentOrder: 0,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'image.jpg',
        width: 1920,
        height: 1080,
        blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
      }
    }
  }
}

export const NoImageSource = {
  ...Template,
  args: {
    journey: defaultJourney
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}

export default SocialImageStory
