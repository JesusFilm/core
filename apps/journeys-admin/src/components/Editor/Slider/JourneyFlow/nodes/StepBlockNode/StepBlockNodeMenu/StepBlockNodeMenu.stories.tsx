import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { screen, userEvent } from 'storybook/test'

import type { TreeBlock } from '@core/journeys/ui/block'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { StepBlockNodeMenu } from './StepBlockNodeMenu'

const Demo: Meta<typeof StepBlockNodeMenu> = {
  ...simpleComponentConfig,
  component: StepBlockNodeMenu,
  title:
    'Journeys-Admin/Editor/Slider/JourneyFlow/nodes/StepBlockNode/StepBlockNodeMenu'
}

const step: TreeBlock<StepBlock> = {
  id: 'step1.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  nextBlockId: null,
  parentOrder: 0,
  locked: false,
  children: [],
  slug: null
}

const Template: StoryObj<ComponentProps<typeof StepBlockNodeMenu>> = {
  render: () => (
    <MockedProvider>
      <ThemeProvider>
        <Box sx={{ position: 'fixed', top: '5%', left: '5%' }}>
          <StepBlockNodeMenu step={step} />
        </Box>
      </ThemeProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template
}

export const Expanded = {
  ...Template,
  play: async () => {
    await userEvent.click(screen.getByTestId('EditStepFab'))
  }
}

export default Demo
