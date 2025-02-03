import type { Meta, StoryObj } from '@storybook/react'
import { ReactElement, useState } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { QrCodeDialog } from './QrCodeDialog'

const meta: Meta<typeof QrCodeDialog> = {
  ...journeysAdminConfig,
  component: QrCodeDialog,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ShareItem/QrCodeDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const QrCodeDialogComponent = ({ ...args }): ReactElement => {
  const [open, setOpen] = useState(true)

  function handleClose(): void {
    setOpen(false)
  }

  return (
    <QrCodeDialog
      open={open}
      onClose={handleClose}
      initialJourneyUrl={args.initialJourneyUrl}
    />
  )
}

const Template: StoryObj<typeof QrCodeDialog> = {
  render: ({ ...args }) => <QrCodeDialogComponent {...args} />
}

export const Default = {
  ...Template,
  args: {
    open: true
  }
}

export const WithQRCode = {
  ...Template,
  args: {
    open: true,
    initialJourneyUrl: 'url'
  }
}

export default meta
