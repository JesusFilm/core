import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { ThemeProvider } from '@mui/material/styles'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

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

const meta: Meta<typeof ExportDialog> = {
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer/ExportDialog',
  component: ExportDialog,
  decorators: [
    (Story) => (
      <MockedProvider>
        <ThemeProvider theme={adminLight}>
          <SnackbarProvider>
            <Box sx={{ p: 6, backgroundColor: 'background.paper' }}>
              <Story />
            </Box>
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )
  ],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light'
    }
  }
}

export default meta

type Story = StoryObj<typeof ExportDialog>

export const Default: Story = {
  args: {
    open: true,
    onClose: () => null,
    journeyId: 'journey-id'
  }
}

export const Closed: Story = {
  args: {
    open: false,
    onClose: () => null,
    journeyId: 'journey-id'
  }
}

export const LoadingState: Story = {
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

export const ErrorState: Story = {
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
