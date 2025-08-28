import type { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { watchConfig } from '../../libs/storybook'
import { WatchProvider } from '../../libs/watchContext'

import { LanguageSwitchDialog } from '.'

const LanguageSwitchDialogStory: Meta<typeof LanguageSwitchDialog> = {
  ...watchConfig,
  component: LanguageSwitchDialog,
  title: 'Watch/LanguageSwitchDialog'
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
    <WatchProvider initialState={defaultInitialState}>
      <LanguageSwitchDialog open={true} handleClose={noop} />
    </WatchProvider>
  )
}

export const Default = { ...Template }

export default LanguageSwitchDialogStory
