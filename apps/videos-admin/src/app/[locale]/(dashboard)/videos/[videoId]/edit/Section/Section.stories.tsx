import type { Meta, StoryObj } from '@storybook/react'
import { Section } from './Section'
import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { Typography } from '@mui/material'
import Plus2 from '@core/shared/ui/icons/Plus2'
import { ComponentPropsWithoutRef } from 'react'

type StoryArgs = ComponentPropsWithoutRef<typeof Section>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Video/Edit/Section',
  component: Section,
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

export const Default: Story = {
  args: {
    title: 'Default Section',
    children: <Typography>Default section content</Typography>
  }
}

export const WithAction: Story = {
  args: {
    title: 'Action Section',
    action: {
      label: 'Action',
      onClick: () => alert('Action clicked'),
      startIcon: <Plus2 />
    },
    children: <Typography>Action section content</Typography>
  }
}
