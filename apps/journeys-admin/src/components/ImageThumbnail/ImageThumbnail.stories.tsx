import { Story, Meta } from '@storybook/react'
import type { TreeBlock } from '@core/journeys/ui/block'
import Box from '@mui/material/Box'

import NoteAddIcon from '@mui/icons-material/NoteAdd'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../libs/storybook'
import { ThemeMode } from '../../../__generated__/globalTypes'
import { ImageThumbnail } from './ImageThumbnail'

const ImageEditorStory = {
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
  alt: 'poster'
}

const Template: Story = ({ ...args }) => (
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

export const Default = Template.bind({})
Default.args = {
  imageSrc: null,
  loading: false
}

export const ImageFromBlock = Template.bind({})
ImageFromBlock.args = {
  imageSrc: image.src,
  imageAlt: image.alt,
  loading: false
}

export const Icon = Template.bind({})
Icon.arg = {
  imageSrc: null,
  icon: <NoteAddIcon />,
  loading: false
}

export const Loading = Template.bind({})
Loading.args = {
  selectedBlock: image,
  loading: true
}

export const Error = Template.bind({})
Error.args = {
  selectedBlock: null,
  error: true
}

export default ImageEditorStory as Meta
