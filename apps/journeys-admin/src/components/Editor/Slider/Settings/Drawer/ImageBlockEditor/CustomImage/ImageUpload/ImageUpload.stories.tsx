import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ImageUpload } from '.'

const ImageUploadStory: Meta<typeof ImageUpload> = {
  ...simpleComponentConfig,
  component: ImageUpload,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/ImageBlockEditor/CustomImage/ImageUpload'
}

type Story = StoryObj<ComponentProps<typeof ImageUpload>>

const Template: Story = {
  render: ({ ...args }) => (
    <MockedProvider mocks={[]}>
      <Box sx={{ backgroundColor: 'background.paper' }}>
        <ImageUpload {...args} onChange={noop} />
      </Box>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
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
}

export const Loading = {
  ...Template,
  args: { loading: true }
}

export const Error = {
  ...Template,
  args: { error: true }
}

export default ImageUploadStory
