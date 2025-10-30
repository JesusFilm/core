import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

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
