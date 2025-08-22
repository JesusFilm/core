import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import {
  ActiveContent,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { GET_CURRENT_USER } from '../../../../../../libs/useCurrentUserLazyQuery'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'

import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { JourneyAppearance } from './JourneyAppearance'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('JourneyAppearance', () => {
  const state: EditorState = {
    steps: [],
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should display JourneyAppearance attributes for Journey mode', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_CURRENT_USER },
            result: {
              data: {
                me: { __typename: 'User', id: 'u1', email: 'u1@example.com' }
              }
            }
          },
          {
            request: { query: GET_USER_TEAMS_AND_INVITES },
            result: { data: { userTeams: [], userTeamInvites: [] } }
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ websiteMode: true }}>
            <JourneyProvider value={{ journey: defaultJourney }}>
              <EditorProvider initialState={state}>
                <JourneyAppearance />
              </EditorProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Journey Appearance')).toBeInTheDocument()

    const toggleBtn = screen.getByRole('button', { name: 'Journey' })
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true')

    const reactions = await waitFor(() =>
      screen.getByRole('button', { name: 'Reactions' })
    )
    const title = await waitFor(() =>
      screen.getByRole('button', { name: 'Display Title' })
    )
    const details = await waitFor(() =>
      screen.getByRole('button', { name: 'Hosted By' })
    )
    const chat = await waitFor(() =>
      screen.getByRole('button', { name: 'Chat Widget' })
    )

    expect(reactions).toBeInTheDocument()
    expect(title).toBeInTheDocument()
    expect(details).toBeInTheDocument()
    expect(chat).toBeInTheDocument()
  })

  it('should display JourneyAppearance attributes for Website mode', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_CURRENT_USER },
            result: {
              data: {
                me: { __typename: 'User', id: 'u1', email: 'u1@example.com' }
              }
            }
          },
          {
            request: { query: GET_USER_TEAMS_AND_INVITES },
            result: { data: { userTeams: [], userTeamInvites: [] } }
          }
        ]}
      >
        <SnackbarProvider>
          <FlagsProvider flags={{ websiteMode: true }}>
            <JourneyProvider
              value={{ journey: { ...defaultJourney, website: true } }}
            >
              <EditorProvider initialState={state}>
                <JourneyAppearance />
              </EditorProvider>
            </JourneyProvider>
          </FlagsProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Journey Appearance')).toBeInTheDocument()

    const toggleBtn = screen.getByRole('button', { name: 'Website' })
    expect(toggleBtn).toBeInTheDocument()
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true')

    const title = await waitFor(() =>
      screen.getByRole('button', { name: 'Display Title' })
    )
    const menu = await waitFor(() =>
      screen.getByRole('button', { name: 'Menu' })
    )
    const chat = await waitFor(() =>
      screen.getByRole('button', { name: 'Chat Widget' })
    )
    const logo = await waitFor(() =>
      screen.getByRole('button', { name: 'Logo' })
    )

    expect(title).toBeInTheDocument()
    expect(menu).toBeInTheDocument()
    expect(chat).toBeInTheDocument()
    expect(logo).toBeInTheDocument()
  })

  it('should return to journey map when close icon is clicked', async () => {
    const contentState = { ...state, activeSlide: ActiveSlide.Content }
    render(
      <MockedProvider
        mocks={[
          {
            request: { query: GET_CURRENT_USER },
            result: {
              data: {
                me: { __typename: 'User', id: 'u1', email: 'u1@example.com' }
              }
            }
          },
          {
            request: { query: GET_USER_TEAMS_AND_INVITES },
            result: { data: { userTeams: [], userTeamInvites: [] } }
          }
        ]}
      >
        <SnackbarProvider>
          <EditorProvider initialState={contentState}>
            <TestEditorState />
            <JourneyAppearance />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId('X2Icon')).toBeInTheDocument()
    )
    await waitFor(
      async () => await userEvent.click(screen.getByTestId('X2Icon'))
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })
})
