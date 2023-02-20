import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { MockedProvider } from '@apollo/client/testing'
import { noop } from 'lodash'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { CustomImage } from '.'

const CustomImageStory = {
  ...simpleComponentConfig,
  component: CustomImage,
  title: 'Journeys-Admin/ImageBlockEditor/CustomImage'
}

const Template: Story = () => (
  <MockedProvider mocks={[]}>
    <Box sx={{ bgcolor: 'background.paper' }}>
      <CustomImage onChange={noop} />
    </Box>
  </MockedProvider>
)

export const Default = Template.bind({})

export default CustomImageStory as Meta
