import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement, useState } from 'react'
import { screen, userEvent } from 'storybook/test'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { watchConfig } from '../../../libs/storybook'
import { VideoProvider } from '../../../libs/videoContext'
import { getLanguagesSlugMock } from '../../AudioLanguageDialog/testData'
import { getSubtitleMock } from '../../SubtitleDialog/testData'
import { videos } from '../../Videos/__generated__/testData'

import { VideoHero } from './VideoHero'

const VideoHeroStory: Meta<typeof VideoHero> = {
  ...watchConfig,
  component: VideoHero,
  title: 'Watch/VideoContentPage/VideoHero'
}

const VideoHeroComponent = (): ReactElement => {
  const [hasPlayed, setHasPlayed] = useState(false)
  return (
    <MockedProvider mocks={[getLanguagesSlugMock, getSubtitleMock]}>
      <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
        <VideoProvider value={{ content: videos[0] }}>
          <VideoHero onPlay={() => setHasPlayed(true)} hasPlayed={hasPlayed} />
        </VideoProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}

const Template: StoryObj<typeof VideoHero> = {
  render: () => <VideoHeroComponent />
}

export const Default = { ...Template }

export const VideoPlayer = {
  ...Template,
  play: async () => {
    const CustomPlayButton = screen.getAllByRole('button')[1]
    await userEvent.click(CustomPlayButton)
  }
}

export default VideoHeroStory
