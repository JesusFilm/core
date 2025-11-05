import type { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { watchConfig } from '../../libs/storybook'
import { WatchProvider } from '../../libs/watchContext'

import { DialogLangSwitch } from '.'

const DialogLangSwitchStory: Meta<typeof DialogLangSwitch> = {
  ...watchConfig,
  component: DialogLangSwitch,
  title: 'Watch/DialogLangSwitch'
}

const defaultInitialState = {
  audioLanguage: '529',
  subtitleLanguage: '529',
  subtitleOn: false,
  videoId: 'video123'
}

const Template: StoryObj<typeof DialogLangSwitch> = {
  render: () => (
    <WatchProvider initialState={defaultInitialState}>
      <DialogLangSwitch open={true} handleClose={noop} />
    </WatchProvider>
  )
}

export const Default = { ...Template }

export default DialogLangSwitchStory
