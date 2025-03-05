import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '../../../libs/storybook'

import { BottomAppBar } from './BottomAppBar'

const BottomAppBarStory: Meta<typeof BottomAppBar> = {
  ...watchConfig,
  component: BottomAppBar,
  title: 'Watch/Header/BottomAppBar',
  parameters: { layout: 'fullscreen' }
}

const Template: StoryObj<typeof BottomAppBar> = {
  render: (args) => <BottomAppBar {...args} />
}

export const Default = {
  ...Template,
  args: { lightTheme: true, bottomBarTrigger: false }
}

export const DarkTheme = {
  ...Template,
  args: { lightTheme: false, bottomBarTrigger: false }
}

export const TriggeredLightTheme = {
  ...Template,
  args: { lightTheme: true, bottomBarTrigger: true }
}

export const TriggeredDarkTheme = {
  ...Template,
  args: { lightTheme: false, bottomBarTrigger: true }
}

export default BottomAppBarStory
