import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { MediaListItem } from '.'

const MediaListItemDemo: Meta<typeof MediaListItem> = {
  ...simpleComponentConfig,
  component: MediaListItem,
  title: 'Journeys-Admin/MediaListItem'
}

type Story = StoryObj<typeof MediaListItem>

const Template: Story = {
  render: (args) => (
    <Paper elevation={0} sx={{ p: 2 }}>
      <Stack direction="row">
        <MediaListItem {...args} />
      </Stack>
    </Paper>
  )
}

export const Default: Story = {
  ...Template,
  args: {
    title: 'This is a Heading',
    description: 'This is a description',
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_AndreasStory-0-0.mobileCinematicHigh.jpg'
  }
}

export const Overline: Story = {
  ...Template,
  args: {
    ...Default.args,
    overline: 'Overline'
  }
}

export const LongContent: Story = {
  ...Template,
  args: {
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

export const NoImage: Story = {
  ...Template,
  args: {
    ...Default.args,
    image: undefined
  }
}

export const Loading: Story = {
  ...Template,
  args: {
    loading: true
  }
}

export default MediaListItemDemo
