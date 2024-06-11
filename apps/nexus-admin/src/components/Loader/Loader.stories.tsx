import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'

import { Loader } from '.'

const LoaderDemo: Meta<typeof Loader> = {
  ...simpleComponentConfig,
  component: Loader,
  title: 'Nexus-Admin/Loader'
}

const Template: StoryObj<typeof Loader> = {
  render: ({ ...args }) => <Loader {...args} />
}

export const Default = {
  ...Template,
  args: {}
}

export default LoaderDemo
