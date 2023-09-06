import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'

import { MediaListItem } from '.'

const MediaListItemDemo: Meta<typeof MediaListItem> = {
  ...simpleComponentConfig,
  component: MediaListItem,
  title: 'Journeys-Admin/MediaListItem'
}

const Template: StoryObj<typeof MediaListItem> = {
  render: ({ ...args }) => (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Stack direction="row">
        <MediaListItem {...args} />
      </Stack>
    </Paper>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'id',
    title: 'This is a Heading',
    description: 'This is a description',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg'
  }
}

export const Overline = {
  ...Template,
  args: {
    ...Default.args,
    overline: 'Overline'
  }
}

export const LongContent = {
  ...Template,
  args: {
    id: 'id',
    overline:
      'This is overline is really really really really really really really really really really really really really really long',
    title:
      'This is a really really really really really really really really really really really really long Heading',
    description:
      'This is a really really really really really really really really really really really really really really really really really really long description',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg'
  }
}

export const EndImage = {
  ...Template,
  args: {
    ...LongContent.args,
    overline: '',
    description: 'This is a description',
    imagePosition: 'end'
  }
}

export const Duration = {
  ...Template,
  args: {
    ...Default.args,
    duration: '2:34'
  }
}

export const Loading = {
  ...Template,
  args: {
    ...Overline.args,
    ...Duration.args,
    loading: true
  }
}

export default MediaListItemDemo
