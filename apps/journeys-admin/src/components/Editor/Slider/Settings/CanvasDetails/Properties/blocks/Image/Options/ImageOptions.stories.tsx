import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { simpleComponentConfig } from '../../../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'
import { Drawer } from '../../../../../Drawer'

import { ImageOptions } from './ImageOptions'

const Demo: Meta<typeof ImageOptions> = {
  ...simpleComponentConfig,
  component: ImageOptions,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Image/ImageOptions'
}

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

const Template: StoryObj<{ block: TreeBlock<ImageBlock> }> = {
  render: ({ block }) => {
    return (
      <MockedProvider>
        <ThemeProvider>
          <EditorProvider
            initialState={{
              selectedBlock: block
            }}
          >
            <Drawer title="Image Options">
              <ImageOptions />
            </Drawer>
          </EditorProvider>
        </ThemeProvider>
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...image
  }
}

export default Demo
