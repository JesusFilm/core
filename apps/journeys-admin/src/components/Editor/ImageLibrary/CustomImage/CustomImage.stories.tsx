import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps } from 'react'
import { noop } from 'lodash'
import { simpleComponentConfig } from '../../../../libs/storybook'

import { ImageUpload } from './ImageUpload'
import { CustomImage } from '.'

const CustomImageStory = {
  ...simpleComponentConfig,
  component: CustomImage,
  title: 'Journeys-Admin/Editor/ImageLibrary/CustomImage'
}

const Template: Story<ComponentProps<typeof CustomImage>> = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <Box sx={{ bgcolor: 'background.paper' }}>
      <ImageUpload {...args} onChange={noop} loading={false} />
      <CustomImage {...args} onChange={noop} />
    </Box>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {}

export default CustomImageStory as Meta
