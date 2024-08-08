import Button from '@mui/material/Button'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { Tooltip } from '.'

const TooltipDemo: Meta<typeof Tooltip> = {
  ...simpleComponentConfig,
  component: Tooltip,
  title: 'Journeys-Admin/Tooltip'
}

type Story = StoryObj<ComponentProps<typeof Tooltip>>

const Template: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Button>Tooltip</Button>
    </Tooltip>
  )
}

export const Default = {
  ...Template,
  args: {
    title: 'Default',
    open: true
  }
}

export const Placed = {
  ...Template,
  args: {
    title: 'Placed',
    placement: 'right',
    open: true
  }
}

export const WithoutArrow = {
  ...Template,
  args: {
    title: 'Arrow',
    arrow: false,
    open: true
  }
}

export default TooltipDemo
