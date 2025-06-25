import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'

import { ColorPicker } from '.'

const Demo: Meta<typeof ColorPicker> = {
  ...journeysAdminConfig,
  component: ColorPicker,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Card/ColorPicker',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const step = (block: TreeBlock): TreeBlock<StepBlock> => {
  return {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    children: [block],
    locked: false,
    nextBlockId: null,
    slug: null
  }
}

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  fullscreen: false,
  children: []
}

const Template: StoryObj<
  ComponentProps<typeof ColorPicker> & {
    card: TreeBlock<CardBlock>
  }
> = {
  render: ({ card }) => {
    return (
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedStep: step(card)
          }}
        >
          <ColorPicker />
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Light = {
  ...Template,
  args: {
    card
  }
}

export const Dark = {
  ...Template,
  args: {
    card: {
      ...card,
      backgroundColor: '#0277BD',
      themeName: ThemeName.base,
      themeMode: ThemeMode.dark
    }
  }
}

export const MobileColorPicker = {
  ...Dark,
  parameters: {
    chromatic: {
      viewports: [360]
    }
  },
  play: async () => {
    const customTab = await screen.getByRole('tab', { name: 'Custom' })
    await userEvent.click(customTab)
  }
}

export default Demo
