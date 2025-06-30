import type { Meta, StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import type { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'

import { AddBlock } from './AddBlock'

const meta: Meta<typeof AddBlock> = {
  ...journeysAdminConfig,
  component: AddBlock,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/AddBlock'
}

type Story = StoryObj<ComponentProps<typeof AddBlock>>

const Template: Story = {
  render: ({ selectedStep }) => (
    <EditorProvider initialState={{ selectedStep }}>
      <AddBlock />
    </EditorProvider>
  )
}

export const Default = {
  ...Template
}

const disabledStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: 'journeyId',
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  slug: null,
  children: [
    {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: [
        {
          id: 'typography0.id',
          __typename: 'TypographyBlock',
          parentBlockId: 'card1.id',
          parentOrder: 0,
          content: 'Title',
          variant: TypographyVariant.h1,
          color: TypographyColor.primary,
          align: TypographyAlign.center,
          children: []
        }
      ]
    }
  ]
}

export const DisabledNewVideo: Story = {
  ...Template,
  args: {
    selectedStep: disabledStep
  }
}

export default meta
