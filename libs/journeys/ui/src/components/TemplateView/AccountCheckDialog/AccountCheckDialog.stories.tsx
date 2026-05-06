import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { ComponentProps, ReactElement, useState } from 'react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { AccountCheckDialog } from './AccountCheckDialog'

const AccountCheckDialogStory: Meta<typeof AccountCheckDialog> = {
  ...simpleComponentConfig,
  component: AccountCheckDialog,
  title: 'Journeys-Admin/TemplateView/AccountCheckDialog'
}

const AccountCheckDialogComponent = (): ReactElement => {
  const [open, setOpen] = useState(true)
  return (
    <AccountCheckDialog
      open={open}
      onClose={() => setOpen(false)}
      handleSignIn={noop}
    />
  )
}

const Template: StoryObj<ComponentProps<typeof AccountCheckDialog>> = {
  render: () => {
    return <AccountCheckDialogComponent />
  }
}

export const Default = {
  ...Template
}

export default AccountCheckDialogStory
