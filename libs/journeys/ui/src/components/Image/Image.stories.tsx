import { Story, Meta } from '@storybook/react'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import type { TreeBlock } from '../../libs/block'
import { StoryCard } from '../StoryCard'
import { Image } from './Image'
import { ImageFields } from './__generated__/ImageFields'

const Demo = {
  ...journeyUiConfig,
  component: Image,
  title: 'Journeys-Ui/Image'
}

const imageProps = {
  id: 'Image',
  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
  alt: 'random image from unsplash',
  width: 1600,
  height: 1067,
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
}

const Template: Story<TreeBlock<ImageFields>> = ({ alt, ...args }) => (
  <StoryCard>
    <Image {...imageProps} {...args} alt={alt} />
  </StoryCard>
)

export const Default: Story<TreeBlock<ImageFields>> = Template.bind({})
Default.args = {
  src: null
}

// Throttle network to see loading image
export const Loading: Story<TreeBlock<ImageFields>> = Template.bind({})
Loading.parameters = {
  chromatic: { delay: 0 }
}

export const WebImage: Story<TreeBlock<ImageFields>> = Template.bind({})
WebImage.parameters = {
  chromatic: { delay: 300 }
}
export default Demo as Meta
