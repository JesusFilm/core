import { MockedProvider } from '@apollo/client/testing/react'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ReactElement } from 'react'
import { screen, userEvent } from 'storybook/test'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { GET_CAMPAIGN_ACCESSIBLE_JOURNEYS } from '../../../../libs/useCampaignAccessibleJourneysLazyQuery'

import { JourneyPicker } from '.'

const accessibleJourneysMock = {
  request: { query: GET_CAMPAIGN_ACCESSIBLE_JOURNEYS },
  result: {
    data: {
      journeys: [
        {
          __typename: 'Journey',
          id: 'christmasId',
          title: 'The Christmas story',
          description: 'A short journey through the nativity.',
          slug: 'christmas-story',
          status: JourneyStatus.published,
          team: { __typename: 'Team', id: 'teamId', title: 'Ministry team' }
        },
        {
          __typename: 'Journey',
          id: 'easterId',
          title: 'Easter, retold',
          description: null,
          slug: 'easter-retold',
          status: JourneyStatus.archived,
          team: { __typename: 'Team', id: 'otherTeamId', title: 'Shared team' }
        }
      ]
    }
  }
}

function JourneyPickerStory(): ReactElement {
  return (
    <MockedProvider mocks={[accessibleJourneysMock]}>
      <Box sx={{ width: 480, minHeight: 280 }}>
        <JourneyPicker label="Add a journey" onLink={async () => undefined} />
      </Box>
    </MockedProvider>
  )
}

const JourneyPickerMeta: Meta<typeof JourneyPickerStory> = {
  ...journeysAdminConfig,
  component: JourneyPickerStory,
  title: 'Journeys-Admin/CampaignEditor/Pickers/JourneyPicker',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'centered'
  }
}

type Story = StoryObj<typeof JourneyPickerStory>

/** The closed field; nothing is fetched until it opens. */
export const Default: Story = {}

/** Opened: every published or archived journey the author can read, each with its team and status. */
export const Open: Story = {
  play: async () => {
    await userEvent.click(
      screen.getByRole('combobox', { name: 'Add a journey' })
    )
    await screen.findByText('The Christmas story')
  }
}

/** Typing narrows the list by title. */
export const Filtered: Story = {
  play: async () => {
    const field = screen.getByRole('combobox', { name: 'Add a journey' })
    await userEvent.click(field)
    await screen.findByText('The Christmas story')
    await userEvent.type(field, 'easter')
  }
}

export default JourneyPickerMeta
