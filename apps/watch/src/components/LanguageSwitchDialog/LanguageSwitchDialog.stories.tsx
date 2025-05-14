import type { Meta, StoryObj } from '@storybook/react'

import { LanguageSwitchDialog } from './LanguageSwitchDialog'

const meta: Meta<typeof LanguageSwitchDialog> = {
  title: 'Watch/LanguageSwitchDialog',
  component: LanguageSwitchDialog,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A full-screen dialog component for switching between different languages.'
      }
    }
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls whether the dialog is open or closed'
    },
    handleClose: {
      action: 'closed',
      description: 'Callback function when the dialog is closed'
    }
  }
}

export default meta
type Story = StoryObj<typeof LanguageSwitchDialog>

export const Default: Story = {
  args: {
    open: true,
    handleClose: () => {
      console.log('Dialog closed')
    }
  }
}

export const Closed: Story = {
  args: {
    open: false,
    handleClose: () => {
      console.log('Dialog closed')
    }
  }
}
