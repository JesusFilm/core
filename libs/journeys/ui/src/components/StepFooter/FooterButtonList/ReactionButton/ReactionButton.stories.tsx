import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '../../../../libs/simpleComponentConfig'

import { ReactionButton } from './ReactionButton'

const ReactionButtonDemo: Meta<typeof ReactionButton> = {
  ...simpleComponentConfig,
  component: ReactionButton,
  title: 'Journeys-Ui/StepFooter/FooterButtonList/ReactionButton'
}

const Template: StoryObj<typeof ReactionButton> = {
  render: () => (
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
}

export const Default = {
  ...Template
}

export default ReactionButtonDemo
