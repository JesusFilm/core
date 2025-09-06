import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'
import { fn } from 'storybook/test'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../__generated__/BlockFields'
import { Drawer } from '../../../../Drawer'

import { Image } from './Image'

const Demo: Meta<typeof Image> = {
  ...simpleComponentConfig,
  component: Image,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Image'
}

const onClose = fn()

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
  children: [],
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

const Template: StoryObj<ComponentProps<typeof Image>> = {
  render: (args) => {
    /* eslint-disable */
    return (
      <EditorProvider initialState={{ selectedBlock: args }}>
        <Drawer title="Image Properties" onClose={onClose}>
          <Image {...args} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...image
  }
}

export const Filled = {
  ...Template,
  args: {
    ...image,
    src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
    alt: 'Unsplash Image'
  }
}

export default Demo
