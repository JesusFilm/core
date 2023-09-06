import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { simpleComponentConfig } from '../../../../../libs/storybook'
import { TeamProvider } from '../../../../Team/TeamProvider'

import { TrashJourneyDialog } from '.'

const TrashJourneyDialogDemo: Meta<typeof TrashJourneyDialog> = {
  ...simpleComponentConfig,
  component: TrashJourneyDialog,
  title: 'Journeys-Admin/JourneyList/JourneyCard/Menu/Dialogs'
}

const Template: StoryObj<typeof TrashJourneyDialog> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <SnackbarProvider>
        <TeamProvider>
          <TrashJourneyDialog {...args} />
        </TeamProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

export const Trash = {
  ...Template,
  args: {
    id: 'journey-id',
    published: false,
    open: true,
    handleClose: noop
  }
}

export default TrashJourneyDialogDemo
