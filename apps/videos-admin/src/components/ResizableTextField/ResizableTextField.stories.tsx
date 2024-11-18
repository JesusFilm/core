import type { Meta, StoryObj } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { ComponentProps } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'
import { ResizableTextField } from './ResizableTextField'

const meta: Meta<typeof ResizableTextField> = {
  ...videosAdminConfig,
  component: ResizableTextField,
  title: 'Videos-Admin/ResizableTextField'
}

type Story = StoryObj<ComponentProps<typeof ResizableTextField>>

const Template: Story = {
  render: ({ disabled }) => (
    <NextIntlClientProvider locale="en">
      <ResizableTextField
        id="someId"
        name="some name"
        value="some text"
        disabled={disabled}
      />
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
