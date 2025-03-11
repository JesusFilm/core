import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import Lock1 from '@core/shared/ui/icons/Lock1'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { Fallback } from './Fallback'

type StoryArgs = ComponentPropsWithoutRef<typeof Fallback>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Fallback',
  component: Fallback,
  parameters: {
    tags: ['!autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Fallback',
    subtitle: 'Fallback subtitle'
  }
}

export const WithAction: Story = {
  args: {
    title: 'Fallback',
    subtitle: 'Fallback subtitle',
    action: {
      href: '/',
      label: 'Action'
    }
  }
}

export const WithIcon: Story = {
  args: {
    title: 'Fallback',
    subtitle: 'Fallback subtitle',
    icon: <Lock1 />
  }
}
