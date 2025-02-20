import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { CodeCanvas } from './CodeCanvas'

const meta: Meta<typeof CodeCanvas> = {
  ...simpleComponentConfig,
  component: CodeCanvas,
  title: 'Journey-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog/CodeCanvas'
}

type Story = StoryObj<ComponentProps<typeof CodeCanvas>>

const Template: Story = {
  render: ({ ...args }) => (
    <Box sx={{ height: 134, width: 134 }}>
      <CodeCanvas {...args} />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    shortLink: 'url',
    loading: false
  }
}
export const Loading = {
  ...Template,
  args: {
    shortLink: 'url',
    loading: true
  }
}
export const Empty = {
  ...Template,
  args: {
    shortLink: undefined,
    loading: false
  }
}

export default meta
