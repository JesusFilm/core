import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { journeysConfig } from '../../libs/storybook'
import {
  basic,
  imageBlocks,
  videoBlocks,
  videoBlocksNoPoster,
  videoBlocksNoVideo,
  videoLoop
} from '../../libs/testData/storyData'

import { EmbeddedPreview } from './EmbeddedPreview'

const Demo: Meta<typeof EmbeddedPreview> = {
  ...journeysConfig,
  component: EmbeddedPreview,
  title: 'Journeys/EmbeddedPreview',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof EmbeddedPreview> = {
  render: ({ ...args }): ReactElement => (
    <MockedProvider>
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journeyId',
              themeMode: ThemeMode.light,
              themeName: ThemeName.base,
              seoTitle: 'my journey',
              language: {
                __typename: 'Language',
                id: '529',
                bcp47: 'en',
                iso3: 'eng',
                name: [
                  {
                    __typename: 'Translation',
                    value: 'English',
                    primary: true
                  }
                ]
              }
            } as unknown as Journey,
            variant: 'embed'
          }}
        >
          <EmbeddedPreview {...args} />
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    blocks: basic
  }
}

export const WithContent = {
  ...Template,
  args: {
    blocks: imageBlocks
  }
}

export const WithVideo = {
  ...Template,
  args: {
    blocks: videoBlocks
  }
}

export const WithVideoNoPoster = {
  ...Template,
  args: {
    blocks: videoBlocksNoPoster
  }
}

export const WithVideoNoVideo = {
  ...Template,
  args: {
    blocks: videoBlocksNoVideo
  }
}

export const WithVideoLoop = {
  ...Template,
  args: {
    blocks: videoLoop
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export default Demo
