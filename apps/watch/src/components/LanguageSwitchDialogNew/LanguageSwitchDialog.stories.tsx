import type { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { watchConfig } from '../../libs/storybook'
import { WatchProvider } from '../../libs/watchContext'

import { LanguageSwitchDialog } from '.'

const LanguageSwitchDialogStory: Meta<typeof LanguageSwitchDialog> = {
  ...watchConfig,
  component: LanguageSwitchDialog,
  title: 'Watch/LanguageSwitchDialogNew'
}

const defaultInitialState = {
  siteLanguage: 'en',
  audioLanguage: '529',
  subtitleLanguage: '529',
  subtitleOn: false,
  videoId: 'video123'
}

const Template: StoryObj<typeof LanguageSwitchDialog> = {
  render: () => (
    // <MockedProvider mocks={[getAllLanguagesMock]} addTypename={false}>
    <WatchProvider initialState={defaultInitialState}>
      <LanguageSwitchDialog open={true} handleClose={noop} />
    </WatchProvider>
    // </MockedProvider>
  )
}

export const Default = { ...Template }

export default LanguageSwitchDialogStory
