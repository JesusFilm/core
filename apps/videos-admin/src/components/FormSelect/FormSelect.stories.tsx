import type { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'
import { FormSelect } from './FormSelect'

type StoryArgs = ComponentPropsWithoutRef<typeof FormSelect>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Form/FormSelect',
  component: FormSelect,
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
    label: 'Form select',
    defaultValue: null,
    onChange: (e) => alert(`Selected option ${e.target.value}`),
    options: [
      { label: 'Frodo', value: 'frodo' },
      { label: 'Sam', value: 'sam' },
      { label: 'Mary', value: 'mary' },
      { label: 'Pippen', value: 'pippen' }
    ]
  }
}

export const Filled: Story = {
  args: {
    ...Empty.args,
    defaultValue: 'frodo'
  }
}
