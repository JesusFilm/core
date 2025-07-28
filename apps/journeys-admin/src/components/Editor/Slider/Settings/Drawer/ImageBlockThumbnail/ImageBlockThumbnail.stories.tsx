import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import type { TreeBlock } from '@core/journeys/ui/block'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock
} from '../../../../../../../__generated__/BlockFields'
import { ThemeMode } from '../../../../../../../__generated__/globalTypes'

import { ImageBlockThumbnail } from './ImageBlockThumbnail'

const ImageEditorStory: Meta<typeof ImageBlockThumbnail> = {
  ...simpleComponentConfig,
  component: ImageBlockThumbnail,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/ImageBlockThumbnail',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: ThemeMode.light,
  themeName: null,
  fullscreen: true,
  backdropBlur: null,
  children: []
}

const image: ImageBlock = {
  id: 'poster1.id',
  __typename: 'ImageBlock',
  parentBlockId: card.id,
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
  width: 300,
  height: 200,
  blurhash: '',
  alt: 'poster',
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

const Template: StoryObj<typeof ImageBlockThumbnail> = {
  render: ({ ...args }) => (
    <Box bgcolor="white">
      <ImageBlockThumbnail
        selectedBlock={args.selectedBlock}
        loading={args.loading}
        error={args.error}
      />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    selectedBlock: null,
    loading: false
  }
}

export const Image = {
  ...Template,
  args: {
    selectedBlock: image,
    loading: false
  }
}

export const Loading = {
  ...Template,
  args: {
    selectedBlock: image,
    loading: true
  }
}

export const Error = {
  ...Template,
  args: {
    selectedBlock: null,
    error: true
  }
}

export default ImageEditorStory
