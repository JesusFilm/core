import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../__generated__/GetJourney'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../libs/storybook'

import { TextResponse } from './TextResponse'

const TextResponseStory: Meta<typeof TextResponse> = {
  ...journeysAdminConfig,
  component: TextResponse,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/TextResponse',
  // do not remove these parameters for this story, see: https://github.com/storybookjs/storybook/issues/17025
  parameters: {
    docs: {
      source: { type: 'code' }
    }
  }
}

type Story = StoryObj<
  ComponentProps<typeof TextResponse> & { block: TreeBlock<TextResponseBlock> }
>

const Template: Story = {
  render: ({ ...args }) => {
    return (
      <Stack
        direction="row"
        spacing={4}
        sx={{
          overflowX: 'auto',
          py: 5,
          px: 6
        }}
      >
        <TextResponse {...args.block} />
      </Stack>
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
      label: 'label',
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

export default TextResponseStory
