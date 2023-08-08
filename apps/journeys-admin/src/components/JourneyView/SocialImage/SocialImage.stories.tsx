import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { simpleComponentConfig } from '../../../libs/storybook'
import { defaultJourney } from '../data'

import { SocialImage } from './SocialImage'

const SocialImageStory = {
  ...simpleComponentConfig,
  component: SocialImage,
  title: 'Journeys-Admin/JourneyView/SocialImage',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
      <Box sx={{ p: 5, backgroundColor: 'background.paper' }}>
        <SocialImage />
      </Box>
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
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

export const NoImageSource = Template.bind({})
NoImageSource.args = {
  journey: defaultJourney
}

export default SocialImageStory as Meta
