import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'

import { ImageBlockHeader } from './ImageBlockHeader'

const ImageEditorStory: Meta<typeof ImageBlockHeader> = {
  ...simpleComponentConfig,
  component: ImageBlockHeader,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/ImageBlockHeader',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const onDelete = async (): Promise<void> => await Promise.resolve()

type Story = StoryObj<
  ComponentProps<typeof ImageBlockHeader> & { image: TreeBlock<ImageBlock> }
>

const Template: Story = {
  render: (args) => {
    return (
      <Box bgcolor="white">
        <ImageBlockHeader {...args} />
      </Box>
    )
  }
}
export const Default = {
  ...Template,
  args: {}
}

export const Applied = {
  ...Template,
  args: {
    selectedBlock: {
      id: 'Image Title',
      __typename: 'ImageBlock',
      parentBlockId: 'card.id',
      parentOrder: 0,
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
      alt: 'image.jpg',
      width: 1920,
      height: 1080,
      blurhash: ''
    },
    onDelete: { onDelete }
  }
}

export const Source = { ...Template, args: { showAdd: true } }

export const Loading = {
  ...Template,
  args: { loading: true }
}

export const Error = { ...Template, args: { error: true } }

export const Edit = {
  ...Template,
  args: {
    selectedBlock: {
      id: 'Image Title',
      __typename: 'ImageBlock',
      parentBlockId: 'card.id',
      parentOrder: 0,
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
      alt: 'image.jpg',
      width: 1920,
      height: 1080,
      blurhash: ''
    },
    showAdd: true
  }
}

export default ImageEditorStory
