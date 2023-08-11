import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../../../../libs/storybook'

import { ImageUpload } from '.'

const ImageUploadStory = {
  ...simpleComponentConfig,
  component: ImageUpload,
  title: 'Journeys-Admin/Editor/ImageBlockEditor/CustomImage/ImageUpload'
}

const Template: Story<ComponentProps<typeof ImageUpload>> = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <Box sx={{ backgroundColor: 'background.paper' }}>
      <ImageUpload {...args} onChange={noop} />
    </Box>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  selectedBlock: {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'card',
    parentOrder: 0
  }
}

export const Loading = Template.bind({})
Loading.args = { loading: true }

export const Error = Template.bind({})
Error.args = { error: true }

export default ImageUploadStory as Meta
