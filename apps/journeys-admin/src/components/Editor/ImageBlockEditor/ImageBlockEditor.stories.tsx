import { Story, Meta } from '@storybook/react'
import { TreeBlock } from '@core/journeys/ui'
import { Box } from '@mui/system'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../libs/storybook'
import { ThemeMode } from '../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../ThemeProvider'
import { ImageBlockEditor } from './ImageBlockEditor'

const ImageEditorStory = {
  ...journeysAdminConfig,
  component: ImageBlockEditor,
  title: 'Journeys-Admin/Editor/ImageBlockEditor',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  },
  chromatic: {
    viewports: [360]
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
      <ImageBlockEditor
        selectedBlock={args.selectedBlock}
        onChange={onChange}
        onDelete={onDelete}
      />
    </Box>
  </ThemeProvider>
)

export const Default = Template.bind({})
Default.args = {
  selectedBlock: null
}

export const Image = Template.bind({})
Image.args = {
  selectedBlock: image
}

export default ImageEditorStory as Meta
