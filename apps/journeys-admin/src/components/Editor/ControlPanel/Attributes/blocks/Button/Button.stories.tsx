import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { Button } from '.'

const ButtonStory: Meta<typeof Button> = {
  ...simpleComponentConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button'
}

export const Default: StoryObj<typeof Button> = {
  render: () => {
    const block: TreeBlock<ButtonBlock> = {
      id: 'button.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      label: 'Button',
      buttonVariant: null,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      action: null,
      children: []
    }
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
        <Button {...block} />
      </Stack>
    )
  }
}
export const Filled: StoryObj<typeof Button> = {
  render: () => {
    const block: TreeBlock<ButtonBlock> = {
      id: 'button1.id',
      __typename: 'ButtonBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      label: 'Button',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.secondary,
      size: ButtonSize.large,
      startIconId: 'icon1',
      endIconId: 'icon2',
      action: {
        __typename: 'NavigateToBlockAction',
        parentBlockId: 'button1.id',
        gtmEventName: 'navigateToBlock',
        blockId: 'step2.id'
      },
      children: [
        {
          id: 'icon1',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 0,
          iconName: IconName.ChatBubbleOutlineRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        },
        {
          id: 'icon2',
          __typename: 'IconBlock',
          parentBlockId: 'button',
          parentOrder: 1,
          iconName: IconName.ChevronRightRounded,
          iconColor: IconColor.secondary,
          iconSize: IconSize.lg,
          children: []
        }
      ]
    }
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
        <Button {...block} />
      </Stack>
    )
  }
}

export default ButtonStory
