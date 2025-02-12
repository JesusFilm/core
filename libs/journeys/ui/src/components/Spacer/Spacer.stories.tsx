import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { StoryCard } from '../StoryCard'

import { Spacer } from './Spacer'

const Demo: Meta<typeof Spacer> = {
  ...journeyUiConfig,
  component: Spacer,
  title: 'Journeys-Ui/Spacer'
}

type Story = StoryObj<ComponentProps<typeof Spacer>>

const Template: Story = {
  render: ({ ...args }) => (
    <StoryCard>
      <Spacer {...args} />
    </StoryCard>
  )
}

export const Default: Story = {
  ...Template,
  args: { spacing: 100 }
}

export default Demo
