import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
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
    <JourneyProvider
      value={{ journey: {} as unknown as Journey, variant: 'admin' }}
    >
      <StoryCard>
        <Typography mb={4}>Text above Spacer</Typography>
        <Spacer {...args} />
        <Typography>Text below Spacer</Typography>
      </StoryCard>
    </JourneyProvider>
  )
}

export const Default: Story = {
  ...Template,
  args: { spacing: 200 }
}

export const Journeys: Story = {
  ...Template,
  render: ({ ...args }) => (
    <JourneyProvider
      value={{ journey: {} as unknown as Journey, variant: 'default' }}
    >
      <StoryCard>
        <Typography mb={4}>Text above Spacer</Typography>
        <Spacer {...args} />
        <Typography>Text below Spacer</Typography>
      </StoryCard>
    </JourneyProvider>
  ),
  args: { spacing: 200 }
}

export default Demo
