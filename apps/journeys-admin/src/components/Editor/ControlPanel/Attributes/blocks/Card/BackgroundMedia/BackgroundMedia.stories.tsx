import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { MockedProvider } from '@apollo/client/testing'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { JourneyProvider } from '../../../../../../../libs/context'
import {
  ThemeMode,
  ThemeName,
  JourneyStatus
} from '../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { Drawer } from '../../../../../Drawer'
import { BackgroundMedia } from '.'

const BackgroundMediaStory = {
  ...journeysAdminConfig,
  component: BackgroundMedia,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Card/BackgroundMedia',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  locale: 'en-US',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: []
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
  src: 'https://via.placeholder.com/300x200',
  width: 300,
  height: 200,
  blurhash: '',
  alt: 'poster',
  children: []
}

const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: card.id,
  parentOrder: 0,
  src: 'https://source.unsplash.com/random/1920x1080',
  alt: 'random image from unsplash',
  width: 1920,
  height: 1080,
  blurhash: '',
  children: []
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <ThemeProvider>
      <JourneyProvider value={journey}>
        <EditorProvider
          initialState={{
            ...args,
            drawerChildren: <BackgroundMedia />,
            drawerTitle: 'Background Media',
            drawerMobileOpen: true
          }}
        >
          <Drawer />
        </EditorProvider>
      </JourneyProvider>
    </ThemeProvider>
  </MockedProvider>
)

export const DefaultNoVideo = Template.bind({})
DefaultNoVideo.args = {
  selectedBlock: card
}

export const Video = Template.bind({})
Video.args = {
  selectedBlock: {
    ...card,
    children: [{ ...video, posterBlockId: poster.id, children: [poster] }],
    coverBlockId: video.id
  }
}

export const VideoNoPoster = Template.bind({})
VideoNoPoster.args = {
  selectedBlock: {
    ...card,
    children: [video],
    coverBlockId: video.id
  }
}

export const VideoSettings = Template.bind({})
VideoSettings.args = {
  selectedBlock: {
    ...card,
    children: [{ ...video, posterBlockId: poster.id, children: [poster] }],
    coverBlockId: video.id
  }
}
VideoSettings.play = async () => {
  const settingsTab = await screen.getByTestId('videoSettingsTab')
  await userEvent.click(settingsTab)
}

export const VideoSettingsNoPoster = Template.bind({})
VideoSettingsNoPoster.args = {
  selectedBlock: {
    ...card,
    children: [video],
    coverBlockId: video.id
  }
}
VideoSettingsNoPoster.play = async () => {
  const settingsTab = await screen.getByTestId('videoSettingsTab')
  await userEvent.click(settingsTab)
}

export const NoImage = Template.bind({})
NoImage.args = {
  selectedBlock: card
}
NoImage.play = async () => {
  const imageTab = await screen.getByTestId('bgvideo-image-tab')
  await userEvent.click(imageTab)
}

export const Image = Template.bind({})
Image.args = {
  selectedBlock: {
    ...card,
    coverBlockId: image.id,
    children: [image]
  }
}

export default BackgroundMediaStory as Meta
