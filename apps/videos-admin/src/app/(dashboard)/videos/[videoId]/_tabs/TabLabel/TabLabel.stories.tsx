import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../../../../../libs/storybookConfig'

import { TabLabel } from './TabLabel'

const meta: Meta<typeof TabLabel> = {
  ...videosAdminConfig,
  component: TabLabel,
  title: 'Videos-Admin/TabLabel',
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

type Story = StoryObj<ComponentProps<typeof TabLabel>>

const Template: Story = {
  render: ({ ...args }) => <TabLabel label={args.label} count={args.count} />
}

export const Default = {
  ...Template,
  args: {
    label: 'Label',
    count: '100'
  }
}

export const NoCount = {
  ...Template,
  args: {
    label: 'Label'
  }
}

export default meta
