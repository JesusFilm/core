import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { StoryCard } from '../StoryCard'

import { Image } from './Image'

const Demo: Meta<typeof Image> = {
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
  scale: null,
  focalLeft: 50,
  focalTop: 50,
  children: []
}

type Story = StoryObj<ComponentProps<typeof Image>>

const Template: Story = {
  render: ({ ...args }) => (
    <StoryCard>
      <Image {...args} alt={args.alt} />
    </StoryCard>
  )
}

// Throttle network to see loading image
export const Default = {
  ...Template,
  args: { ...emptyImage }
}

export const WebImage = {
  ...Template,
  args: {
    ...Default.args,
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
  },
  parameters: {
    chromatic: { delay: 300 }
  }
}

export default Demo
