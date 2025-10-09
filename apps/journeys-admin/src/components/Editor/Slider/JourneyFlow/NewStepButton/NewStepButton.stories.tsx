import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactFlowProvider } from 'reactflow'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { NewStepButton } from '.'

const NewStepButtonDemo: Meta<typeof NewStepButton> = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/NewStepButton'
}

const Template: StoryObj = {
  render: () => (
    <MockedProvider>
      <ReactFlowProvider>
        <NewStepButton />
      </ReactFlowProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {}
}

export default NewStepButtonDemo
