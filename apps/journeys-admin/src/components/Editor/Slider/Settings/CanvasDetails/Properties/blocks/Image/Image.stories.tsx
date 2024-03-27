import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { simpleComponentConfig } from '../../../../../../../../libs/storybook'
import { Drawer } from '../../../../Drawer'

import { Image } from './Image'

const Demo: Meta<typeof Image> = {
  ...simpleComponentConfig,
  component: Image,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Image'
}

export const Default: StoryObj<typeof Image> = {
  render: () => {
    const image: TreeBlock<ImageBlock> = {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: 'card.id',
      parentOrder: 0,
      src: null,
      alt: '',
      width: 1920,
      height: 1080,
      blurhash: '',
      children: []
    }
    /* eslint-disable */
    return (
      <EditorProvider>
        <Drawer title="Image Properties">
          <Image {...image} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Filled: StoryObj<typeof Image> = {
  render: () => {
    const image: TreeBlock<ImageBlock> = {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: 'card.id',
      parentOrder: 0,
      src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
      alt: 'Unsplash Image',
      width: 1920,
      height: 1080,
      blurhash: '',
      children: []
    }

    return (
      <EditorProvider initialState={{ selectedBlock: image }}>
        <Drawer title="Image Properties">
          <Image {...image} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export default Demo
