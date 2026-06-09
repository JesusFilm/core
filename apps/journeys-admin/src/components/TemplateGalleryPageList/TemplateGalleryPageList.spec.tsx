import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
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
          __typename: 'TemplateGalleryPageAdmin',
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

// Variant of the journeys mock where the only journey is archived. The
// server-side resolver wouldn't return this row for the active view
// (status filter at the API), but Apollo's normalized cache merges
// post-mutation status flips into the same entity ref — so we simulate
// that here by serving the archived row from the published-status query.
const journeysMockWithArchivedJourney: MockedResponse<GetAdminJourneys> = {
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
          ...(journeysMock.result as { data: GetAdminJourneys }).data
            .journeys[0],
          status: JourneyStatus.archived
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

  it('excludes archived journeys from the active view (defends against post-mutation cache leak)', async () => {
    // Regression: archive flips a journey's status to `archived` in the
    // normalized Apollo cache, but the cached query result for
    // `status: [draft, published]` still holds the ref. The list must
    // re-filter by status client-side or the archived journey leaks
    // into the "All Templates" section of the active view.
    const { queryByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          getLastActiveTeamIdAndTeamsMock,
          collectionsMock,
          journeysMockWithArchivedJourney
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

    // The only journey is archived, so there are no active templates — the
    // Collections section is gated off (NES-1696). Wait on the post-load DnD
    // scope (always rendered) rather than the collection card.
    await waitFor(() =>
      expect(getByTestId('TemplateGalleryDndScope')).toBeInTheDocument()
    )
    // The archived journey should NOT appear in the unsectioned list.
    expect(queryByText('Welcome Tour')).not.toBeInTheDocument()
  })

  describe('Collections section visibility gate (NES-1696)', () => {
    // No team templates at all — the gate hides the entire Collections
    // section (heading + Create button + collection cards).
    const journeysMockEmpty: MockedResponse<GetAdminJourneys> = {
      request: {
        query: GET_ADMIN_JOURNEYS,
        variables: {
          template: true,
          teamId: TEAM_ID,
          status: [JourneyStatus.draft, JourneyStatus.published]
        }
      },
      result: { data: { journeys: [] } }
    }

    // The team's only active template lives inside the collection (the
    // unsectioned pool is empty). In-collection templates still count toward
    // the gate, so the section must render.
    const collectionsMockWithTemplate: MockedResponse<GetTemplateGalleryPages> =
      {
        request: {
          query: GET_TEMPLATE_GALLERY_PAGES,
          variables: { teamId: TEAM_ID }
        },
        result: {
          data: {
            templateGalleryPages: [
              {
                ...(collectionsMock.result as { data: GetTemplateGalleryPages })
                  .data.templateGalleryPages[0],
                templates: [
                  {
                    __typename: 'TemplateGalleryItem',
                    id: 'journey-1',
                    title: 'Welcome Tour',
                    primaryImageBlock: null
                  }
                ]
              }
            ]
          }
        }
      }

    it('hides the Collections section when the team has no active templates', async () => {
      const { queryByText, queryByTestId, getByTestId } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMock,
            journeysMockEmpty
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

      await waitFor(() =>
        expect(getByTestId('TemplateGalleryDndScope')).toBeInTheDocument()
      )
      expect(queryByTestId('CreateCollectionButton')).not.toBeInTheDocument()
      expect(queryByText('Featured Templates')).not.toBeInTheDocument()
    })

    it('shows the Collections section when the only active template lives inside a collection', async () => {
      const { getByText, getByTestId } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMockWithTemplate,
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

      await waitFor(() =>
        expect(getByText('Featured Templates')).toBeInTheDocument()
      )
      expect(getByTestId('CreateCollectionButton')).toBeInTheDocument()
    })
  })

  describe('Template Info mobile trigger (NES-1686)', () => {
    it('renders the inline info trigger next to the Collections heading when onOpenInfo is provided and calls it on click', async () => {
      const handleOpenInfo = vi.fn()
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
    const { getByTestId, getByText } = render(
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
      expect(getByTestId('CollectionCard-page-1')).toBeInTheDocument()
    )

    const dndScope = getByTestId('TemplateGalleryDndScope')
    // Default state: no dialog open, subtree is interactive.
    expect(dndScope).not.toHaveAttribute('inert')

    // Open the publish dialog from the draft collection's action menu
    // and confirm the DnD subtree flips to inert. The CollectionDialog
    // renders in a portal so it is unaffected. (The create button no
    // longer opens a dialog — it creates instantly with an auto-name —
    // and drafts now surface "Publish" as the single dialog entry
    // point in place of the old "Edit" item.)
    fireEvent.click(
      within(getByTestId('CollectionCard-page-1')).getByLabelText(
        'Collection actions'
      )
    )
    fireEvent.click(getByText('Publish'))
    await waitFor(() =>
      expect(getByTestId('TemplateGalleryDndScope')).toHaveAttribute('inert')
    )
  })
})
