import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'

import { ImageSource } from './ImageSource'

const ImageSourceStory = {
  ...journeysAdminConfig,
  component: ImageSource,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Image/ImageSource',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: ''
}

const Template: Story = (args) => {
  return <ImageSource {...args} image={image} />
}

export const Default = Template.bind({})
Default.args = {}

export const LoadedImage = Template.bind({})
LoadedImage.args = {
  name: 'Image Name',
  dimensions: '1920 x 1080 pixels',
  hasImage: true
}

export default ImageSourceStory as Meta
