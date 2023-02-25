import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { MockedProvider } from '@apollo/client/testing'
import { noop } from 'lodash'
import { simpleComponentConfig } from '../../../../../libs/storybook'

import { ImageUpload } from '.'

const ImageUploadStory = {
  ...simpleComponentConfig,
  component: ImageUpload,
  title: 'Journeys-Admin/Editor/ImageLibrary/CustomImage/ImageUpload'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <Box sx={{ maxWidth: 280, maxHeight: 180 }}>
      <ImageUpload {...args} onChange={noop} />
    </Box>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {}

export const Loading = Template.bind({})
Loading.args = { loading: true }

export default ImageUploadStory as Meta
