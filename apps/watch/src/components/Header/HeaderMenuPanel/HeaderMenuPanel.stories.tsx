import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { watchConfig } from '../../../libs/storybook'

import { HeaderMenuPanel } from './HeaderMenuPanel'

const HeaderMenuPanelStory: Meta<typeof HeaderMenuPanel> = {
  ...watchConfig,
  component: HeaderMenuPanel,
  title: 'Watch/Header/HeaderMenuPanel',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof HeaderMenuPanel> = {
  render: ({ ...args }) => <HeaderMenuPanel {...args} />
}

export const Default = {
  ...Template,
  args: {
    onClose: noop
  }
}

export default HeaderMenuPanelStory
