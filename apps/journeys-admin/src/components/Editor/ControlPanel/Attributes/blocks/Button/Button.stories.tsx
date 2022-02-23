import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import Stack from '@mui/material/Stack'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourney'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName,
  IconColor,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { Button } from '.'

const ButtonStory = {
  ...simpleComponentConfig,
  component: Button,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Button'
}

export const Default: Story = () => {
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
export const Filled: Story = () => {
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

export default ButtonStory as Meta
