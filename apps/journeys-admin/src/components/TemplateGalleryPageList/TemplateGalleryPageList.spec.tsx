import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { getLastActiveTeamIdAndTeamsMock } from '@core/journeys/ui/TeamProvider/TeamProvider.mock'

import { GetAdminJourneys } from '../../../__generated__/GetAdminJourneys'
import { GetTemplateGalleryPages } from '../../../__generated__/GetTemplateGalleryPages'
import {
  JourneyStatus,
  TemplateGalleryPageStatus,
  ThemeMode,
  ThemeName,
  UserJourneyRole
} from '../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { GET_TEMPLATE_GALLERY_PAGES } from '../../libs/useTemplateGalleryPagesQuery'
import { ThemeProvider } from '../ThemeProvider'

import { TemplateGalleryPageList } from './TemplateGalleryPageList'

import '../../../test/i18n'

const TEAM_ID = 'teamId'

const collectionsMock: MockedResponse<GetTemplateGalleryPages> = {
  request: {
    query: GET_TEMPLATE_GALLERY_PAGES,
    variables: { teamId: TEAM_ID }
  },
  result: {
    data: {
      templateGalleryPages: [
        {
          __typename: 'TemplateGalleryPage',
          id: 'page-1',
          title: 'Featured Templates',
          description: 'Our pick of the team',
          slug: 'featured-templates',
          status: TemplateGalleryPageStatus.draft,
          creatorName: 'Jesus Film',
          creatorImageSrc: null,
          creatorImageAlt: null,
          mediaUrl: null,
          publishedAt: null,
          createdAt: '2026-05-01T00:00:00.000Z',
          updatedAt: '2026-05-01T00:00:00.000Z',
          templates: []
        }
      ]
    }
  }
}

const journeysMock: MockedResponse<GetAdminJourneys> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      template: true,
      teamId: TEAM_ID,
      status: [JourneyStatus.draft, JourneyStatus.published]
    }
  },
  result: {
    data: {
      journeys: [
        {
          __typename: 'Journey',
          id: 'journey-1',
          title: 'Welcome Tour',
          createdAt: '2026-04-30T00:00:00.000Z',
          publishedAt: '2026-05-01T00:00:00.000Z',
          trashedAt: null,
          updatedAt: '2026-05-01T00:00:00.000Z',
          description: null,
          slug: 'welcome-tour',
          themeName: ThemeName.base,
          themeMode: ThemeMode.light,
          language: {
            __typename: 'Language',
            id: '529',
            name: [
              { __typename: 'LanguageName', value: 'English', primary: true }
            ]
          },
          status: JourneyStatus.published,
          seoTitle: null,
          seoDescription: null,
          template: true,
          userJourneys: [
            {
              __typename: 'UserJourney',
              id: 'user-journey-1',
              role: UserJourneyRole.owner,
              openedAt: null,
              user: {
                __typename: 'AuthenticatedUser',
                id: 'user-1',
                firstName: 'Jane',
                lastName: 'Doe',
                imageUrl: null
              }
            }
          ],
          primaryImageBlock: null,
          team: { __typename: 'Team', id: TEAM_ID },
          fromTemplateId: null,
          journeyCustomizationDescription: null,
          journeyCustomizationFields: [],
          website: null,
          customizable: null
        }
      ]
    }
  }
}

describe('TemplateGalleryPageList', () => {
  it('renders the Collections heading and the existing collection card', async () => {
    const { getByText, getByTestId } = render(
      <MockedProvider
        mocks={[getLastActiveTeamIdAndTeamsMock, collectionsMock, journeysMock]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TeamProvider>
              <TemplateGalleryPageList />
            </TeamProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    // The TeamProvider mock activates team `TEAM_ID` (jfp-team) — wait for the
    // collections query to resolve and the heading to render.
    await waitFor(() =>
      expect(getByText('Featured Templates')).toBeInTheDocument()
    )
    expect(getByTestId('CollectionCard-page-1')).toBeInTheDocument()
    expect(getByTestId('CreateCollectionButton')).toBeInTheDocument()
  })

  describe('Template Info mobile trigger (NES-1686)', () => {
    it('renders the inline info trigger next to the Collections heading when onOpenInfo is provided and calls it on click', async () => {
      const handleOpenInfo = jest.fn()
      const { getByTestId } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMock,
            journeysMock
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList onOpenInfo={handleOpenInfo} />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      const trigger = await waitFor(() =>
        getByTestId('TemplateInfoPanelMobileTrigger')
      )
      expect(trigger).toHaveAttribute('aria-label', 'Open template info')

      fireEvent.click(trigger)
      expect(handleOpenInfo).toHaveBeenCalledTimes(1)
    })

    it('does not render the inline info trigger when onOpenInfo is not provided', async () => {
      const { queryByTestId, getByTestId } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMock,
            journeysMock
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      // Wait for Collections to render so absence is meaningful (the trigger
      // would have rendered alongside it).
      await waitFor(() =>
        expect(getByTestId('CreateCollectionButton')).toBeInTheDocument()
      )
      expect(queryByTestId('TemplateInfoPanelMobileTrigger')).toBeNull()
    })
  })

  // NES-1666 v2: per Sharon's repro, the original fix only covered
  // CollectionDialog, not per-card dialogs ("Edit Template Details" etc.).
  // This asserts that when a JourneyCard's own dialog (here, the template
  // breakdown analytics dialog) opens, the gallery's DnD subtree also
  // flips to inert via the GalleryDialogLockContext signal.
  it('marks the DnD subtree inert when a JourneyCard opens a dialog (NES-1666 v2)', async () => {
    const { getByTestId, getByLabelText } = render(
      <MockedProvider
        mocks={[getLastActiveTeamIdAndTeamsMock, collectionsMock, journeysMock]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TeamProvider>
              <TemplateGalleryPageList />
            </TeamProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    // The template card mounts inside the gallery.
    await waitFor(() =>
      expect(getByTestId('JourneyCard-journey-1')).toBeInTheDocument()
    )

    // Default: no dialog open, subtree is interactive.
    expect(getByTestId('TemplateGalleryDndScope')).not.toHaveAttribute('inert')

    // Open the breakdown analytics dialog rendered by the JourneyCard
    // itself (this fires the same useEffect path that menu dialogs do —
    // `hasOpenDialog || breakdownDialogOpen` → context → gallery state).
    fireEvent.click(getByLabelText('journey breakdown analytics'))

    // The gallery's DnD subtree should now be inert. The dialog renders
    // via MUI portal so it sits outside the inert subtree and stays
    // fully interactive.
    await waitFor(() =>
      expect(getByTestId('TemplateGalleryDndScope')).toHaveAttribute('inert')
    )
  })

  // NES-1666: original CollectionDialog case — kept to guard against
  // regressions in the v1 wiring after the v2 context plumbing landed.
  it('marks the DnD subtree inert while CollectionDialog is open (NES-1666)', async () => {
    const { getByTestId } = render(
      <MockedProvider
        mocks={[getLastActiveTeamIdAndTeamsMock, collectionsMock, journeysMock]}
      >
        <ThemeProvider>
          <SnackbarProvider>
            <TeamProvider>
              <TemplateGalleryPageList />
            </TeamProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByTestId('CreateCollectionButton')).toBeInTheDocument()
    )

    const dndScope = getByTestId('TemplateGalleryDndScope')
    // Default state: no dialog open, subtree is interactive.
    expect(dndScope).not.toHaveAttribute('inert')

    // Open the create-collection dialog and confirm the DnD subtree
    // flips to inert. The CollectionDialog renders in a portal so it
    // is unaffected.
    fireEvent.click(getByTestId('CreateCollectionButton'))
    await waitFor(() =>
      expect(getByTestId('TemplateGalleryDndScope')).toHaveAttribute('inert')
    )
  })
})
