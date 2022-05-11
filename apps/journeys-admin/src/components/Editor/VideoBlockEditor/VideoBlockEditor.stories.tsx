import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { TreeBlock } from '@core/journeys/ui'
import MuiDrawer from '@mui/material/Drawer'
import { MockedProvider } from '@apollo/client/testing'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../libs/storybook'
import { ThemeMode } from '../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../ThemeProvider'
import { videos } from '../VideoLibrary/VideoList/VideoListData'
import { GET_VIDEOS } from '../VideoLibrary/VideoList/VideoList'
import { VideoBlockEditor } from './VideoBlockEditor'

const BackgroundMediaStory = {
  ...journeysAdminConfig,
  component: VideoBlockEditor,
  title: 'Journeys-Admin/Editor/VideoBlockEditor',
  parameters: {
    ...journeysAdminConfig.parameters,
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

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: card.id,
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: false,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  video: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'Translation',
        value: 'FallingPlates'
      }
    ],
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  posterBlockId: 'poster1.id',
  children: []
}

const poster: TreeBlock<ImageBlock> = {
  id: 'poster1.id',
  __typename: 'ImageBlock',
  parentBlockId: video.id,
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
  width: 300,
  height: 200,
  blurhash: '',
  alt: 'poster',
  children: []
}

const onChange = async (): Promise<void> => await Promise.resolve()
const onDelete = async (): Promise<void> => await Promise.resolve()

const Template: Story = ({ ...args }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_VIDEOS,
          variables: {
            offset: 0,
            limit: 5,
            where: {
              availableVariantLanguageIds: ['529'],
              title: null
            }
          }
        },
        result: {
          data: {
            videos
          }
        }
      }
    ]}
  >
    <ThemeProvider>
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
        <VideoBlockEditor
          selectedBlock={args.selectedBlock}
          onChange={onChange}
          onDelete={onDelete}
        />
      </MuiDrawer>
      <MuiDrawer
        anchor="bottom"
        variant="temporary"
        open
        sx={{
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <VideoBlockEditor
          selectedBlock={args.selectedBlock}
          onChange={onChange}
          onDelete={onDelete}
        />
      </MuiDrawer>
    </ThemeProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  selectedBlock: null
}

export const Filled = Template.bind({})
Filled.args = {
  selectedBlock: {
    ...video,
    children: [poster]
  }
}

export const PosterModal = Template.bind({})
PosterModal.args = {
  selectedBlock: {
    ...video,
    children: [poster]
  }
}

PosterModal.play = async () => {
  const settingsTab = await screen.getAllByTestId('posterCreateButton')[0]
  await userEvent.click(settingsTab)
}

export default BackgroundMediaStory as Meta
