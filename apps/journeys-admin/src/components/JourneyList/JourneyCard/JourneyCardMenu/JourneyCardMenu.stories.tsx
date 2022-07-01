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
  slug: 'draft-journey'
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
  slug: 'published-journey'
}
Published.play = async () => {
  const menuButton = screen.getByRole('button')
  userEvent.click(menuButton)
  await waitFor(async () => {
    await userEvent.hover(screen.getByRole('menu'))
  })
}

export default JoruneyCardMenuDemo as Meta
