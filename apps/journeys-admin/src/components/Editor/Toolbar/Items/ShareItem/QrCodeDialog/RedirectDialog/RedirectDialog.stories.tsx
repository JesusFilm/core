import type { Meta, StoryObj } from '@storybook/react'
import { ReactElement, useState } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { RedirectDialog } from './RedirectDialog'

const meta: Meta<typeof RedirectDialog> = {
  ...journeysAdminConfig,
  component: RedirectDialog,
  title:
    'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog/RedirectDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const RedirectDialogComponent = ({ ...args }): ReactElement => {
  const [open, setOpen] = useState(true)

  function handleClose(): void {
    setOpen(false)
  }

  return <RedirectDialog open={open} onClose={handleClose} to={args.to} />
}

const Template: StoryObj<typeof RedirectDialog> = {
  render: ({ ...args }) => <RedirectDialogComponent {...args} />
}

export const Default = {
  ...Template,
  args: {
    open: true,
    to: 'url'
  }
}

export default meta
