import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { useState } from 'react'

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

const Template: StoryObj<typeof VideoHero> = {
  render: () => {
    const [hasPlayed, setHasPlayed] = useState(false)
    return (
      <MockedProvider mocks={[getLanguagesSlugMock, getSubtitleMock]}>
        <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
          <VideoProvider value={{ content: videos[0] }}>
            <VideoHero
              onPlay={() => setHasPlayed(true)}
              hasPlayed={hasPlayed}
            />
          </VideoProvider>
        </ThemeProvider>
      </MockedProvider>
    )
  }
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
