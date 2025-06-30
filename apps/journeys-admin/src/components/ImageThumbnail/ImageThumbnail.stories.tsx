import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import FilePlus1Icon from '@core/shared/ui/icons/FilePlus1'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../__generated__/GetJourney'
import { ThemeMode } from '../../../__generated__/globalTypes'

import { ImageThumbnail } from './ImageThumbnail'

const ImageEditorStory: Meta<typeof ImageThumbnail> = {
  ...simpleComponentConfig,
  component: ImageThumbnail,
  title: 'Journeys-Admin/ImageThumbnail',
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

const Template: StoryObj<typeof ImageThumbnail> = {
  render: ({ ...args }) => (
    <Box bgcolor="white">
      <ImageThumbnail
        imageSrc={args.imageSrc}
        imageAlt={args.imageAlt}
        loading={args.loading}
        icon={args.icon}
        error={args.error}
      />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    imageSrc: null,
    loading: false
  }
}

export const ImageFromBlock = {
  ...Template,
  args: {
    imageSrc: image.src,
    imageAlt: image.alt,
    loading: false
  }
}

export const Icon = {
  ...Template,
  args: {
    imageSrc: null,
    icon: <FilePlus1Icon />,
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
