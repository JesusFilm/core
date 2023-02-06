import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../__generated__/GetJourney'

import { ImageSelection } from './ImageSelection'

const ImageSelectionStory = {
  ...journeysAdminConfig,
  component: ImageSelection,
  title: 'Journeys-Admin/Editor/ImageLibrary/ImageSelection',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const image: ImageBlock = {
  id: 'Image Title',
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
  return <ImageSelection {...args} />
}

export const Select = Template.bind({})
Select.args = {}

export const Applied = Template.bind({})
Applied.args = {
  image,
  startPanel: { name: 'applied', heading: 'Selected image', hasImage: true }
}

export const Source = Template.bind({})
Source.args = {
  startPanel: { name: 'source', heading: 'Select image', hasImage: false }
}

export default ImageSelectionStory as Meta
