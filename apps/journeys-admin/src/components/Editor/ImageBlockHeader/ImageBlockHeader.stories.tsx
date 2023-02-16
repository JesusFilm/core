import { Story, Meta } from '@storybook/react'
import type { TreeBlock } from '@core/journeys/ui/block'
import Box from '@mui/material/Box'
import { ComponentProps } from 'react'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../libs/storybook'
import { ImageBlockHeader } from './ImageBlockHeader'

const ImageEditorStory = {
  ...simpleComponentConfig,
  component: ImageBlockHeader,
  title: 'Journeys-Admin/Editor/ImageBlockHeader',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const onDelete = async (): Promise<void> => await Promise.resolve()

const Template: Story<
  ComponentProps<typeof ImageBlockHeader> & { image: TreeBlock<ImageBlock> }
> = (args) => {
  return (
    <Box bgcolor="white">
      <ImageBlockHeader {...args} />
    </Box>
  )
}

export const Default = Template.bind({})
Default.args = {}

export const Applied = Template.bind({})
Applied.args = {
  selectedBlock: {
    id: 'Image Title',
    __typename: 'ImageBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
    alt: 'image.jpg',
    width: 1920,
    height: 1080,
    blurhash: ''
  },
  onDelete: { onDelete }
}

export const Source = Template.bind({})
Source.args = { isSource: true }

export const Loading = Template.bind({})
Loading.args = { loading: true }

export default ImageEditorStory as Meta
