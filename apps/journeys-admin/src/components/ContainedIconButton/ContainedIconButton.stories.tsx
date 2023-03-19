import { Meta, Story } from '@storybook/react'
import Paper from '@mui/material/Paper'
import { ComponentProps } from 'react'
import Stack from '@mui/material/Stack'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { simpleComponentConfig } from '../../libs/storybook'
import { ContainedIconButton } from '.'

const ContainedIconButtonDemo = {
  ...simpleComponentConfig,
  component: ContainedIconButton,
  title: 'Journeys-Admin/ContainedIconButton'
}

const Template: Story<ComponentProps<typeof ContainedIconButton>> = ({
  ...args
}) => (
  <Paper elevation={0} sx={{ p: 2 }}>
    <Stack direction="row">
      <ContainedIconButton {...args} />
    </Stack>
  </Paper>
)

export const Default = Template.bind({})
Default.args = {
  icon: NoteAddIcon,
  label: 'label'
}

export default ContainedIconButtonDemo as Meta
