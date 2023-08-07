import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../../../libs/simpleComponentConfig'

import { ReactionButton } from './ReactionButton'

const ReactionButtonDemo = {
  ...simpleComponentConfig,
  component: ReactionButton,
  title: 'Journeys-Ui/StepFooter/FooterButtonList/ReactionButton'
}

const Template: Story<ComponentProps<typeof ReactionButton>> = () => (
  <Stack
    direction="row"
    gap={12}
    sx={{ pb: 2, width: '584px' }}
    justifyContent="start"
  >
    <Stack direction="column" gap={4} justifyContent="center">
      <Typography>ThumbsUp Icon</Typography>
      <Typography>ThumbsDown Icon</Typography>
    </Stack>
    <Stack direction="column" gap={4} alignItems="center">
      <ReactionButton variant="thumbsup" />
      <ReactionButton variant="thumbsdown" />
    </Stack>
  </Stack>
)

export const Default = Template.bind({})

export default ReactionButtonDemo as Meta
