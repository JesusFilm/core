import type { Meta, StoryObj } from '@storybook/react'
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
  render: ({ disabled, error, helperText }) => (
    <ResizableTextField
      id="someId"
      name="some name"
      value="some text"
      disabled={disabled}
      error={error}
      helperText={helperText}
    />
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

export const Error = {
  ...Template,
  args: { error: true, helperText: 'Error text here' }
}

export default meta
