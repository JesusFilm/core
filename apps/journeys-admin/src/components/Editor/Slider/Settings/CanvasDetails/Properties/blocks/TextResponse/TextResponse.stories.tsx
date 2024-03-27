import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../../../libs/storybook'
import { Drawer } from '../../../../Drawer'

import { TextResponse } from './TextResponse'

const Demo: Meta<typeof TextResponse> = {
  ...journeysAdminConfig,
  component: TextResponse,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/TextResponse',
  // do not remove these parameters for this story, see: https://github.com/storybookjs/storybook/issues/17025
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

const Template: StoryObj<
  ComponentProps<typeof TextResponse> & { block: TreeBlock<TextResponseBlock> }
> = {
  render: ({ ...args }) => {
    return (
      <EditorProvider initialState={{ selectedBlock: { ...args.block } }}>
        <Drawer title="Feedback Properties">
          <TextResponse {...args.block} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    block: {
      __typename: 'TextResponseBlock',
      id: 'textResponseBlock.id',
      parentBlockId: null,
      parentOrder: null,
      action: null,
      submitIconId: null,
      label: 'label',
      children: []
    }
  }
}

export const Complete = {
  ...Template,
  args: {
    block: {
      __typename: 'TextResponseBlock',
      id: 'textResponseBlock.id',
      parentBlockId: null,
      parentOrder: null,
      action: {
        __typename: 'LinkAction',
        parentBlockId: 'responseAction.id',
        gtmEventName: 'responseAction',
        url: 'https://www.google.com'
      },
      submitIconId: 'icon.id',
      label: 'complete label',
      hint: 'hint text',
      minRows: 2,
      children: [
        {
          id: 'icon.id',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 0,
          iconName: IconName.ArrowForwardRounded,
          iconColor: IconColor.action,
          iconSize: IconSize.lg,
          children: []
        }
      ]
    }
  }
}

export default Demo
