import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Meta, Story } from '@storybook/react'
import { ComponentProps, ReactElement } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { VideoContentFields } from '../../../../__generated__/VideoContentFields'
import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { videos } from '../../Videos/__generated__/testData'

import { VideoHeading } from '.'

const VideoHeadingStory = {
  ...watchConfig,
  component: VideoHeading,
  title: 'Watch/VideoContentPage/VideoHeading',
  argTypes: {
    onShareClick: { action: 'share clicked' },
    onDownloadClick: { action: 'download clicked' }
  }
}

function Wrapper({
  content,
  container,
  ...args
}: ComponentProps<typeof VideoHeading> & {
  content: VideoContentFields
  container?: VideoContentFields
}): ReactElement {
  return (
    <ThemeProvider
      nested
      themeName={ThemeName.website}
      themeMode={ThemeMode.dark}
    >
      <Stack
        sx={{
          backgroundColor: 'background.default',
          py:
            args.hasPlayed === true ||
            (container?.childrenCount ?? 0) > 0 ||
            content.childrenCount > 0
              ? 5
              : 0
        }}
        spacing={5}
      >
        <VideoProvider value={{ content, container }}>
          <VideoHeading {...args} />
        </VideoProvider>
      </Stack>
    </ThemeProvider>
  )
}

const Template: Story<ComponentProps<typeof VideoHeading>> = ({ ...args }) => (
  <Stack spacing={2}>
    <Typography>Has Not Played without Container</Typography>
    <Wrapper content={videos[19]} {...args} />
    <Typography>Has Not Played with Container</Typography>
    <Wrapper
      content={videos[19]}
      container={videos[0]}
      videos={[videos[19]]}
      {...args}
    />
    <Typography>Has Played without Container</Typography>
    <Wrapper content={videos[19]} hasPlayed {...args} />
    <Typography>Has Played with Container</Typography>
    <Wrapper
      content={videos[19]}
      container={videos[0]}
      videos={[videos[19]]}
      hasPlayed
      {...args}
    />
    <Typography>Loading with Container</Typography>
    <Wrapper content={videos[19]} container={videos[0]} loading {...args} />
    <Typography>Loading without Container</Typography>
    <Wrapper content={videos[19]} loading {...args} />
  </Stack>
)

export const Default = Template.bind({})
Default.args = {
  content: videos[19]
}

export default VideoHeadingStory as Meta
