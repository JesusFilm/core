// imports

import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps, ReactElement, useState } from 'react'

import { simpleComponentConfig } from '../../../libs/storybook'

import { AccountCheckDialog } from './AccountCheckDialog'

const AccountCheckDialogStory: Meta<typeof AccountCheckDialog> = {
  ...simpleComponentConfig,
  component: AccountCheckDialog,
  title: 'Journeys-Admin/TemplateView/AccountCheckDialog'
}

const AccountCheckDialogComponent = (args): ReactElement => {
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
  render: (args) => {
    return <AccountCheckDialogComponent args={args} />
  }
}

export const Default = {
  ...Template
}

export default AccountCheckDialogStory
