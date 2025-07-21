import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent, waitFor } from 'storybook/test'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../ThemeProvider'

import { JourneyCardMenu } from './JourneyCardMenu'

const JoruneyCardMenuDemo: Meta<typeof JourneyCardMenu> = {
  ...journeysAdminConfig,
  component: JourneyCardMenu,
  title: 'Journeys-Admin/JourneyList/JourneyCard/Menu'
}

const StoryTemplate: StoryObj<typeof JourneyCardMenu> = {
  render: ({ ...args }) => (
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
}

export const Draft = {
  ...StoryTemplate,
  args: {
    status: JourneyStatus.draft,
    slug: 'draft-journey',
    published: false,
    journeyId: 'journey-id'
  },
  play: async () => {
    const menuButton = screen.getByRole('button')
    await userEvent.click(menuButton)
    await waitFor(async () => {
      await userEvent.hover(screen.getByRole('menu'))
    })
  }
}

export const Published = {
  ...StoryTemplate,
  args: {
    status: JourneyStatus.published,
    slug: 'published-journey',
    published: true,
    journeyId: 'journey-id'
  },
  play: async () => {
    const menuButton = screen.getByRole('button')
    await userEvent.click(menuButton)
    await waitFor(async () => {
      await userEvent.hover(screen.getByRole('menu'))
    })
  }
}

export const Archived = {
  ...StoryTemplate,
  args: {
    status: JourneyStatus.archived,
    slug: 'archived-journey'
  },
  play: async () => {
    const menuButton = screen.getByTestId('MoreIcon')
    await userEvent.click(menuButton)
  }
}

export const Trashed = {
  ...StoryTemplate,
  args: {
    status: JourneyStatus.trashed,
    slug: 'trashed-journey'
  },
  play: async () => {
    const menuButton = screen.getByTestId('MoreIcon')
    await userEvent.click(menuButton)
  }
}

export const Template = {
  ...StoryTemplate,
  args: {
    status: JourneyStatus.published,
    slug: 'template-journey',
    published: true,
    journeyId: 'template-id',
    template: true
  },
  play: async () => {
    const menuButton = screen.getByTestId('MoreIcon')
    await userEvent.click(menuButton)
  }
}

export default JoruneyCardMenuDemo
