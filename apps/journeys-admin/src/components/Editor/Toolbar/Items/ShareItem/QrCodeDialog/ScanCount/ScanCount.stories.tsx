import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { ScanCount } from './ScanCount'

const meta: Meta<typeof ScanCount> = {
  ...journeysAdminConfig,
  component: ScanCount,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog/ScanCount',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

type Story = StoryObj<ComponentProps<typeof ScanCount>>

const Template: Story = {
  render: () => <ScanCount />
}

export const Default = {
  ...Template
}

export default meta
