import NoteAddIcon from '@mui/icons-material/NoteAdd' // icon-replace: could use file-plus-01
import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import Edit2 from '@core/shared/ui/icons/Edit2'
import Plus2 from '@core/shared/ui/icons/Plus2'

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
  actionIcon: <Edit2 />,
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
  actionIcon: <Plus2 />,
  label: 'label',
  loading: true,
  onClick: noop
}

export default ContainedIconButtonDemo as Meta
