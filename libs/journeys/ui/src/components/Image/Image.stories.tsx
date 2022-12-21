import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { StoryCard } from '../StoryCard'
import { Image } from './Image'

const Demo = {
  ...journeyUiConfig,
  component: Image,
  title: 'Journeys-Ui/Image'
}

const emptyImage: Omit<ComponentProps<typeof Image>, 'src'> = {
  __typename: 'ImageBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  id: 'Image',
  alt: 'random image from unsplash',
  width: 1600,
  height: 1067,
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
  children: []
}

const Template: Story<ComponentProps<typeof Image>> = ({ ...args }) => (
  <StoryCard>
    <Image {...args} alt={args.alt} />
  </StoryCard>
)

// Throttle network to see loading image
export const Default = Template.bind({})
Default.args = {
  ...emptyImage
}

export const WebImage = Template.bind({})
WebImage.args = {
  ...Default.args,
  src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
}
WebImage.parameters = {
  chromatic: { delay: 300 }
}
export default Demo as Meta
