import { Story, Meta } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
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
  published: false,
  journeyId: 'journey-id'
}
Draft.play = async () => {
  const menuButton = screen.getByRole('button')
  userEvent.click(menuButton)
  await waitFor(async () => {
    await userEvent.hover(screen.getByRole('menu'))
  })
}

export const Published = Template.bind({})
Published.args = {
  status: JourneyStatus.published,
  slug: 'published-journey',
  published: true,
  journeyId: 'journey-id'
}
Published.play = async () => {
  const menuButton = screen.getByRole('button')
  userEvent.click(menuButton)
  await waitFor(async () => {
    await userEvent.hover(screen.getByRole('menu'))
  })
}

export const Archived = Template.bind({})
Archived.args = {
  status: JourneyStatus.archived,
  slug: 'archived-journey'
}
Archived.play = () => {
  const menuButton = screen.getByTestId('MoreVertIcon')
  userEvent.click(menuButton)
}

export const Trashed = Template.bind({})
Trashed.args = {
  status: JourneyStatus.trashed,
  slug: 'trashed-journey'
}
Trashed.play = () => {
  const menuButton = screen.getByTestId('MoreVertIcon')
  userEvent.click(menuButton)
}

export default JoruneyCardMenuDemo as Meta
