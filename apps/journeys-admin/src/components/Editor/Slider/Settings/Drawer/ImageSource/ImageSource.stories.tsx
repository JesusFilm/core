import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import type { TreeBlock } from '@core/journeys/ui/block'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock
} from '../../../../../../../__generated__/BlockFields'
import { ThemeMode } from '../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../ThemeProvider'

import { ImageSource } from './ImageSource'

const ImageEditorStory: Meta<typeof ImageSource> = {
  ...simpleComponentConfig,
  component: ImageSource,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/ImageSource',
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

const onChange = async (): Promise<void> => await Promise.resolve()
const onDelete = async (): Promise<void> => await Promise.resolve()

const Template: StoryObj<typeof ImageSource> = {
  render: ({ ...args }) => (
    <ThemeProvider>
      <Box width={328} bgcolor="white">
        <ImageSource
          selectedBlock={args.selectedBlock}
          onChange={onChange}
          onDelete={onDelete}
          loading={args.loading}
        />
      </Box>
    </ThemeProvider>
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

export default ImageEditorStory
