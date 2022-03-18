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
  title: 'my video',
  startAt: 0,
  endAt: null,
  muted: false,
  autoplay: true,
  fullsize: true,
  videoContent: {
    __typename: 'VideoGeneric',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
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
            where: {
              availableVariantLanguageIds: ['529'],
              title: null
            }
          }
        },
        result: {
          data: {
            videos: videos
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
          parentBlockId={card.id}
          parentOrder={Number(card.parentOrder)}
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
          parentBlockId={card.id}
          parentOrder={Number(card.parentOrder)}
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

export const MobileSettings = Template.bind({})
MobileSettings.args = {
  selectedBlock: {
    ...video,
    children: [poster]
  }
}
MobileSettings.parameters = {
  chromatic: {
    viewports: [360, 540]
  }
}
MobileSettings.play = async () => {
  const settingsTab = await screen.getAllByTestId('videoSettingsTab')[1]
  await userEvent.click(settingsTab)
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
