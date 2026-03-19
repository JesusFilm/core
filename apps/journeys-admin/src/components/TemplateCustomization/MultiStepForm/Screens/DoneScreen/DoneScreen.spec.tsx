import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
import { GET_CUSTOM_DOMAINS } from '../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery'
import { GET_JOURNEY_FOR_SHARING } from '../../../../../libs/useJourneyForShareLazyQuery/useJourneyForShareLazyQuery'
import { useJourneyNotifcationUpdateMock } from '../../../../../libs/useJourneyNotificationUpdate/useJourneyNotificationUpdate.mock'

import {
  DoneScreen,
  GET_GOOGLE_SHEETS_SYNCS_FOR_DONE_SCREEN
} from './DoneScreen'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('../../../../../libs/auth', () => ({
  __esModule: true,
  useAuth: () => ({ user: null })
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

const getCustomDomainsMock = {
  request: {
    query: GET_CUSTOM_DOMAINS,
    variables: { teamId: 'teamId' }
  },
  result: {
    data: {
      customDomains: [
        {
          __typename: 'CustomDomain',
          id: 'customDomainId',
          name: 'custom.domain.com',
          apexName: 'custom.domain.com',
          journeyCollection: null
        }
      ]
    }
  }
}

const googleSheetsSyncsNoActiveMock: MockedResponse = {
  request: {
    query: GET_GOOGLE_SHEETS_SYNCS_FOR_DONE_SCREEN,
    variables: { filter: { journeyId: 'journeyId' } }
  },
  result: {
    data: {
      googleSheetsSyncs: []
    }
  }
}

const googleSheetsSyncsWithActiveMock: MockedResponse = {
  request: {
    query: GET_GOOGLE_SHEETS_SYNCS_FOR_DONE_SCREEN,
    variables: { filter: { journeyId: 'journeyId' } }
  },
  result: {
    data: {
      googleSheetsSyncs: [{ id: 'syncId', deletedAt: null }]
    }
  }
}

const journeyForSharingMock = {
  request: {
    query: GET_JOURNEY_FOR_SHARING,
    variables: { id: 'journeyId' }
  },
  result: {
    data: {
      journey: {
        __typename: 'Journey',
        id: 'journeyId',
        slug: 'default',
        language: {
          __typename: 'Language',
          id: '529',
          bcp47: 'en',
          iso3: 'eng',
          name: [
            {
              __typename: 'LanguageName',
              value: 'English',
              primary: true
            }
          ]
        },
        themeName: ThemeName.base,
        themeMode: ThemeMode.light,
        team: {
          __typename: 'Team',
          id: 'teamId',
          customDomains: [
            {
              __typename: 'CustomDomain',
              name: 'custom.domain.com'
            }
          ]
        }
      }
    }
  }
}

describe('DoneScreen', () => {
  let push: jest.Mock
  let writeTextSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    push = jest.fn()

    if (!navigator.clipboard) {
      Object.assign(navigator, { clipboard: { writeText: jest.fn() } })
    }

    writeTextSpy = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockImplementation(jest.fn())

    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null },
      events: { on: jest.fn() }
    } as unknown as NextRouter)
  })

  afterEach(() => {
    writeTextSpy.mockRestore()
  })

  it('renders the completion message', () => {
    render(
      <MockedProvider
        mocks={[getCustomDomainsMock, googleSheetsSyncsNoActiveMock]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getAllByText('Ready to share!')).toHaveLength(2)
  })

  it('renders first card of journey as preview', async () => {
    render(
      <MockedProvider
        mocks={[getCustomDomainsMock, googleSheetsSyncsNoActiveMock]}
      >
        <JourneyProvider value={{ journey: journey, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('TemplateCardPreviewItem')).toBeInTheDocument()
  })

  it('renders all action buttons', () => {
    render(
      <MockedProvider
        mocks={[getCustomDomainsMock, googleSheetsSyncsNoActiveMock]}
      >
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('DoneScreenPreviewButton')).toBeInTheDocument()
    expect(screen.getByTestId('ShareItem')).toBeInTheDocument()
    expect(screen.getByTestId('ProjectsDashboardButton')).toBeInTheDocument()
  })

  it('renders preview button as link when journey has slug', () => {
    const journeyWithSlug = {
      ...journey,
      slug: 'test-journey-slug'
    }

    render(
      <MockedProvider
        mocks={[getCustomDomainsMock, googleSheetsSyncsNoActiveMock]}
      >
        <JourneyProvider value={{ journey: journeyWithSlug, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    const previewButton = screen.getByTestId('DoneScreenPreviewButton')
    expect(previewButton).toHaveAttribute(
      'href',
      '/api/preview?slug=test-journey-slug'
    )
    expect(previewButton).toHaveAttribute('target', '_blank')
  })

  it('navigates to projects dashboard when projects dashboard button is clicked', () => {
    const journeyWithId = {
      ...journey,
      id: 'test-journey-id'
    }

    const syncsForTestJourneyMock: MockedResponse = {
      request: {
        query: GET_GOOGLE_SHEETS_SYNCS_FOR_DONE_SCREEN,
        variables: { filter: { journeyId: 'test-journey-id' } }
      },
      result: { data: { googleSheetsSyncs: [] } }
    }

    render(
      <MockedProvider mocks={[getCustomDomainsMock, syncsForTestJourneyMock]}>
        <JourneyProvider value={{ journey: journeyWithId, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    const dashboardButton = screen.getByRole('button', {
      name: 'Go To Projects Dashboard'
    })
    fireEvent.click(dashboardButton)

    expect(push).toHaveBeenCalledWith('/')
  })

  it('should show loading state on the dashboard button after clicking', () => {
    const journeyWithId = {
      ...journey,
      id: 'test-journey-id'
    }

    const syncsForTestJourneyMock: MockedResponse = {
      request: {
        query: GET_GOOGLE_SHEETS_SYNCS_FOR_DONE_SCREEN,
        variables: { filter: { journeyId: 'test-journey-id' } }
      },
      result: { data: { googleSheetsSyncs: [] } }
    }

    render(
      <MockedProvider mocks={[getCustomDomainsMock, syncsForTestJourneyMock]}>
        <JourneyProvider value={{ journey: journeyWithId, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    const dashboardButton = screen.getByTestId('ProjectsDashboardButton')
    expect(dashboardButton).not.toBeDisabled()

    fireEvent.click(dashboardButton)

    expect(dashboardButton).toBeDisabled()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders notification section heading and label', () => {
    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[getCustomDomainsMock, googleSheetsSyncsNoActiveMock]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <DoneScreen />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByText('Choose where responses go:')).toBeInTheDocument()
    expect(screen.getByText('Send to my email')).toBeInTheDocument()
  })

  it('renders notification switch unchecked by default', () => {
    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[getCustomDomainsMock, googleSheetsSyncsNoActiveMock]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <DoneScreen />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('fires notification update mutation when switch is toggled', async () => {
    const result = jest
      .fn()
      .mockReturnValueOnce(useJourneyNotifcationUpdateMock.result)
    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            getCustomDomainsMock,
            googleSheetsSyncsNoActiveMock,
            { ...useJourneyNotifcationUpdateMock, result }
          ]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <DoneScreen />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('opens the share dialog when clicked', async () => {
    const journeyWithTeam = {
      ...journey,
      team: {
        __typename: 'Team' as const,
        id: 'teamId',
        title: 'Test Team',
        publicTitle: 'Test Team Public'
      }
    }

    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            getCustomDomainsMock,
            googleSheetsSyncsNoActiveMock,
            journeyForSharingMock
          ]}
        >
          <JourneyProvider
            value={{ journey: journeyWithTeam, variant: 'admin' }}
          >
            <DoneScreen />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const shareButton = screen.getByRole('button', { name: 'Share' })
    expect(shareButton).toBeInTheDocument()
    fireEvent.click(shareButton)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Share')

    expect(
      screen.getByRole('button', { name: 'Edit Link' })
    ).toBeInTheDocument()

    const copyButton = screen.getByRole('button', { name: 'Copy' })
    expect(copyButton).toBeInTheDocument()

    const urlTextField = screen.getByRole('textbox')
    expect(urlTextField).toBeInTheDocument()
    expect(urlTextField).toHaveValue('https://custom.domain.com/my-journey')

    fireEvent.click(copyButton)
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(
        'https://custom.domain.com/my-journey'
      )
    })

    await waitFor(() => {
      expect(screen.getByText('Link copied')).toBeInTheDocument()
    })
  })

  it('renders Sync to Google Sheets row with Sync button when no active syncs', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[getCustomDomainsMock, googleSheetsSyncsNoActiveMock]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <DoneScreen />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByText('Sync to Google Sheets')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('GoogleSheetsSyncButton')).toHaveTextContent(
        'Sync'
      )
    })
  })

  it('renders Edit button when active syncs exist', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[getCustomDomainsMock, googleSheetsSyncsWithActiveMock]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <DoneScreen />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('GoogleSheetsSyncButton')).toHaveTextContent(
        'Edit'
      )
    })
  })

  it('opens GoogleSheetsSyncDialog when Sync button is clicked', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[getCustomDomainsMock, googleSheetsSyncsNoActiveMock]}
        >
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <DoneScreen />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByTestId('GoogleSheetsSyncButton'))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
