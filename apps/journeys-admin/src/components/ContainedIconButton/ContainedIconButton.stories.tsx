import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import Edit2 from '@core/shared/ui/icons/Edit2'
import FilePlus1 from '@core/shared/ui/icons/FilePlus1'
import Plus2 from '@core/shared/ui/icons/Plus2'

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
    thumbnailIcon: <FilePlus1 />,
    actionIcon: <Edit2 />,
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
    thumbnailIcon: <FilePlus1 />,
    actionIcon: <Plus2 />,
    label: 'label',
    loading: true,
    onClick: noop
  }
}

export default ContainedIconButtonDemo
