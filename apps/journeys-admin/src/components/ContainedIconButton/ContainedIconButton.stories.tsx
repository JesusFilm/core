import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '../../libs/storybook'

import { ContainedIconButton } from '.'

const ContainedIconButtonDemo: Meta<typeof ContainedIconButton> = {
  ...simpleComponentConfig,
  component: ContainedIconButton,
  title: 'Journeys-Admin/ContainedIconButton'
}

const Template: StoryObj<typeof ContainedIconButton> = {
  render: ({ ...args }) => (
    <Box sx={{ maxWidth: '300px' }}>
      <ContainedIconButton {...args} />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    label: 'label',
    onClick: noop
  }
}

export const Complete = {
  ...Template,
  args: {
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
}

export const Loading = {
  ...Template,
  args: {
    thumbnailIcon: <NoteAddIcon />,
    actionIcon: <AddIcon />,
    label: 'label',
    loading: true,
    onClick: noop
  }
}

export default ContainedIconButtonDemo
