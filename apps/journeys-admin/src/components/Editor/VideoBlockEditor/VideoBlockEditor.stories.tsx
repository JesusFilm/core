import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { TreeBlock } from '@core/journeys/ui'
import { Box } from '@mui/system'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../libs/storybook'
import { ThemeMode } from '../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../ThemeProvider'
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
  src: 'https://via.placeholder.com/300x200',
  width: 300,
  height: 200,
  blurhash: '',
  alt: 'poster',
  children: []
}

const onChange = async (): Promise<void> => await Promise.resolve()
const onDelete = async (): Promise<void> => await Promise.resolve()

const Template: Story = ({ ...args }) => (
  <ThemeProvider>
    <Box width={328} bgcolor="white">
      <VideoBlockEditor
        selectedBlock={args.selectedBlock}
        onChange={onChange}
        onDelete={onDelete}
        parentBlockId={card.id}
        parentOrder={Number(card.parentOrder)}
      />
    </Box>
  </ThemeProvider>
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
    viewports: [360]
  }
}
MobileSettings.play = async () => {
  const settingsTab = await screen.getByTestId('videoSettingsTab')
  await userEvent.click(settingsTab)
}

export default BackgroundMediaStory as Meta
