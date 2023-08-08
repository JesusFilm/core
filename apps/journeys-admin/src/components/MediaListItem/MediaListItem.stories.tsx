import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../libs/storybook'

import { MediaListItem } from '.'

const MediaListItemDemo = {
  ...simpleComponentConfig,
  component: MediaListItem,
  title: 'Journeys-Admin/MediaListItem'
}

const Template: Story<ComponentProps<typeof MediaListItem>> = ({ ...args }) => (
  <Paper elevation={0} sx={{ p: 2 }}>
    <Stack direction="row">
      <MediaListItem {...args} />
    </Stack>
  </Paper>
)

export const Default = Template.bind({})
Default.args = {
  id: 'id',
  title: 'This is a Heading',
  description: 'This is a description',
  image:
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg'
}

export const Overline = Template.bind({})
Overline.args = {
  ...Default.args,
  overline: 'Overline'
}

export const LongContent = Template.bind({})
LongContent.args = {
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

export const EndImage = Template.bind({})
EndImage.args = {
  ...LongContent.args,
  overline: '',
  description: 'This is a description',
  imagePosition: 'end'
}

export const Duration = Template.bind({})
Duration.args = {
  ...Default.args,
  duration: '2:34'
}

export const Loading = Template.bind({})
Loading.args = {
  ...Overline.args,
  ...Duration.args,
  loading: true
}

export default MediaListItemDemo as Meta
