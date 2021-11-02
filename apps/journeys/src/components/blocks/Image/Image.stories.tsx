import { Story, Meta } from '@storybook/react'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { Image } from './Image'
import { journeysConfig, StoryCard } from '../../../libs/storybook'

const Demo = {
  ...journeysConfig,
  component: Image,
  title: 'Journeys/Blocks/Image'
}

const DefaultTemplate: Story<TreeBlock<ImageBlock>> = ({ alt, ...props }) => (
  <StoryCard>
    <Image {...props} alt={alt} />
  </StoryCard>
)

export const Default: Story<TreeBlock<ImageBlock>> = DefaultTemplate.bind({})
Default.args = {
  id: 'Image',
  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
  alt: 'random image from unsplash',
  width: 1600,
  height: 1067,
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
}

export default Demo as Meta
