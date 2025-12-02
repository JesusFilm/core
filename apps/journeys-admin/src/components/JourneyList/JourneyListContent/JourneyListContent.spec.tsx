import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
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
import {
  ARCHIVE_ACTIVE_JOURNEYS,
  DELETE_TRASHED_JOURNEYS,
  RESTORE_ARCHIVED_JOURNEYS,
  RESTORE_TRASHED_JOURNEYS,
  TRASH_ACTIVE_JOURNEYS,
  TRASH_ARCHIVED_JOURNEYS
} from './JourneyListContent'

import '../../../../test/i18n'

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

  describe('Snackbar Messages', () => {
    describe('Active Journeys', () => {
      it('should show "Journeys Archived" snackbar after archiving', async () => {
        const archiveMutationMock: MockedResponse = {
          request: {
            query: ARCHIVE_ACTIVE_JOURNEYS,
            variables: { ids: [defaultJourney.id, oldJourney.id] }
          },
          result: {
            data: {
              journeysArchive: [
                { id: defaultJourney.id, status: JourneyStatus.archived },
                { id: oldJourney.id, status: JourneyStatus.archived }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[
              activeJourneysMock,
              archiveMutationMock,
              activeJourneysMock
            ]}
          >
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

        fireEvent.click(getByRole('button', { name: 'Archive' }))

        await waitFor(() =>
          expect(getByText('Journeys Archived')).toBeInTheDocument()
        )
      })

      it('should show "Journeys Trashed" snackbar after trashing', async () => {
        const trashMutationMock: MockedResponse = {
          request: {
            query: TRASH_ACTIVE_JOURNEYS,
            variables: { ids: [defaultJourney.id, oldJourney.id] }
          },
          result: {
            data: {
              journeysTrash: [
                { id: defaultJourney.id, status: JourneyStatus.trashed },
                { id: oldJourney.id, status: JourneyStatus.trashed }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[activeJourneysMock, trashMutationMock, activeJourneysMock]}
          >
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

        fireEvent.click(getByRole('button', { name: 'Trash' }))

        await waitFor(() =>
          expect(getByText('Journeys Trashed')).toBeInTheDocument()
        )
      })
    })

    describe('Active Templates', () => {
      it('should show "Templates Archived" snackbar after archiving', async () => {
        const archiveMutationMock: MockedResponse = {
          request: {
            query: ARCHIVE_ACTIVE_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysArchive: [
                { id: defaultJourney.id, status: JourneyStatus.archived }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[templatesMock, archiveMutationMock, templatesMock]}
          >
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

        await waitFor(() =>
          expect(getByText('Archive Templates')).toBeInTheDocument()
        )

        fireEvent.click(getByRole('button', { name: 'Archive' }))

        await waitFor(() =>
          expect(getByText('Templates Archived')).toBeInTheDocument()
        )
      })

      it('should show "Templates Trashed" snackbar after trashing', async () => {
        const trashMutationMock: MockedResponse = {
          request: {
            query: TRASH_ACTIVE_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysTrash: [
                { id: defaultJourney.id, status: JourneyStatus.trashed }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[templatesMock, trashMutationMock, templatesMock]}
          >
            <ThemeProvider>
              <SnackbarProvider>
                <JourneyListContent
                  contentType="templates"
                  status="active"
                  event="trashAllActive"
                />
              </SnackbarProvider>
            </ThemeProvider>
          </MockedProvider>
        )

        await waitFor(() =>
          expect(getByText('Trash Templates')).toBeInTheDocument()
        )

        fireEvent.click(getByRole('button', { name: 'Trash' }))

        await waitFor(() =>
          expect(getByText('Templates Trashed')).toBeInTheDocument()
        )
      })
    })

    describe('Archived Journeys', () => {
      it('should show "Journeys Restored" snackbar after restoring', async () => {
        const restoreMutationMock: MockedResponse = {
          request: {
            query: RESTORE_ARCHIVED_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysRestore: [
                { id: defaultJourney.id, status: JourneyStatus.published }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[
              archivedJourneysMock,
              restoreMutationMock,
              archivedJourneysMock
            ]}
          >
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

        fireEvent.click(getByRole('button', { name: 'Unarchive' }))

        await waitFor(() =>
          expect(getByText('Journeys Restored')).toBeInTheDocument()
        )
      })

      it('should show "Journeys Trashed" snackbar after trashing', async () => {
        const trashMutationMock: MockedResponse = {
          request: {
            query: TRASH_ARCHIVED_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysTrash: [
                { id: defaultJourney.id, status: JourneyStatus.trashed }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[
              archivedJourneysMock,
              trashMutationMock,
              archivedJourneysMock
            ]}
          >
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

        await waitFor(() =>
          expect(getByText('Trash Journeys')).toBeInTheDocument()
        )

        fireEvent.click(getByRole('button', { name: 'Trash' }))

        await waitFor(() =>
          expect(getByText('Journeys Trashed')).toBeInTheDocument()
        )
      })
    })

    describe('Archived Templates', () => {
      it('should show "Templates Restored" snackbar after restoring', async () => {
        const restoreMutationMock: MockedResponse = {
          request: {
            query: RESTORE_ARCHIVED_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysRestore: [
                { id: defaultJourney.id, status: JourneyStatus.published }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[
              archivedTemplatesMock,
              restoreMutationMock,
              archivedTemplatesMock
            ]}
          >
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

        await waitFor(() =>
          expect(getByText('Unarchive Templates')).toBeInTheDocument()
        )

        fireEvent.click(getByRole('button', { name: 'Unarchive' }))

        await waitFor(() =>
          expect(getByText('Templates Restored')).toBeInTheDocument()
        )
      })

      it('should show "Templates Trashed" snackbar after trashing', async () => {
        const trashMutationMock: MockedResponse = {
          request: {
            query: TRASH_ARCHIVED_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysTrash: [
                { id: defaultJourney.id, status: JourneyStatus.trashed }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[
              archivedTemplatesMock,
              trashMutationMock,
              archivedTemplatesMock
            ]}
          >
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

        await waitFor(() =>
          expect(getByText('Trash Templates')).toBeInTheDocument()
        )

        fireEvent.click(getByRole('button', { name: 'Trash' }))

        await waitFor(() =>
          expect(getByText('Templates Trashed')).toBeInTheDocument()
        )
      })
    })

    describe('Trashed Journeys', () => {
      it('should show "Journeys Restored" snackbar after restoring', async () => {
        const restoreMutationMock: MockedResponse = {
          request: {
            query: RESTORE_TRASHED_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysRestore: [
                { id: defaultJourney.id, status: JourneyStatus.published }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[
              trashedJourneysMock,
              restoreMutationMock,
              trashedJourneysMock
            ]}
          >
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

        fireEvent.click(getByRole('button', { name: 'Restore' }))

        await waitFor(() =>
          expect(getByText('Journeys Restored')).toBeInTheDocument()
        )
      })

      it('should show "Journeys Deleted" snackbar after deleting', async () => {
        const deleteMutationMock: MockedResponse = {
          request: {
            query: DELETE_TRASHED_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysDelete: [
                { id: defaultJourney.id, status: JourneyStatus.deleted }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[
              trashedJourneysMock,
              deleteMutationMock,
              trashedJourneysMock
            ]}
          >
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

        fireEvent.click(getByRole('button', { name: 'Delete Forever' }))

        await waitFor(() =>
          expect(getByText('Journeys Deleted')).toBeInTheDocument()
        )
      })
    })

    describe('Trashed Templates', () => {
      it('should show "Templates Restored" snackbar after restoring', async () => {
        const restoreMutationMock: MockedResponse = {
          request: {
            query: RESTORE_TRASHED_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysRestore: [
                { id: defaultJourney.id, status: JourneyStatus.published }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[
              trashedTemplatesMock,
              restoreMutationMock,
              trashedTemplatesMock
            ]}
          >
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

        await waitFor(() =>
          expect(getByText('Restore Templates')).toBeInTheDocument()
        )

        fireEvent.click(getByRole('button', { name: 'Restore' }))

        await waitFor(() =>
          expect(getByText('Templates Restored')).toBeInTheDocument()
        )
      })

      it('should show "Templates Deleted" snackbar after deleting', async () => {
        const deleteMutationMock: MockedResponse = {
          request: {
            query: DELETE_TRASHED_JOURNEYS,
            variables: { ids: [defaultJourney.id] }
          },
          result: {
            data: {
              journeysDelete: [
                { id: defaultJourney.id, status: JourneyStatus.deleted }
              ]
            }
          }
        }

        const { getByText, getByRole } = render(
          <MockedProvider
            mocks={[
              trashedTemplatesMock,
              deleteMutationMock,
              trashedTemplatesMock
            ]}
          >
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

        await waitFor(() =>
          expect(getByText('Delete Templates Forever')).toBeInTheDocument()
        )

        fireEvent.click(getByRole('button', { name: 'Delete Forever' }))

        await waitFor(() =>
          expect(getByText('Templates Deleted')).toBeInTheDocument()
        )
      })
    })
  })
})
