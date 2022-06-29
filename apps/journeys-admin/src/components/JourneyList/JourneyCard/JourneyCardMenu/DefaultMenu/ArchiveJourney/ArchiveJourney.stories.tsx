import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { noop } from 'lodash'
import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { JourneyStatus } from '../../../../../../../__generated__/globalTypes'
import { ArchiveJourneyProps } from './ArchiveJourney'

import { ArchiveJourney } from '.'

const ArchiveJourneyDemo = {
  ...simpleComponentConfig,
  component: ArchiveJourney,
  title:
    'Journeys-Admin/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/ArchiveJourney'
}

const Template: Story<ArchiveJourneyProps> = ({ ...args }) => (
  <MockedProvider mocks={[]}>
    <SnackbarProvider>
      <ArchiveJourney {...args} />
    </SnackbarProvider>
  </MockedProvider>
)

export const Archive = Template.bind({})
Archive.args = {
  status: JourneyStatus.draft,
  id: 'journey-id',
  published: false,
  handleClose: noop
}

export const Unarchive = Template.bind({})
Unarchive.args = {
  status: JourneyStatus.archived,
  id: 'journey-id',
  published: false,
  handleClose: noop
}

export default ArchiveJourneyDemo as Meta
