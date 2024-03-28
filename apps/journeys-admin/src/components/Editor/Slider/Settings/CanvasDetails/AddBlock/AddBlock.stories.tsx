import type { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import type { BlockFields_StepBlock } from '../../../../../../../__generated__/BlockFields'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { AddBlock } from './AddBlock'

const AddBlockStory: Meta<typeof AddBlock> = {
  ...journeysAdminConfig,
  component: AddBlock,
  title: 'Journeys-Admin/Block/AddBlock'
}

export const Default: StoryObj<typeof AddBlock> = {
  render: () => {
    const selectedStep: TreeBlock<BlockFields_StepBlock> = {
      // Fix: Change the type to BlockFields_StepBlock
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'step1.id',
          parentOrder: 0,
          coverBlockId: null,
          backgroundColor: null,
          themeMode: null, // Fix: Add the missing properties
          themeName: null,
          fullscreen: true,
          children: []
        }
      ]
    }

    return (
      <EditorProvider initialState={{ selectedStep }}>
        <AddBlock />
      </EditorProvider>
    )
  }
}

export default AddBlockStory
