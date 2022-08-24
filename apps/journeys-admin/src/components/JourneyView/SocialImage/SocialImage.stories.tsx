import { Story, Meta } from '@storybook/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../libs/storybook'
import { publishedJourney } from '../data'
import { SocialImage } from './SocialImage'

const SocialImageStory = {
  ...simpleComponentConfig,
  component: SocialImage,
  title: 'Journeys-Admin/JourneyView/SocialImage'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider value={{ journey: args.journey }}>
      <SocialImage />
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: {
    ...publishedJourney,
    primaryImageBlock: {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: null,
      parentOrder: 0,
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'image.jpg',
      width: 1920,
      height: 1080,
      blurhash: ''
    }
  }
}

export default SocialImageStory as Meta
