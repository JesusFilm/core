import { MockedResponse } from '@apollo/client/testing'
import { ThemeProvider } from '@mui/material/styles'
import { Meta, StoryObj } from '@storybook/nextjs'

import { simpleComponentConfig } from '@core/shared/ui/simpleComponentConfig'
import { adminLight } from '@core/shared/ui/themes/journeysAdmin/theme'

import {
  GetJourneyCreatedAt,
  GetJourneyCreatedAtVariables,
  GetJourneyCreatedAt_journey as Journey
} from '../../../../../__generated__/GetJourneyCreatedAt'

import { ExportDialog, GET_JOURNEY_CREATED_AT } from './ExportDialog'

const journey: Journey = {
  __typename: 'Journey' as const,
  id: 'journey-id',
  createdAt: '2024-01-01T00:00:00Z'
}

const getJourneyCreatedAtMock: MockedResponse<
  GetJourneyCreatedAt,
  GetJourneyCreatedAtVariables
> = {
  request: {
    query: GET_JOURNEY_CREATED_AT,
    variables: { id: 'journey-id' }
  },
  result: {
    data: {
      journey
    }
  }
}

const ExportDialogStory: Meta<typeof ExportDialog> = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer/ExportDialog',
  component: ExportDialog
}

type Story = StoryObj<typeof ExportDialog>

const Template: Story = {
  render: ({ ...args }) => {
    return (
      <ThemeProvider theme={adminLight}>
        <ExportDialog {...args} />
      </ThemeProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    open: true,
    onClose: () => null,
    journeyId: 'journey-id'
  },
  parameters: {
    apolloClient: {
      mocks: [getJourneyCreatedAtMock]
    }
  }
}

export default ExportDialogStory
