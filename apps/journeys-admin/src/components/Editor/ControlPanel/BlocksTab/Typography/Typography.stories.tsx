import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../libs/storybook'
import { Typography } from '.'

const TypographyStory = {
  ...journeysAdminConfig,
  component: Typography,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab/Typography'
}

export const Default: Story = () => {
  return <Typography />
}

export default TypographyStory as Meta
