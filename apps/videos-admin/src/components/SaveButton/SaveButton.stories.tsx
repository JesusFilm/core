import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { SaveButton } from './SaveButton'

const meta: Meta<typeof SaveButton> = {
  ...videosAdminConfig,
  component: SaveButton,
  title: 'Videos-Admin/SaveButton'
}

type Story = StoryObj<ComponentProps<typeof SaveButton>>

const Template: Story = {
  render: ({ disabled }) => (
    <NextIntlClientProvider locale="en">
      <SaveButton disabled={disabled} />
    </NextIntlClientProvider>
  )
}

export const Default = {
  ...Template,
  args: { disabled: false }
}

export const Disabled = {
  ...Template,
  args: { disabled: true }
}

export default meta
