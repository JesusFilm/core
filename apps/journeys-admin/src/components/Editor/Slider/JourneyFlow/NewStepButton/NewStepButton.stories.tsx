import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ReactFlowProvider } from '@xyflow/react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { NewStepButton } from '.'

const meta = {
  component: NewStepButton,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/NewStepButton',
  decorators: [
    (Story) => (
      <ReactFlowProvider>
        <Story />
      </ReactFlowProvider>
    )
  ]
} satisfies Meta<typeof NewStepButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
