import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { QrCodeCanvas } from './QrCodeCanvas'

const meta: Meta<typeof QrCodeCanvas> = {
  ...simpleComponentConfig,
  component: QrCodeCanvas,
  title: 'Journeys-Ui/QrCodeCanvas'
}

type Story = StoryObj<ComponentProps<typeof QrCodeCanvas>>

const Template: Story = {
  render: ({ ...args }) => (
    <Box sx={{ height: 200, width: 200 }}>
      <QrCodeCanvas {...args} />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    value: 'https://short.nextstep.is/eur-en',
    loading: false
  }
}
export const Loading = {
  ...Template,
  args: {
    value: 'https://short.nextstep.is/eur-en',
    loading: true
  }
}
export const Empty = {
  ...Template,
  args: {
    value: undefined,
    loading: false
  }
}

export default meta
