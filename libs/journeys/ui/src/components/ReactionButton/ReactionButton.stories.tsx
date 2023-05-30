import { Story, Meta } from '@storybook/react'
import { ComponentProps } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { ReactionButton } from './ReactionButton'

const ReactionButtonDemo = {
  ...simpleComponentConfig,
  component: ReactionButton,
  title: 'Journeys-Ui/ReactionButton'
}

const Template: Story<ComponentProps<typeof ReactionButton>> = () => (
  <Stack
    direction="row"
    gap={12}
    sx={{ pb: 2, width: '584px' }}
    justifyContent="start"
  >
    <Stack direction="column" gap={4} justifyContent="center">
      <Typography>Like Icon</Typography>
      <Typography>Thumbsdown Icon</Typography>
    </Stack>
    <Stack direction="column" gap={4} alignItems="center">
      <ReactionButton variant="like" />
      <ReactionButton variant="thumbsdown" />
    </Stack>
  </Stack>
)

export const Default = Template.bind({})

export default ReactionButtonDemo as Meta
