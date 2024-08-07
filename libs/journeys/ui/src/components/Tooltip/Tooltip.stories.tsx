import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { Tooltip } from ".";
import Button from '@mui/material/Button'

const TooltipDemo: Meta<typeof Tooltip> = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: Tooltip,
  title: 'Journeys-Ui/Tooltip'
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
    open: true,
  }
}

export const Placed = {
  ...Template,
  args: {
    title: 'Placed',
    placement: 'right',
    open: true,
  }
}

export const Arrow = {
  ...Template,
  args: {
    title: 'Arrow',
    arrow: true,
    open: true,
  }
}

export default TooltipDemo