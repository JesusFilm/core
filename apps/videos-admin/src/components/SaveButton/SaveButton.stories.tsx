import type { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { SaveButton } from './SaveButton'

type StoryArgs = ComponentPropsWithoutRef<typeof SaveButton>

const meta = {
  ...videosAdminConfig,
  component: SaveButton,
  title: 'Videos-Admin/SaveButton'
} satisfies Meta<StoryArgs>

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { disabled: false }
}

export const Disabled: Story = {
  args: { disabled: true }
}

export default meta
