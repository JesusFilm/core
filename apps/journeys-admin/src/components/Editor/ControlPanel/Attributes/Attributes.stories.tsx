import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourney'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../libs/storybook'

import { Attributes } from '.'

const AttributesStory = {
  ...journeysAdminConfig,
  component: Attributes,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes'
}

export const Default: Story = () => {
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
    <EditorProvider>
      <Attributes selected={selected} step={selected} />
    </EditorProvider>
  )
}

export const WithMove: Story = () => {
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
      <EditorProvider>
        <Attributes
          selected={{ ...block, id: 'typographyBlockId2', parentOrder: 1 }}
          step={step}
        />
      </EditorProvider>
    </MockedProvider>
  )
}

export default AttributesStory as Meta
