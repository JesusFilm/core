import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../__generated__/GetJourney'
import { ThemeMode } from '../../../../__generated__/globalTypes'
import { simpleComponentConfig } from '../../../libs/storybook'
import { ThemeProvider } from '../../ThemeProvider'

import { ImageSource } from './ImageSource'

const ImageEditorStory = {
  ...simpleComponentConfig,
  component: ImageSource,
  title: 'Journeys-Admin/Editor/ImageSource',
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

const onChange = async (): Promise<void> => await Promise.resolve()
const onDelete = async (): Promise<void> => await Promise.resolve()

const Template: Story = ({ ...args }) => (
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

export const Default = Template.bind({})
Default.args = {
  selectedBlock: null,
  loading: false
}

export const Image = Template.bind({})
Image.args = {
  selectedBlock: image,
  loading: false
}

export default ImageEditorStory as Meta
