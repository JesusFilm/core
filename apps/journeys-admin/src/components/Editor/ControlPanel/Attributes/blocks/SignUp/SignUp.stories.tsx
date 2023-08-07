import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourney'
import {
  IconColor,
  IconName,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { SignUp } from '.'

const SignUpStory = {
  ...simpleComponentConfig,
  component: SignUp,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/SignUp'
}

export const Default: Story = () => {
  const block: TreeBlock<SignUpBlock> = {
    id: 'signup.id',
    __typename: 'SignUpBlock',
    parentBlockId: null,
    parentOrder: 0,
    submitLabel: null,
    action: null,
    submitIconId: null,
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
      <SignUp {...block} />
    </Stack>
  )
}
export const Filled: Story = () => {
  const block: TreeBlock<SignUpBlock> = {
    id: 'signup.id',
    __typename: 'SignUpBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    submitLabel: 'Sign Up',
    action: {
      __typename: 'LinkAction',
      parentBlockId: 'signup.id',
      gtmEventName: 'signup',
      url: 'https://www.google.com'
    },
    submitIconId: 'icon',
    children: [
      {
        id: 'icon',
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
      <SignUp {...block} />
    </Stack>
  )
}

export default SignUpStory as Meta
