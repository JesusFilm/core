import { Story, Meta } from '@storybook/react'
import { journeyUiConfig, StoryCard, TreeBlock } from '../..'
import { Image } from './Image'
import { ImageFields } from './__generated__/ImageFields'

const Demo = {
  ...journeyUiConfig,
  component: Image,
  title: 'Journeys-Ui/Image'
}

const DefaultTemplate: Story<TreeBlock<ImageFields>> = ({ alt, ...props }) => (
  <StoryCard>
    <Image {...props} alt={alt} />
  </StoryCard>
)

export const Default: Story<TreeBlock<ImageFields>> = DefaultTemplate.bind({})
Default.args = {
  id: 'Image',
  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
  alt: 'random image from unsplash',
  width: 1600,
  height: 1067,
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
}

export const NoImageSource: Story<TreeBlock<ImageFields>> = DefaultTemplate.bind({})
NoImageSource.args = {
  id: 'Image',
  src: null,
  alt: 'Default Image Icon',
}

export default Demo as Meta
