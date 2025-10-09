import { Meta, StoryObj } from '@storybook/nextjs'
import { ReactElement, useState } from 'react'
import { screen, userEvent } from 'storybook/test'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { ImpersonateDialog, USER_IMPERSONATE } from './ImpersonateDialog'

const ImpersonateDialogStory: Meta<typeof ImpersonateDialog> = {
  ...journeysAdminConfig,
  component: ImpersonateDialog,
  title:
    'Journeys-Admin/PageWrapper/NavigationDrawer/UserNavigation/ImpersonateDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

function ImpersonateDialogComponent(): ReactElement {
  const [open, setOpen] = useState(true)

  return <ImpersonateDialog open={open} onClose={() => setOpen(false)} />
}

const Template: StoryObj<typeof ImpersonateDialog> = {
  render: () => <ImpersonateDialogComponent />
}

export const Default = {
  ...Template
}

export const Error = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [
        {
          request: {
            query: USER_IMPERSONATE,
            variables: {
              email: 'bob.jones@example.com'
            }
          },
          error: {
            name: 'USER_INPUT_ERROR',
            message: 'Field update failed. Reload the page or try again.'
          }
        }
      ]
    }
  },
  play: async () => {
    await userEvent.type(screen.getByRole('textbox'), ' bob.jones@example.com')
    const button = screen.getByRole('button', { name: 'Impersonate' })
    await userEvent.click(button)
  }
}

export default ImpersonateDialogStory
