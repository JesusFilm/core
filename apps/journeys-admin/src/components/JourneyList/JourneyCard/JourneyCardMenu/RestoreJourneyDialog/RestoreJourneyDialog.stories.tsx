import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import noop from 'lodash/noop'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { RestoreJourneyDialogProps } from './RestoreJourneyDialog'
import { RestoreJourneyDialog } from '.'

const RestoreJourneyDialogDemo = {
  ...simpleComponentConfig,
  component: RestoreJourneyDialog,
  title: 'Journeys-Admin/JourneyList/JourneyCard/Menu/Dialogs'
}

const Template: Story<RestoreJourneyDialogProps> = ({ ...args }) => (
  <MockedProvider>
    <SnackbarProvider>
      <RestoreJourneyDialog {...args} />
    </SnackbarProvider>
  </MockedProvider>
)

export const Restore = Template.bind({})
Restore.args = {
  id: 'journey-id',
  published: false,
  open: true,
  handleClose: noop
}

export default RestoreJourneyDialogDemo as Meta
