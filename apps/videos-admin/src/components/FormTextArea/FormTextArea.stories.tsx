import type { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'
import { FormTextArea } from './FormTextArea'

type StoryArgs = ComponentPropsWithoutRef<typeof FormTextArea>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Form/FormTextArea',
  component: FormTextArea,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    label: 'Form textfield',
    defaultValue: '',
    onUpdate: (newValue) => alert(`Update value: ${newValue}`)
  }
}

export const Filled: Story = {
  args: {
    ...Empty.args,
    defaultValue: 'Filled'
  }
}
