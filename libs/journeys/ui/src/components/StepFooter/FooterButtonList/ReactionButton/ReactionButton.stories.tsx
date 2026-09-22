import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { simpleComponentConfig } from '../../../../test/simpleComponentConfig'

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
      sx={{
        gap: 12,
        justifyContent: 'start',
        pb: 2,
        width: '584px'
      }}
    >
      <Stack
        direction="column"
        sx={{
          gap: 4,
          justifyContent: 'center'
        }}
      >
        <Typography>ThumbsUp Icon</Typography>
        <Typography>ThumbsDown Icon</Typography>
      </Stack>
      <Stack
        direction="column"
        sx={{
          gap: 4,
          alignItems: 'center'
        }}
      >
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
