import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { ChangeButton } from './ChangeButton'

const meta: Meta<typeof ChangeButton> = {
  ...journeysAdminConfig,
  component: ChangeButton,
  title:
    'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog/CodeDestination/ChangeButton',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

type Story = StoryObj<ComponentProps<typeof ChangeButton>>

const Template: Story = {
  render: ({ disabled, showRedirectButton }) => (
    <ChangeButton disabled={disabled} showRedirectButton={showRedirectButton} />
  )
}

export const Default = {
  ...Template,
  args: {
    disabled: false
  }
}

export const Disabled = {
  ...Template,
  args: {
    disabled: true
  }
}

export const Clickedtest = {
  ...Template,
  args: {
    disabled: false,
    showRedirectButton: true
  }
}

export default meta
