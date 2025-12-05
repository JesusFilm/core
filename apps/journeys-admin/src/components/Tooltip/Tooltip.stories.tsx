import Button from '@mui/material/Button'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Tooltip } from '.'

type StoryArgs = ComponentPropsWithoutRef<typeof Tooltip>

const meta = {
  ...simpleComponentConfig,
  component: Tooltip,
  title: 'Journeys-Admin/Tooltip',
  decorators: [
    ...simpleComponentConfig.decorators,
    (Story) => (
      <div
        style={{
          height: '100vh',
          display: 'grid',
          placeItems: 'center'
        }}
      >
        <Story />
      </div>
    )
  ]
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Default',
    children: <Button>Hello world</Button>
  }
}

export const Controlled: Story = {
  args: {
    ...Default.args,
    title: 'Controlled',
    open: true
  }
}

export const Placed: Story = {
  args: {
    ...Default.args,
    title: 'Placed',
    placement: 'bottom'
  }
}

export const Offset: Story = {
  args: {
    ...Default.args,
    title: 'Offset',
    offset: 24
  }
}
