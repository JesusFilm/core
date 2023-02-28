import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook/config'
import { videos } from '../../Videos/__generated__/testData'
import { VideoCategories } from './VideoCategories'

const VideoCategoriesStory: ComponentMeta<typeof VideoCategories> = {
  ...watchConfig,
  component: VideoCategories,
  title: 'Watch/VideoCategories'
}

const Template: ComponentStory<typeof VideoCategories> = (args) => {
  return (
    <Stack spacing={2}>
      <Box>
        <VideoCategories {...args} />
      </Box>
    </Stack>
  )
}

export const Default = Template.bind({})
Default.args = {
  videos: videos.slice(0, 3)
}

export default VideoCategoriesStory
