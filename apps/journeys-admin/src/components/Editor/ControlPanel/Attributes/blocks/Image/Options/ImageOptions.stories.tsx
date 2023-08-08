import { MockedProvider } from '@apollo/client/testing'
import MuiDrawer from '@mui/material/Drawer'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { ImageOptions } from './ImageOptions'

const ImageOptionsStory = {
  ...journeysAdminConfig,
  component: ImageOptions,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Image/ImageOptions',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
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

export const Default: Story = ({ ...args }) => (
  <MockedProvider>
    <ThemeProvider>
      <EditorProvider
        initialState={{
          selectedBlock: image
        }}
      >
        <MuiDrawer
          anchor="right"
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 328
            }
          }}
          ModalProps={{
            keepMounted: true
          }}
          open
        >
          <ImageOptions />
        </MuiDrawer>
        <MuiDrawer
          anchor="bottom"
          variant="temporary"
          open
          sx={{
            display: { xs: 'block', sm: 'none' }
          }}
        >
          <ImageOptions />
        </MuiDrawer>
      </EditorProvider>
    </ThemeProvider>
  </MockedProvider>
)

export default ImageOptionsStory as Meta
