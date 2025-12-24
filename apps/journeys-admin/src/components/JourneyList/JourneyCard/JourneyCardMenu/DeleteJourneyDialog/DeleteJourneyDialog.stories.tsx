import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { DeleteJourneyDialog } from '.'

const DeleteJourneyDialogDemo: Meta<typeof DeleteJourneyDialog> = {
  ...simpleComponentConfig,
  component: DeleteJourneyDialog,
  title: 'Journeys-Admin/JourneyList/JourneyCard/Menu/Dialogs'
}

const Template: StoryObj<typeof DeleteJourneyDialog> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <TeamProvider>
        <SnackbarProvider>
          <DeleteJourneyDialog {...args} />
        </SnackbarProvider>
      </TeamProvider>
    </MockedProvider>
  )
}

export const Delete = {
  ...Template,
  args: {
    id: 'journey-id',
    open: true,
    handleClose: noop
  }
}

export default DeleteJourneyDialogDemo
