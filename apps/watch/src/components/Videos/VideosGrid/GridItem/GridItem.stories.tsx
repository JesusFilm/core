import Box from '@mui/material/Box'
import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../../../libs/storybook'
import { videos } from '../../testData'
import { GridItem } from './GridItem'

const GridItemStory = {
  ...watchConfig,
  component: GridItem,
  title: 'Watch/GridItem'
}

const Template: Story = ({ ...args }) => {
  return (
    <Box sx={{ maxWidth: '338px', display: 'flex', alignItems: 'flex-start' }}>
      <GridItem {...args} />
    </Box>
  )
}

export const Default = Template.bind({})

Default.args = {
  video: videos[0]
}

export default GridItemStory as Meta
