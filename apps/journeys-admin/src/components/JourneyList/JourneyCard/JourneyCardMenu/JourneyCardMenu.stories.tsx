import { MockedProvider } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { SnackbarProvider } from 'notistack'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { TeamProvider } from '../../../Team/TeamProvider'
import { ThemeProvider } from '../../../ThemeProvider'

import { JourneyCardMenu, JourneyCardMenuProps } from './JourneyCardMenu'

const JoruneyCardMenuDemo = {
  ...journeysAdminConfig,
  component: JourneyCardMenu,
  title: 'Journeys-Admin/JourneyList/JourneyCard/Menu'
}

const StoryTemplate: Story<JourneyCardMenuProps> = ({ ...args }) => (
  <MockedProvider>
    <SnackbarProvider>
      <TeamProvider>
        <ThemeProvider>
          <JourneyCardMenu {...args} />
        </ThemeProvider>
      </TeamProvider>
    </SnackbarProvider>
  </MockedProvider>
)

export const Draft = StoryTemplate.bind({})
Draft.args = {
  status: JourneyStatus.draft,
  slug: 'draft-journey',
  published: false,
  journeyId: 'journey-id'
}
Draft.play = async () => {
  await userEvent.click(screen.getByRole('button'))
  await waitFor(async () => {
    await userEvent.hover(screen.getByRole('menu'))
  })
}

export const Published = StoryTemplate.bind({})
Published.args = {
  status: JourneyStatus.published,
  slug: 'published-journey',
  published: true,
  journeyId: 'journey-id'
}
Published.play = async () => {
  await userEvent.click(screen.getByRole('button'))
  await waitFor(async () => {
    await userEvent.hover(screen.getByRole('menu'))
  })
}

export const Archived = StoryTemplate.bind({})
Archived.args = {
  status: JourneyStatus.archived,
  slug: 'archived-journey'
}
Archived.play = async () => {
  await userEvent.click(screen.getByTestId('MoreVertIcon'))
}

export const Trashed = StoryTemplate.bind({})
Trashed.args = {
  status: JourneyStatus.trashed,
  slug: 'trashed-journey'
}
Trashed.play = async () => {
  await userEvent.click(screen.getByTestId('MoreVertIcon'))
}

export const Template = StoryTemplate.bind({})
Template.args = {
  status: JourneyStatus.published,
  slug: 'template-journey',
  published: true,
  journeyId: 'template-id',
  template: true
}
Template.play = async () => {
  await userEvent.click(screen.getByTestId('MoreVertIcon'))
}

export default JoruneyCardMenuDemo as Meta
