import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../libs/storybook'

import { ImageBlockHeader } from './ImageBlockHeader'

const ImageEditorStory = {
  ...simpleComponentConfig,
  component: ImageBlockHeader,
  title: 'Journeys-Admin/Editor/ImageBlockHeader',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const onDelete = async (): Promise<void> => await Promise.resolve()

const Template: Story<
  ComponentProps<typeof ImageBlockHeader> & { image: TreeBlock<ImageBlock> }
> = (args) => {
  return (
    <Box bgcolor="white">
      <ImageBlockHeader {...args} />
    </Box>
  )
}

export const Default = Template.bind({})
Default.args = {}

export const Applied = Template.bind({})
Applied.args = {
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

export const Source = Template.bind({})
Source.args = { showAdd: true }

export const Loading = Template.bind({})
Loading.args = { loading: true }

export const Error = Template.bind({})
Error.args = { error: true }

export const UnsplashAuthor = Template.bind({})
UnsplashAuthor.args = {
  ...Applied.args,
  unsplashAuthor: {
    fullname: 'Levi Meir Clancy',
    username: 'levimeirclancy'
  }
}

export const Edit = Template.bind({})
Edit.args = {
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

export default ImageEditorStory as Meta
