import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
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

    await waitFor(() =>
      expect(getByTestId('CollectionCard-page-1')).toBeInTheDocument()
    )
    // The archived journey should NOT appear in the unsectioned list.
    expect(queryByText('Welcome Tour')).not.toBeInTheDocument()
  })
})
