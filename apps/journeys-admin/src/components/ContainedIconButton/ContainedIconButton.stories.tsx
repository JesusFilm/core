import { Meta, Story } from '@storybook/react'
import Paper from '@mui/material/Paper'
import { ComponentProps } from 'react'
import Stack from '@mui/material/Stack'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { noop } from 'lodash'
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
  thumbnailIcon: <NoteAddIcon />,
  actionIcon: <AddIcon />,
  label: 'label',
  loading: false,
  onClick: noop
}

export const Complete = Template.bind({})
Complete.args = {
  thumbnailIcon: <NoteAddIcon />,
  actionIcon: <EditIcon />,
  label: 'Video Title',
  description: 'descripition',
  imageSrc:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
  loading: false,
  onClick: noop
}

export const Loading = Template.bind({})
Loading.args = {
  thumbnailIcon: <NoteAddIcon />,
  actionIcon: <AddIcon />,
  label: 'label',
  loading: true,
  onClick: noop
}

export default ContainedIconButtonDemo as Meta
