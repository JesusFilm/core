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
  src: 'https://images.unsplash.com/photo-1521904764098-e4e0a87e3ce0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=1080&ixid=MnwxfDB8MXxyYW5kb218MHx8Y2lyY2xlfHx8fHx8MTYzMzA2MjI4MQ&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1920',
  alt: 'random image from unsplash',
  width: 1600,
  height: 1067
}

export default Demo as Meta
