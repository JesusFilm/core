import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

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
  <Box sx={{ maxWidth: '300px' }}>
    <ContainedIconButton {...args} />
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  label: 'label',
  onClick: noop
}

export const Complete = Template.bind({})
Complete.args = {
  thumbnailIcon: <NoteAddIcon />,
  actionIcon: <EditIcon />,
  label: 'Video Title',
  description: 'description',
  imageSrc:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
  imageAlt: 'Image Alt Test Text',
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
