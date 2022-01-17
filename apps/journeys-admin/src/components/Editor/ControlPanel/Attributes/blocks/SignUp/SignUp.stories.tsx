import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import { Stack } from '@mui/material'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { GetJourneyForEdit_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../../../../__generated__/GetJourneyForEdit'
import {
  IconName,
  IconColor,
  IconSize
} from '../../../../../../../__generated__/globalTypes'
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
    submitLabel: null,
    action: null,
    submitIcon: null,
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
    submitLabel: 'Sign Up',
    action: {
      __typename: 'LinkAction',
      gtmEventName: 'signup',
      url: 'https://www.google.com'
    },
    submitIcon: {
      __typename: 'Icon',
      name: IconName.ArrowForwardRounded,
      color: IconColor.action,
      size: IconSize.lg
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
      <SignUp {...block} />
    </Stack>
  )
}

export default SignUpStory as Meta
