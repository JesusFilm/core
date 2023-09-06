import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { simpleComponentConfig } from '../../../../../libs/storybook'
import { TeamProvider } from '../../../../Team/TeamProvider'

import { RestoreJourneyDialog } from '.'

const RestoreJourneyDialogDemo: Meta<typeof RestoreJourneyDialog> = {
  ...simpleComponentConfig,
  component: RestoreJourneyDialog,
  title: 'Journeys-Admin/JourneyList/JourneyCard/Menu/Dialogs'
}

const Template: StoryObj<typeof RestoreJourneyDialog> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <SnackbarProvider>
        <TeamProvider>
          <RestoreJourneyDialog {...args} />
        </TeamProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}
export const Restore = {
  ...Template,
  args: {
    id: 'journey-id',
    published: false,
    open: true,
    handleClose: noop
  }
}

export default RestoreJourneyDialogDemo
