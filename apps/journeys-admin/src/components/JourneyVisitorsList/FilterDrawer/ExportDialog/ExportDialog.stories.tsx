import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { ThemeProvider } from '@mui/material/styles'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { adminLight } from '@core/shared/ui/themes/journeysAdmin/theme'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../__generated__/globalTypes'

import { ExportDialog, GET_JOURNEY_CREATED_AT } from './ExportDialog'

const journey = {
  __typename: 'Journey' as const,
  id: 'journey-id',
  createdAt: '2024-01-01T00:00:00Z',
  slug: 'test-journey',
  title: 'Test Journey',
  description: 'Test journey description',
  status: JourneyStatus.draft,
  language: {
    __typename: 'Language' as const,
    id: '529',
    name: [
      {
        __typename: 'LanguageName' as const,
        value: 'English',
        primary: true
      }
    ],
    bcp47: 'en',
    iso3: 'eng'
  },
  featuredAt: null,
  publishedAt: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  strategySlug: null,
  seoTitle: null,
  seoDescription: null,
  template: false,
  host: null,
  team: null,
  userJourneys: [],
  tags: [],
  visitors: 0,
  translations: [],
  chatButtons: [],
  website: null,
  showShareButton: false,
  showLikeButton: false,
  showDislikeButton: false,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  trashedAt: null,
  archivedAt: null,
  duplicatedFromJourneyId: null,
  journeyCollection: null
}

const mocks = [
  {
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
]

const meta: Meta<typeof ExportDialog> = {
  title: 'Journeys-Admin/JourneyVisitorsList/FilterDrawer/ExportDialog',
  component: ExportDialog,
  decorators: [
    (Story) => (
      <MockedProvider mocks={mocks}>
        <ThemeProvider theme={adminLight}>
          <SnackbarProvider>
            <JourneyProvider value={{ journey }}>
              <Box sx={{ p: 6, backgroundColor: 'background.paper' }}>
                <Story />
              </Box>
            </JourneyProvider>
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
      mocks: [
        {
          request: {
            query: GET_JOURNEY_CREATED_AT,
            variables: { id: 'journey-id' }
          },
          result: {
            loading: true
          }
        }
      ]
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
      mocks: [
        {
          request: {
            query: GET_JOURNEY_CREATED_AT,
            variables: { id: 'journey-id' }
          },
          error: new Error('Failed to load journey')
        }
      ]
    }
  }
}
