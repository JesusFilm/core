import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import noop from 'lodash/noop'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { TeamProvider } from '../../../../Team/TeamProvider'
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
      <TeamProvider>
        <RestoreJourneyDialog {...args} />
      </TeamProvider>
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
