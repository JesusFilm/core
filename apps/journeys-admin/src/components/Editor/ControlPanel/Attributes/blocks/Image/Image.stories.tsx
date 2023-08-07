import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'
import { simpleComponentConfig } from '../../../../../../libs/storybook'

import { Image } from './Image'

const ImageStory = {
  ...simpleComponentConfig,
  component: Image,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Image'
}

export const Default: Story = () => {
  const image: TreeBlock<ImageBlock> = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    src: 'https://example.com/image.jpg',
    alt: '',
    width: 1920,
    height: 1080,
    blurhash: '',
    children: []
  }
  /* eslint-disable */
  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{
        overflowX: 'auto',
        py: 5,
        px: 6
      }}
    >
      <Image {...image} />
    </Stack>
  )
}
export const Filled: Story = () => {
  const image: TreeBlock<ImageBlock> = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    parentBlockId: 'card.id',
    parentOrder: 0,
    src: 'https://example.com/image.jpg',
    alt: 'Unsplash Image',
    width: 1920,
    height: 1080,
    blurhash: '',
    children: []
  }

  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{
        overflowX: 'auto',
        py: 5,
        px: 6
      }}
    >
      <Image {...image} />
    </Stack>
  )
}

export default ImageStory as Meta
