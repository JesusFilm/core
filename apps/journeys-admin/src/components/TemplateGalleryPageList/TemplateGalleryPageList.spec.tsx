import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

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
import {
  sendCollectionCreateEvent,
  sendCollectionEditOpenEvent
} from '../../libs/sendCollectionEvent'
import { GET_ADMIN_JOURNEYS } from '../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { getTemplateGalleryPageCreateMock } from '../../libs/useTemplateGalleryPageCreateMutation/useTemplateGalleryPageCreateMutation.mock'
import { GET_TEMPLATE_GALLERY_PAGES } from '../../libs/useTemplateGalleryPagesQuery'
import {
  ARCHIVE_ACTIVE_JOURNEYS,
  DELETE_TRASHED_JOURNEYS,
  RESTORE_ARCHIVED_JOURNEYS,
  RESTORE_TRASHED_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from '../JourneyList/JourneyListContent/JourneyListContent'
import { SortOrder } from '../JourneyList/JourneySort'
import { ThemeProvider } from '../ThemeProvider'

import { TemplateGalleryPageList } from './TemplateGalleryPageList'

import '../../../test/i18n'

vi.mock('../../libs/sendCollectionEvent', () => ({
  sendCollectionCreateEvent: vi.fn(),
  sendCollectionEditOpenEvent: vi.fn(),
  sendCollectionPublishEvent: vi.fn(),
  sendCollectionTemplateDragEvent: vi.fn(),
  sendCollectionTemplateAddEvent: vi.fn(),
  sendCollectionMoreDetailsClickEvent: vi.fn(),
  sendCollectionPreviewClickEvent: vi.fn(),
  sendCollectionCopyLinkClickEvent: vi.fn(),
  sendCollectionDescriptionUpdateEvent: vi.fn(),
  sendCollectionSlugUpdateEvent: vi.fn(),
  sendCollectionMediaUpdateEvent: vi.fn()
}))

const mockSendCollectionCreateEvent =
  sendCollectionCreateEvent as MockedFunction<typeof sendCollectionCreateEvent>
const mockSendCollectionEditOpenEvent =
  sendCollectionEditOpenEvent as MockedFunction<
    typeof sendCollectionEditOpenEvent
  >

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
          media: null,
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

// A second journey, deliberately later-alphabetical but earlier-dated than
// journey-1 ("Welcome Tour") — TITLE sort and the default (updatedAt desc)
// sort disagree on the order of these two, so a test using this pair can
// prove sortOrder is actually being applied rather than coincidentally
// matching one ordering.
const journeyAlpha = {
  ...(journeysMock.result as { data: GetAdminJourneys }).data.journeys[0],
  id: 'journey-2',
  title: 'Alpha Editor',
  createdAt: '2026-04-01T00:00:00.000Z',
  updatedAt: '2026-04-02T00:00:00.000Z'
}

const journeysMockTwoActive: MockedResponse<GetAdminJourneys> = {
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
        (journeysMock.result as { data: GetAdminJourneys }).data.journeys[0],
        journeyAlpha
      ]
    }
  }
}

const journeysMockArchived: MockedResponse<GetAdminJourneys> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      template: true,
      teamId: TEAM_ID,
      status: [JourneyStatus.archived]
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

const journeysMockTrashed: MockedResponse<GetAdminJourneys> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      template: true,
      teamId: TEAM_ID,
      status: [JourneyStatus.trashed]
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...(journeysMock.result as { data: GetAdminJourneys }).data
            .journeys[0],
          status: JourneyStatus.trashed,
          trashedAt: '2026-08-01T00:00:00.000Z'
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

    // Open the edit dialog from the collection's action menu and
    // confirm the DnD subtree flips to inert. The CollectionDialog
    // renders in a portal so it is unaffected. (The create button no
    // longer opens a dialog — it creates instantly with an auto-name —
    // and "Edit" is the single dialog entry point regardless of
    // status.)
    fireEvent.click(
      within(getByTestId('CollectionCard-page-1')).getByLabelText(
        'Collection actions'
      )
    )
    fireEvent.click(getByText('Edit'))
    await waitFor(() =>
      expect(getByTestId('TemplateGalleryDndScope')).toHaveAttribute('inert')
    )
  })

  // NES-1698: lock in the create / edit-open analytics wiring — create must
  // fire only once the mutation returns the new collection (so the event
  // carries its real id), and edit-open fires when the dialog opens.
  describe('analytics wiring (NES-1698)', () => {
    beforeEach(() => {
      mockSendCollectionCreateEvent.mockClear()
      mockSendCollectionEditOpenEvent.mockClear()
    })

    it('fires the create event with the new collection id after create succeeds', async () => {
      // Existing collection is 'Featured Templates', so the auto-name is
      // 'Collection 1'.
      const createMock = getTemplateGalleryPageCreateMock(
        {
          input: {
            teamId: TEAM_ID,
            title: 'Collection 1',
            creatorName: '',
            journeyIds: []
          }
        },
        { id: 'page-new', team: { __typename: 'Team', id: TEAM_ID } }
      )

      const { getByTestId } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMock,
            journeysMock,
            createMock
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
        expect(getByTestId('CollectionCard-page-1')).toBeInTheDocument()
      )

      fireEvent.click(getByTestId('CreateCollectionButton'))

      await waitFor(() => expect(createMock.result).toHaveBeenCalledTimes(1))
      await waitFor(() =>
        expect(mockSendCollectionCreateEvent).toHaveBeenCalledTimes(1)
      )
      expect(mockSendCollectionCreateEvent).toHaveBeenCalledWith({
        teamId: TEAM_ID,
        collectionId: 'page-new'
      })
    })

    it('fires the edit-open event with the collection id and status when the edit dialog opens', async () => {
      const { getByTestId, getByText } = render(
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

      await waitFor(() =>
        expect(getByTestId('CollectionCard-page-1')).toBeInTheDocument()
      )

      fireEvent.click(
        within(getByTestId('CollectionCard-page-1')).getByLabelText(
          'Collection actions'
        )
      )
      fireEvent.click(getByText('Edit'))

      await waitFor(() =>
        expect(mockSendCollectionEditOpenEvent).toHaveBeenCalledTimes(1)
      )
      expect(mockSendCollectionEditOpenEvent).toHaveBeenCalledWith({
        teamId: TEAM_ID,
        collectionId: 'page-1',
        collectionStatus: TemplateGalleryPageStatus.draft
      })
    })
  })

  // NES-1717: collapse wiring through the parent — proves collapsed /
  // onToggleCollapse are connected to a real CollectionCard and that the
  // state round-trips through localStorage on remount.
  describe('collapsible collection headers (NES-1717)', () => {
    beforeEach(() => localStorage.clear())

    afterEach(() => localStorage.clear())

    // page-1 holds journey-1 so the grid renders a card we can watch
    // appear/disappear, and the count badge has something to count.
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

    function renderList() {
      return render(
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
    }

    it('collapses then expands a collection from its header', async () => {
      const { getByTestId, queryByTestId } = renderList()

      await waitFor(() =>
        expect(getByTestId('CollectionCard-page-1')).toBeInTheDocument()
      )
      // Expanded by default: the in-collection card is visible, no count badge.
      expect(getByTestId('JourneyCard-journey-1')).toBeInTheDocument()
      expect(queryByTestId('CollectionCardCount-page-1')).toBeNull()

      // Collapse: grid unmounts, count badge appears.
      fireEvent.click(getByTestId('CollectionCardToggle-page-1'))
      await waitFor(() =>
        expect(queryByTestId('JourneyCard-journey-1')).toBeNull()
      )
      expect(getByTestId('CollectionCardCount-page-1')).toHaveTextContent('1')
      expect(getByTestId('CollectionCardToggle-page-1')).toHaveAttribute(
        'aria-expanded',
        'false'
      )

      // Expand again: the card returns.
      fireEvent.click(getByTestId('CollectionCardToggle-page-1'))
      await waitFor(() =>
        expect(getByTestId('JourneyCard-journey-1')).toBeInTheDocument()
      )
    })

    it('restores the collapsed state from localStorage on remount', async () => {
      const first = renderList()
      await waitFor(() =>
        expect(first.getByTestId('CollectionCard-page-1')).toBeInTheDocument()
      )
      fireEvent.click(first.getByTestId('CollectionCardToggle-page-1'))
      await waitFor(() =>
        expect(
          first.getByTestId('CollectionCardCount-page-1')
        ).toBeInTheDocument()
      )
      first.unmount()

      // Fresh mount, same team: the collection comes back collapsed.
      const second = renderList()
      await waitFor(() =>
        expect(
          second.getByTestId('CollectionCardCount-page-1')
        ).toBeInTheDocument()
      )
      expect(second.getByTestId('CollectionCardToggle-page-1')).toHaveAttribute(
        'aria-expanded',
        'false'
      )
    })
  })

  describe('All Templates header (NES-1872)', () => {
    // page-1 holds journey-1, so the unsectioned pool is empty — the header
    // (title, Sort, bulk-actions menu) must still render, or those controls
    // would vanish along with the empty section.
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

    it('renders Sort and the bulk-actions menu even when every template is in a collection', async () => {
      const { getByText, getByRole } = render(
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
        expect(
          getByText('All templates are in collections.')
        ).toBeInTheDocument()
      )
      expect(getByText('All Templates')).toBeInTheDocument()
      expect(getByRole('button', { name: 'Sort By' })).toBeInTheDocument()
      expect(
        getByRole('button', { name: 'Journey list actions' })
      ).toBeInTheDocument()
    })

    it('opens the archive confirmation dialog scoped to unsectioned templates when archiveAllActive fires', async () => {
      const { getByText } = render(
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
                <TemplateGalleryPageList event="archiveAllActive" />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Archive Templates')).toBeInTheDocument()
      )
      expect(
        getByText('This will archive all active Templates not in a collection.')
      ).toBeInTheDocument()
    })

    it('archives only the unsectioned template IDs on submit', async () => {
      const archiveMock: MockedResponse = {
        request: {
          query: ARCHIVE_ACTIVE_JOURNEYS,
          variables: { ids: ['journey-1'] }
        },
        result: {
          data: {
            journeysArchive: [
              {
                __typename: 'Journey',
                id: 'journey-1',
                status: JourneyStatus.archived,
                fromTemplateId: null
              }
            ]
          }
        }
      }

      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMock,
            journeysMock,
            archiveMock,
            journeysMock
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList event="archiveAllActive" />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Archive Templates')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Archive' }))

      await waitFor(() =>
        expect(getByText('Templates Archived')).toBeInTheDocument()
      )
    })
  })

  describe('Sort actually reorders the All Templates section (NES-1872)', () => {
    // Regression: the original bug was that Sort By visibly changed
    // selection but had no effect on order, since sortOrder never reached
    // this component. journey-1 has a later updatedAt but an
    // alphabetically-later title than journey-2 — TITLE sort and the
    // default (updatedAt desc) sort put them in opposite orders, so this
    // pair can only pass if sortOrder is genuinely applied.
    it('orders by updatedAt (default) with the more-recently-updated template first', async () => {
      const { getAllByTestId, getByTestId } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMock,
            journeysMockTwoActive
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
        expect(getByTestId('JourneyCard-journey-1')).toBeInTheDocument()
      )
      const cards = getAllByTestId(/^JourneyCard-/)
      expect(cards[0]).toHaveAttribute('data-testid', 'JourneyCard-journey-1')
      expect(cards[1]).toHaveAttribute('data-testid', 'JourneyCard-journey-2')
    })

    it('orders by title when sortOrder is TITLE', async () => {
      const { getAllByTestId, getByTestId } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMock,
            journeysMockTwoActive
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList sortOrder={SortOrder.TITLE} />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByTestId('JourneyCard-journey-1')).toBeInTheDocument()
      )
      const cards = getAllByTestId(/^JourneyCard-/)
      // "Alpha Editor" sorts before "Welcome Tour" — the opposite of the
      // default-sort test above, proving sortOrder changed the result.
      expect(cards[0]).toHaveAttribute('data-testid', 'JourneyCard-journey-2')
      expect(cards[1]).toHaveAttribute('data-testid', 'JourneyCard-journey-1')
    })
  })

  describe('Bulk actions exclude collection-grouped templates (NES-1872)', () => {
    // journey-2 lives inside a collection; journey-1 is unsectioned. If the
    // bulk action ever included journey-2, this exact-match mutation mock
    // would fail to match and the test would time out waiting for the
    // success snackbar — the collection template must never appear in ids.
    const collectionsMockWithJourneyTwo: MockedResponse<GetTemplateGalleryPages> =
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
                    id: 'journey-2',
                    title: 'Alpha Editor',
                    primaryImageBlock: null
                  }
                ]
              }
            ]
          }
        }
      }

    it('archives only the unsectioned template, not the one grouped in a collection', async () => {
      const archiveMock: MockedResponse = {
        request: {
          query: ARCHIVE_ACTIVE_JOURNEYS,
          variables: { ids: ['journey-1'] }
        },
        result: {
          data: {
            journeysArchive: [
              {
                __typename: 'Journey',
                id: 'journey-1',
                status: JourneyStatus.archived,
                fromTemplateId: null
              }
            ]
          }
        }
      }

      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMockWithJourneyTwo,
            journeysMockTwoActive,
            archiveMock,
            journeysMockTwoActive
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList event="archiveAllActive" />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Archive Templates')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Archive' }))

      await waitFor(() =>
        expect(getByText('Templates Archived')).toBeInTheDocument()
      )
    })
  })

  describe('Remaining bulk-action events (NES-1872)', () => {
    it('opens the Trash confirmation for trashAllActive and trashes only the unsectioned template', async () => {
      const trashMock: MockedResponse = {
        request: {
          query: TRASH_ACTIVE_JOURNEYS,
          variables: { ids: ['journey-1'] }
        },
        result: {
          data: {
            journeysTrash: [
              {
                __typename: 'Journey',
                id: 'journey-1',
                status: JourneyStatus.trashed,
                fromTemplateId: null
              }
            ]
          }
        }
      }

      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            collectionsMock,
            journeysMock,
            trashMock,
            journeysMock
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList event="trashAllActive" />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Trash Templates')).toBeInTheDocument()
      )
      expect(
        getByText('This will trash all active Templates not in a collection.')
      ).toBeInTheDocument()
      fireEvent.click(getByRole('button', { name: 'Trash' }))

      await waitFor(() =>
        expect(getByText('Templates Trashed')).toBeInTheDocument()
      )
    })

    it('opens the Unarchive confirmation for restoreAllArchived and restores only the unsectioned template', async () => {
      const restoreMock: MockedResponse = {
        request: {
          query: RESTORE_ARCHIVED_JOURNEYS,
          variables: { ids: ['journey-1'] }
        },
        result: {
          data: {
            journeysRestore: [
              {
                __typename: 'Journey',
                id: 'journey-1',
                status: JourneyStatus.published,
                fromTemplateId: null
              }
            ]
          }
        }
      }

      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            journeysMockArchived,
            restoreMock,
            journeysMockArchived
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList
                  status="archived"
                  event="restoreAllArchived"
                />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Unarchive Templates')).toBeInTheDocument()
      )
      expect(
        getByText(
          'This will unarchive all archived Templates not in a collection.'
        )
      ).toBeInTheDocument()
      fireEvent.click(getByRole('button', { name: 'Unarchive' }))

      await waitFor(() =>
        expect(getByText('Templates Unarchived')).toBeInTheDocument()
      )
    })

    it('opens the Trash confirmation for trashAllArchived and trashes only the unsectioned template', async () => {
      const trashMock: MockedResponse = {
        request: {
          query: TRASH_ARCHIVED_JOURNEYS,
          variables: { ids: ['journey-1'] }
        },
        result: {
          data: {
            journeysTrash: [
              {
                __typename: 'Journey',
                id: 'journey-1',
                status: JourneyStatus.trashed,
                fromTemplateId: null
              }
            ]
          }
        }
      }

      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            journeysMockArchived,
            trashMock,
            journeysMockArchived
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList
                  status="archived"
                  event="trashAllArchived"
                />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Trash Templates')).toBeInTheDocument()
      )
      expect(
        getByText('This will trash all archived Templates not in a collection.')
      ).toBeInTheDocument()
      fireEvent.click(getByRole('button', { name: 'Trash' }))

      await waitFor(() =>
        expect(getByText('Templates Trashed')).toBeInTheDocument()
      )
    })

    it('opens the Restore confirmation for restoreAllTrashed and restores only the unsectioned template', async () => {
      const restoreMock: MockedResponse = {
        request: {
          query: RESTORE_TRASHED_JOURNEYS,
          variables: { ids: ['journey-1'] }
        },
        result: {
          data: {
            journeysRestore: [
              {
                __typename: 'Journey',
                id: 'journey-1',
                status: JourneyStatus.published,
                fromTemplateId: null
              }
            ]
          }
        }
      }

      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            journeysMockTrashed,
            restoreMock,
            journeysMockTrashed
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList
                  status="trashed"
                  event="restoreAllTrashed"
                />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Restore Templates')).toBeInTheDocument()
      )
      expect(
        getByText(
          'This will restore all trashed Templates not in a collection.'
        )
      ).toBeInTheDocument()
      fireEvent.click(getByRole('button', { name: 'Restore' }))

      await waitFor(() =>
        expect(getByText('Templates Restored')).toBeInTheDocument()
      )
    })

    it('opens the Delete Forever confirmation for deleteAllTrashed and deletes only the unsectioned template', async () => {
      const deleteMock: MockedResponse = {
        request: {
          query: DELETE_TRASHED_JOURNEYS,
          variables: { ids: ['journey-1'] }
        },
        result: {
          data: {
            journeysDelete: [
              {
                __typename: 'Journey',
                id: 'journey-1',
                status: JourneyStatus.deleted,
                fromTemplateId: null
              }
            ]
          }
        }
      }

      const { getByText, getByRole } = render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            journeysMockTrashed,
            deleteMock,
            journeysMockTrashed
          ]}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <TeamProvider>
                <TemplateGalleryPageList
                  status="trashed"
                  event="deleteAllTrashed"
                />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Delete Templates Forever')).toBeInTheDocument()
      )
      fireEvent.click(getByRole('button', { name: 'Delete Forever' }))

      await waitFor(() =>
        expect(getByText('Templates Deleted')).toBeInTheDocument()
      )
    })
  })

  describe('Interaction lock during bulk-action dialogs (CodeRabbit)', () => {
    // A template could otherwise be dragged into/out of a collection while
    // e.g. "Archive All Templates not in a collection" is open — the same
    // class of bug NES-1653/NES-1666 already fixed for the other dialogs
    // on this page.
    it('marks the DnD subtree inert while a bulk-action confirmation dialog is open', async () => {
      const { getByTestId, getByText } = render(
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
                <TemplateGalleryPageList event="archiveAllActive" />
              </TeamProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Archive Templates')).toBeInTheDocument()
      )
      expect(getByTestId('TemplateGalleryDndScope')).toHaveAttribute('inert')
    })
  })
})
