import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import { Stack } from '@mui/material'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourneyForEdit_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
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
    label: 'Button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIcon: null,
    endIcon: null,
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
    id: 'button.id',
    __typename: 'ButtonBlock',
    parentBlockId: 'step1.id',
    label: 'Button',
    buttonVariant: ButtonVariant.text,
    buttonColor: ButtonColor.secondary,
    size: ButtonSize.large,
    startIcon: {
      __typename: 'Icon',
      name: IconName.ChatBubbleOutlineRounded,
      color: IconColor.secondary,
      size: IconSize.lg
    },
    endIcon: {
      __typename: 'Icon',
      name: IconName.ChatBubbleOutlineRounded,
      color: IconColor.secondary,
      size: IconSize.lg
    },
    action: {
      __typename: 'NavigateToBlockAction',
      gtmEventName: 'navigateToBlock',
      blockId: 'step2.id'
    },
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

export default ButtonStory as Meta
