import type { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ReactElement, useState } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { QrCodeFields as QrCode } from '../../../../../../../../../__generated__/QrCodeFields'

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

const RedirectDialogComponent = ({
  open,
  to,
  qrCode,
  handleUndo
}): ReactElement => {
  const [dialogOpen, setDialogOpen] = useState(open)

  function handleClose(): void {
    setDialogOpen(false)
  }

  return (
    <RedirectDialog
      open={dialogOpen}
      onClose={handleClose}
      to={to}
      qrCode={qrCode}
      handleUndo={handleUndo}
    />
  )
}

const Template: StoryObj<typeof RedirectDialog> = {
  render: ({ ...args }) => <RedirectDialogComponent {...args} />
}
const qrCode: QrCode = {
  __typename: 'QrCode',
  id: 'qrCode.id',
  toJourneyId: 'journey.id',
  shortLink: {
    __typename: 'ShortLink',
    id: 'shortLink.id',
    domain: {
      __typename: 'ShortLinkDomain',
      hostname: 'localhost'
    },
    pathname: 'shortId',
    to: 'destinationUrl'
  }
}
export const Default = {
  ...Template,
  args: {
    open: true,
    onClose: noop,
    to: 'url',
    qrCode,
    handleUndo: noop
  }
}

export default meta
