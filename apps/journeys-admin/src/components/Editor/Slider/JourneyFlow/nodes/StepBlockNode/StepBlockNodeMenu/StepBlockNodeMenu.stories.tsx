import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { StepBlockNodeMenu } from './StepBlockNodeMenu'

const Demo: Meta<typeof StepBlockNodeMenu> = {
  ...journeysAdminConfig,
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
  children: []
}

const Template: StoryObj<
  ComponentProps<typeof StepBlockNodeMenu> & { mocks: MockedResponse[] }
> = {
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
    await waitFor(async () => {
      await expect(screen.getByTestId('edit-step-fab')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByTestId('edit-step-fab'))
  }
}

export default Demo
