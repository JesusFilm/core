import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../libs/storybook'

import { ImageBlockHeader } from './ImageBlockHeader'

const ImageEditorStory: Meta<typeof ImageBlockHeader> = {
  ...simpleComponentConfig,
  component: ImageBlockHeader,
  title: 'Journeys-Admin/Editor/ImageBlockHeader',
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

export const UnsplashAuthor = {
  ...Template,
  args: {
    ...Applied.args,
    unsplashAuthor: {
      fullname: 'Levi Meir Clancy',
      username: 'levimeirclancy'
    }
  }
}

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
