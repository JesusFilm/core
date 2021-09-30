import { Story, Meta } from '@storybook/react'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Image } from './Image'
import { journeysConfig } from '../../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: Image,
  title: 'Journeys/Blocks/Image'
}

const DefaultTemplate: Story<TreeBlock<ImageBlock>> = ({ alt, ...props }) => (
  <Image {...props} alt={alt} />
)

export const Default: Story<TreeBlock<ImageBlock>> = DefaultTemplate.bind({})
Default.args = {
  id: 'Image',
  src: 'https://source.unsplash.com/random/1920x1080',
  alt: 'random image from unsplash',
  width: 1920,
  height: 1080
}

export default Demo as Meta
