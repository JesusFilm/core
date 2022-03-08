import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import { Box } from '@mui/material'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../libs/storybook'
import { ThemeMode } from '../../../../__generated__/globalTypes'
import { ImageBlockHeader } from './ImageBlockHeader'

const ImageEditorStory = {
  ...simpleComponentConfig,
  component: ImageBlockHeader,
  title: 'Journeys-Admin/Editor/ImageBlockHeader',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen',
    chromatic: {
      ...simpleComponentConfig.parameters.chromatic,
      viewports: [360]
    }
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
  alt: 'really long alt text'
}

const onDelete = async (): Promise<void> => await Promise.resolve()

const Template: Story = ({ ...args }) => (
  <Box width={328} bgcolor="white">
    <ImageBlockHeader
      selectedBlock={args.selectedBlock}
      showDelete={args.showDelete}
      header={args.header}
      caption={args.caption}
      onDelete={onDelete}
    />
  </Box>
)

export const Default = Template.bind({})
Default.args = {
  selectedBlock: null,
  header: 'Header',
  caption: 'caption',
  showDelete: false
}

export const Image = Template.bind({})
Image.args = {
  selectedBlock: image,
  header: image.alt,
  caption: '300x200px',
  showDelete: true
}

export default ImageEditorStory as Meta
