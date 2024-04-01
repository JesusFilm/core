import type { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import type { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { AddBlock } from './AddBlock'

const AddBlockStory: Meta<typeof AddBlock> = {
  ...simpleComponentConfig,
  component: AddBlock,
  title: 'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/AddBlock'
}

export const Default: StoryObj<typeof AddBlock> = {
  render: () => {
    return <AddBlock />
  }
}

export const DisabledNewVideo: StoryObj<typeof AddBlock> = {
  render: () => {
    const selectedStep: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'stepId',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
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

    return (
      <EditorProvider initialState={{ selectedStep }}>
        <AddBlock />
      </EditorProvider>
    )
  }
}

export default AddBlockStory
