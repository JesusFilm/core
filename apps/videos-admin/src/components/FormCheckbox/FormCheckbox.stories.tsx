import type { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { FormCheckbox } from './FormCheckbox'

type StoryArgs = ComponentPropsWithoutRef<typeof FormCheckbox>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Form/FormCheckbox',
  component: FormCheckbox,
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

export const Checked: Story = {
  args: {
    name: 'checkbox',
    label: 'Form checkbox'
  }
}

export const Unchecked: Story = {
  args: {
    ...Checked.args
  }
}
