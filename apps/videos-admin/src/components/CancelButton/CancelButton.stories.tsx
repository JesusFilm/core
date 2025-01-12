import type { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { CancelButton } from './CancelButton'

type StoryArgs = ComponentPropsWithoutRef<typeof CancelButton>

const meta = {
  ...videosAdminConfig,
  component: CancelButton,
  title: 'Videos-Admin/CancelButton'
} satisfies Meta<StoryArgs>

type Story = StoryObj<typeof meta>

export const Hidden: Story = {
  args: { show: false, handleCancel: noop }
}

export const Disabled: Story = {
  args: { show: true, handleCancel: noop }
}

export default meta
