import { Story, Meta } from '@storybook/react'
import Box from '@mui/material/Box'
import { MockedProvider } from '@apollo/client/testing'
import { noop } from 'lodash'
import { ComponentProps } from 'react'
import { simpleComponentConfig } from '../../../../../libs/storybook'

import { AddByFile } from '.'

const AddByFileStory = {
  ...simpleComponentConfig,
  component: AddByFile,
  title: 'Journeys-Admin/Editor/VideoLibrary/VideoFromCloudflare/AddByFile'
}

const Template: Story<ComponentProps<typeof AddByFile>> = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <Box sx={{ backgroundColor: 'background.paper' }}>
      <AddByFile {...args} onChange={noop} />
    </Box>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  onChange: noop
}

export default AddByFileStory as Meta
