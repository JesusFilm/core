import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { ThemeProvider } from '../../ThemeProvider'
import { defaultJourney, oldJourney } from '../journeyListData'

import { JourneyListContent } from '.'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: jest.fn(() => false)
}))

const user: User = {
  id: 'user-id1',
  displayName: 'Test User',
  email: 'test@example.com'
} as unknown as User

const activeJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [defaultJourney, oldJourney]
    }
  }
}

const noJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const templatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: true,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          template: true
        }
      ]
    }
  }
}

const archivedJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          status: JourneyStatus.archived
        }
      ]
    }
  }
}

const trashedJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          status: JourneyStatus.trashed,
          trashedAt: new Date().toISOString()
        }
      ]
    }
  }
}

const noTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      template: true,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const noArchivedMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const noTrashedMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: false,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const archivedTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: true,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          status: JourneyStatus.archived,
          template: true
        }
      ]
    }
  }
}

const noArchivedTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.archived],
      template: true,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

const trashedTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: true,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [
        {
          ...defaultJourney,
          status: JourneyStatus.trashed,
          template: true,
          trashedAt: new Date().toISOString()
        }
      ]
    }
  }
}

const noTrashedTemplatesMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.trashed],
      template: true,
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: []
    }
  }
}

describe('JourneyListContent', () => {
  describe('Active Journeys', () => {
    it('should render journeys list', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="active"
                user={user}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      expect(getByText('An Old Journey Heading')).toBeInTheDocument()
    })

    it('should display empty state message when no journeys', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[noJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="active"
                user={user}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('No journeys to display.')).toBeInTheDocument()
      )
    })

    it('should open archive dialog when event is archiveAllActive', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="active"
                user={user}
                event="archiveAllActive"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Archive Journeys')).toBeInTheDocument()
      )
    })

    it('should open trash dialog when event is trashAllActive', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="active"
                user={user}
                event="trashAllActive"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Trash Journeys')).toBeInTheDocument()
      )
    })
  })

  describe('Active Templates', () => {
    it('should render templates list', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[templatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent contentType="templates" status="active" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state message when no templates', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[noTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent contentType="templates" status="active" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('No templates to display.')).toBeInTheDocument()
      )
    })

    it('should open archive dialog with template-specific message', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[templatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="templates"
                status="active"
                event="archiveAllActive"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(getByText('Archive Templates')).toBeInTheDocument()
        expect(
          getByText('This will archive all active templates you own.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Archived Journeys', () => {
    it('should render archived journeys', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="archived"
                user={user}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state for archived journeys', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[noArchivedMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="archived"
                user={user}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('No archived journeys.')).toBeInTheDocument()
      )
    })

    it('should open restore dialog when event is restoreAllArchived', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="archived"
                user={user}
                event="restoreAllArchived"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Unarchive Journeys')).toBeInTheDocument()
      )
    })

    it('should open trash dialog when event is trashAllArchived', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="archived"
                user={user}
                event="trashAllArchived"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(getByText('Trash Journeys')).toBeInTheDocument()
        expect(
          getByText('This will trash all archived journeys you own.')
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Trashed Journeys', () => {
    it('should render trashed journeys', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="trashed"
                user={user}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state for trashed journeys', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[noTrashedMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="trashed"
                user={user}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(
          getByText('Your trashed journeys will appear here.')
        ).toBeInTheDocument()
      )
    })

    it('should open restore dialog when event is restoreAllTrashed', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="trashed"
                user={user}
                event="restoreAllTrashed"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Restore Journeys')).toBeInTheDocument()
      )
    })

    it('should open delete dialog when event is deleteAllTrashed', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="trashed"
                user={user}
                event="deleteAllTrashed"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Delete Journeys Forever')).toBeInTheDocument()
      )
    })
  })

  describe('Archived Templates', () => {
    it('should render archived templates', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent contentType="templates" status="archived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state for archived templates', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[noArchivedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent contentType="templates" status="archived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('No archived templates.')).toBeInTheDocument()
      )
    })

    it('should open restore dialog when event is restoreAllArchived', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="templates"
                status="archived"
                event="restoreAllArchived"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(getByText('Unarchive Templates')).toBeInTheDocument()
        expect(
          getByText('This will unarchive all archived templates you own.')
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })

    it('should open trash dialog when event is trashAllArchived', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="templates"
                status="archived"
                event="trashAllArchived"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(getByText('Trash Templates')).toBeInTheDocument()
        expect(
          getByText('This will trash all archived templates you own.')
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Trashed Templates', () => {
    it('should render trashed templates', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent contentType="templates" status="trashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state for trashed templates', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[noTrashedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent contentType="templates" status="trashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(
          getByText('Your trashed templates will appear here.')
        ).toBeInTheDocument()
      )
    })

    it('should open restore dialog when event is restoreAllTrashed', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="templates"
                status="trashed"
                event="restoreAllTrashed"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(getByText('Restore Templates')).toBeInTheDocument()
        expect(
          getByText('This will restore all trashed templates you own.')
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })

    it('should open delete dialog when event is deleteAllTrashed', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="templates"
                status="trashed"
                event="deleteAllTrashed"
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() => {
        expect(getByText('Delete Templates Forever')).toBeInTheDocument()
        expect(
          getByText(
            'This will permanently delete all trashed templates you own.'
          )
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Helper Text', () => {
    it('should display helper text for active journeys', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[activeJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="active"
                user={user}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(
          getByText(
            'You can archive a Journey to hide it from your active Journey list for better organization.'
          )
        ).toBeInTheDocument()
      )
    })

    it('should display helper text for archived journeys', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="archived"
                user={user}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(
          getByText(
            'You can archive a Journey to hide it from your active Journey list for better organization.'
          )
        ).toBeInTheDocument()
      )
    })

    it('should display helper text for trashed journeys', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedJourneysMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent
                contentType="journeys"
                status="trashed"
                user={user}
              />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(
          getByText('Trashed journeys are moved here for up to 40 days.')
        ).toBeInTheDocument()
      )
    })

    it('should display helper text for active templates', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[templatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent contentType="templates" status="active" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(
          getByText(
            'You can archive a template to hide it from the Template Library.'
          )
        ).toBeInTheDocument()
      )
    })

    it('should display helper text for archived templates', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[archivedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent contentType="templates" status="archived" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(
          getByText('Archived templates are hidden from the Template Library.')
        ).toBeInTheDocument()
      )
    })

    it('should display helper text for trashed templates', async () => {
      const { getByText } = render(
        <MockedProvider mocks={[trashedTemplatesMock]}>
          <ThemeProvider>
            <SnackbarProvider>
              <JourneyListContent contentType="templates" status="trashed" />
            </SnackbarProvider>
          </ThemeProvider>
        </MockedProvider>
      )

      await waitFor(() =>
        expect(
          getByText('Trashed templates are moved here for up to 40 days.')
        ).toBeInTheDocument()
      )
    })
  })
})
