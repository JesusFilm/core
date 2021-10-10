import { Story, Meta } from '@storybook/react'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Image } from './Image'
import { journeysConfig } from '../../../libs/storybook'

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
  src: 'https://images.unsplash.com/photo-1521904764098-e4e0a87e3ce0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1365&q=80',
  alt: 'random image from unsplash',
  width: 1600,
  height: 1067
}

export default Demo as Meta
