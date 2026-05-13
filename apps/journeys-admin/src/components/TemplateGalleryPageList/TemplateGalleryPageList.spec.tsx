import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { getLastActiveTeamIdAndTeamsMock } from '@core/journeys/ui/TeamProvider/TeamProvider.mock'

import { GetAdminJourneys } from '../../../__generated__/GetAdminJourneys'
import {
  GetTemplateGalleryPages,
  GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage
} from '../../../__generated__/GetTemplateGalleryPages'
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

// Mock JourneyCard so we can capture / invoke the `onTrashSuccess` prop
// without having to drive the full trash dialog flow. The integration
// chain (TrashJourneyDialog → JourneyCardMenu → JourneyCard) is covered
// by each of those components' own specs.
jest.mock('../JourneyList/JourneyCard', () => ({
  JourneyCard: ({
    journey,
    onTrashSuccess
  }: {
    journey: { id: string; title: string }
    onTrashSuccess?: () => void
  }) => (
    <button
      type="button"
      data-testid={`mock-journey-card-${journey.id}`}
      data-has-trash-success={onTrashSuccess != null ? 'yes' : 'no'}
      onClick={() => onTrashSuccess?.()}
    >
      {journey.title}
    </button>
  )
}))

// Mock useRevalidateTemplateGallery so we can assert what slugs the
// closure dispatches without hitting the real `fetch` chain.
const mockRevalidate = jest.fn()
jest.mock('../../libs/useRevalidateTemplateGallery', () => ({
  useRevalidateTemplateGallery: () => mockRevalidate
}))

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
  beforeEach(() => {
    mockRevalidate.mockReset()
  })

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

  describe('NES-1644 onTrashSuccess closure', () => {
    // Build a collections mock with one published + one draft collection,
    // each containing one journey. Plus the journeys mock so the unsectioned
    // grid renders a third journey card.
    const PUBLISHED_SLUG = 'pub-collection'
    const PUBLISHED_ID = 'page-pub'
    const DRAFT_ID = 'page-draft'
    const PUB_JOURNEY = 'journey-in-pub'
    const DRAFT_JOURNEY = 'journey-in-draft'
    const UNSECTIONED_JOURNEY = 'journey-unsectioned'

    function templateRef(id: string, title: string) {
      return {
        __typename: 'Journey' as const,
        id,
        title,
        primaryImageBlock: null
      }
    }

    function collection(
      id: string,
      slug: string,
      status: TemplateGalleryPageStatus,
      templateId: string
    ): TemplateGalleryPage {
      return {
        __typename: 'TemplateGalleryPage',
        id,
        title: id,
        description: '',
        slug,
        status,
        creatorName: 'Creator',
        creatorImageSrc: null,
        creatorImageAlt: null,
        mediaUrl: null,
        publishedAt:
          status === TemplateGalleryPageStatus.published
            ? '2026-05-01T00:00:00.000Z'
            : null,
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-01T00:00:00.000Z',
        templates: [templateRef(templateId, templateId)]
      }
    }

    const mixedCollectionsMock: MockedResponse<GetTemplateGalleryPages> = {
      request: {
        query: GET_TEMPLATE_GALLERY_PAGES,
        variables: { teamId: TEAM_ID }
      },
      result: {
        data: {
          templateGalleryPages: [
            collection(
              PUBLISHED_ID,
              PUBLISHED_SLUG,
              TemplateGalleryPageStatus.published,
              PUB_JOURNEY
            ),
            collection(
              DRAFT_ID,
              'draft-collection',
              TemplateGalleryPageStatus.draft,
              DRAFT_JOURNEY
            )
          ]
        }
      }
    }

    function makeJourney(id: string, title: string): any {
      return {
        __typename: 'Journey',
        id,
        title,
        createdAt: '2026-04-30T00:00:00.000Z',
        publishedAt: '2026-05-01T00:00:00.000Z',
        trashedAt: null,
        updatedAt: '2026-05-01T00:00:00.000Z',
        description: null,
        slug: id,
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
        userJourneys: [],
        primaryImageBlock: null,
        team: { __typename: 'Team', id: TEAM_ID },
        fromTemplateId: null,
        journeyCustomizationDescription: null,
        journeyCustomizationFields: [],
        website: null,
        customizable: null
      }
    }

    const mixedJourneysMock: MockedResponse<GetAdminJourneys> = {
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
            makeJourney(PUB_JOURNEY, 'In published'),
            makeJourney(DRAFT_JOURNEY, 'In draft'),
            makeJourney(UNSECTIONED_JOURNEY, 'Unsectioned')
          ]
        }
      }
    }

    function renderList(): void {
      render(
        <MockedProvider
          mocks={[
            getLastActiveTeamIdAndTeamsMock,
            mixedCollectionsMock,
            mixedJourneysMock
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

    it('fires revalidate with the published collection slug when its journey is trashed', async () => {
      renderList()
      const card = await screen.findByTestId(
        `mock-journey-card-${PUB_JOURNEY}`
      )
      expect(card.getAttribute('data-has-trash-success')).toBe('yes')
      act(() => {
        card.click()
      })
      expect(mockRevalidate).toHaveBeenCalledTimes(1)
      expect(mockRevalidate).toHaveBeenCalledWith([PUBLISHED_SLUG])
    })

    it('does not pass onTrashSuccess for a journey in a draft collection', async () => {
      renderList()
      const card = await screen.findByTestId(
        `mock-journey-card-${DRAFT_JOURNEY}`
      )
      expect(card.getAttribute('data-has-trash-success')).toBe('no')
      act(() => {
        card.click()
      })
      expect(mockRevalidate).not.toHaveBeenCalled()
    })

    it('does not pass onTrashSuccess to unsectioned JourneyCards', async () => {
      renderList()
      const card = await screen.findByTestId(
        `mock-journey-card-${UNSECTIONED_JOURNEY}`
      )
      expect(card.getAttribute('data-has-trash-success')).toBe('no')
      act(() => {
        card.click()
      })
      expect(mockRevalidate).not.toHaveBeenCalled()
    })
  })
})
