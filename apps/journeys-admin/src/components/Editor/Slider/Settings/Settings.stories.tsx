import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../__generated__/BlockFields'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { Settings } from '.'

const SettingsStory: Meta<typeof Settings> = {
  ...journeysAdminConfig,
  component: Settings,
  title: 'Journeys-Admin/Editor/Slider/Settings'
}

export const Default: StoryObj<typeof Settings> = {
  render: () => {
    const selected: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: 'step2.id',
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'step1.id',
          parentOrder: 0,
          coverBlockId: null,
          backgroundColor: null,
          themeName: ThemeName.base,
          themeMode: ThemeMode.dark,
          fullscreen: false,
          children: []
        }
      ]
    }

    return (
      <EditorProvider
        initialState={{ selectedStep: selected, selectedBlock: selected }}
      >
        <Settings />
      </EditorProvider>
    )
  }
}

export const WithMove: StoryObj<typeof Settings> = {
  render: () => {
    const block: TreeBlock = {
      id: 'typographyBlockId1',
      __typename: 'TypographyBlock',
      parentBlockId: 'card0.id',
      parentOrder: 0,
      align: null,
      color: null,
      content: 'Text1',
      variant: null,
      children: []
    }

    const step: TreeBlock<StepBlock> = {
      id: 'step0.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: 'step2.id',
      children: [
        {
          id: 'card0.id',
          __typename: 'CardBlock',
          parentBlockId: 'step0.id',
          parentOrder: 0,
          coverBlockId: null,
          backgroundColor: null,
          themeName: ThemeName.base,
          themeMode: ThemeMode.dark,
          fullscreen: false,
          children: [
            block,
            { ...block, id: 'typographyBlockId2', parentOrder: 1 },
            { ...block, id: 'typographyBlockId3', parentOrder: 2 }
          ]
        }
      ]
    }

    return (
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: step,
            selectedBlock: {
              ...block,
              id: 'typographyBlockId2',
              parentOrder: 1
            }
          }}
        >
          <Settings />
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export default SettingsStory
