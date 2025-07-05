import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../../../__generated__/globalTypes'

import { Icon } from '.'

const IconStory: Meta<typeof Icon> = {
  ...simpleComponentConfig,
  component: Icon,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/controls/Icon'
}

export const Default: StoryObj<typeof Icon> = {
  render: () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: null,
      children: [
        {
          id: 'iconBlock.id',
          parentBlockId: 'buttonBlockId',
          parentOrder: null,
          __typename: 'IconBlock',
          iconName: null,
          iconSize: null,
          iconColor: null,
          children: []
        }
      ],
      settings: null
    }

    return (
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedBlock
          }}
        >
          <Icon id="id" />
        </EditorProvider>
      </MockedProvider>
    )
  }
}

export const Filled: StoryObj<typeof Icon> = {
  render: () => {
    const selectedBlock: TreeBlock<ButtonBlock> = {
      __typename: 'ButtonBlock',
      id: 'id',
      parentBlockId: 'parentBlockId',
      parentOrder: 0,
      label: 'test button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: null,
      children: [
        {
          __typename: 'IconBlock',
          id: 'iconBlock.id',
          parentBlockId: null,
          parentOrder: null,
          iconName: IconName.ArrowForwardRounded,
          iconSize: IconSize.md,
          iconColor: IconColor.primary,
          children: []
        }
      ],
      settings: null
    }

    return (
      <MockedProvider>
        <EditorProvider
          initialState={{
            selectedBlock
          }}
        >
          <Icon id="iconBlock.id" />
        </EditorProvider>
      </MockedProvider>
    )
  }
}
export default IconStory
