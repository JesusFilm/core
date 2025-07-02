import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ComponentProps } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../__generated__/globalTypes'
import { Drawer } from '../../../../Drawer'

import { Card } from '.'

const Demo: Meta<typeof Card> = {
  ...journeysAdminConfig,
  component: Card,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Card'
}

const onClose = fn()

const block: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  coverBlockId: null,
  parentOrder: 0,
  backgroundColor: null,
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  fullscreen: false,
  backdropBlur: null,
  children: []
}

const Template: StoryObj<ComponentProps<typeof Card>> = {
  render: (args) => {
    return (
      <EditorProvider initialState={{ selectedBlock: args }}>
        <Drawer title="Card Properties" onClose={onClose}>
          <Card {...args} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    ...block
  }
}

export const Filled: StoryObj<typeof Card> = {
  render: () => {
    const block: TreeBlock<CardBlock> = {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'step1.id',
      coverBlockId: 'image1.id',
      parentOrder: 0,
      backgroundColor: '#00ccff',
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: true,
      backdropBlur: null,
      children: [
        {
          __typename: 'ImageBlock',
          id: 'image1.id',
          src: 'https://i.imgur.com/07iLnvN.jpg',
          alt: 'random image from unsplash',
          width: 1920,
          height: 1080,
          parentBlockId: 'card1.id',
          parentOrder: 0,
          blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
          children: [],
          scale: null,
          focalLeft: 50,
          focalTop: 50
        }
      ]
    }

    return (
      <EditorProvider initialState={{ selectedBlock: block }}>
        <Drawer title="Card Properties" onClose={onClose}>
          <Card {...block} />
        </Drawer>
      </EditorProvider>
    )
  }
}

export default Demo
