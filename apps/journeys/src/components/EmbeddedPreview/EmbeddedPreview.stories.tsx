import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { ComponentProps, ReactElement } from 'react'

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

const Demo = {
  ...journeysConfig,
  component: EmbeddedPreview,
  title: 'Journeys/EmbeddedPreview',
  parameters: {
    ...journeysConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story<ComponentProps<typeof EmbeddedPreview>> = ({
  ...args
}): ReactElement => (
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

export const Default = Template.bind({})
Default.args = {
  blocks: basic
}

export const WithContent = Template.bind({})
WithContent.args = {
  blocks: imageBlocks
}

export const WithVideo = Template.bind({})
WithVideo.args = {
  blocks: videoBlocks
}

export const WithVideoNoPoster = Template.bind({})
WithVideoNoPoster.args = {
  blocks: videoBlocksNoPoster
}

export const WithVideoNoVideo = Template.bind({})
WithVideoNoVideo.args = {
  blocks: videoBlocksNoVideo
}

export const WithVideoLoop = Template.bind({})
WithVideoLoop.args = {
  blocks: videoLoop
}
WithVideoLoop.parameters = {
  chromatic: { disableSnapshot: true }
}

export default Demo as Meta
