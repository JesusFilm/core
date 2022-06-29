import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../ThemeProvider'
import { JourneyCardMenu, JourneyCardMenuProps } from './JourneyCardMenu'

const JoruneyCardMenuDemo = {
  ...journeysAdminConfig,
  component: JourneyCardMenu,
  title: 'Journeys-Admin/JourneyList/JourneyCard/Menu'
}

const Template: Story<JourneyCardMenuProps> = ({ ...args }) => (
  <MockedProvider>
    <SnackbarProvider>
      <ThemeProvider>
        <JourneyCardMenu {...args} />
      </ThemeProvider>
    </SnackbarProvider>
  </MockedProvider>
)

export const Draft = Template.bind({})
Draft.args = {
  status: JourneyStatus.draft,
  slug: 'draft-journey',
  forceMenu: true,
  published: false,
  journeyId: 'journey-id'
}
export const Published = Template.bind({})
Published.args = {
  status: JourneyStatus.published,
  slug: 'published-journey',
  published: true,
  journeyId: 'journey-id',
  forceMenu: true
}

export const Archived = Template.bind({})
Archived.args = {
  status: JourneyStatus.archived,
  slug: 'archived-journey',
  forceMenu: true
}

export const Trashed = Template.bind({})
Trashed.args = {
  status: JourneyStatus.trashed,
  slug: 'trashed-journey',
  forceMenu: true
}

export default JoruneyCardMenuDemo as Meta
