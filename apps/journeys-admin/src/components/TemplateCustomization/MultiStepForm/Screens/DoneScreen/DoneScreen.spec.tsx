import { MockedProvider } from '@apollo/client/testing'
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

import { DoneScreen } from './DoneScreen'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
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
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getAllByText('Ready to Share!')).toHaveLength(2)
  })

  it('renders first card of journey as preview', async () => {
    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider value={{ journey: journey, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('TemplateCardPreviewItem')).toBeInTheDocument()
  })

  it('renders all action buttons', () => {
    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('DoneScreenPreviewButton')).toBeInTheDocument()
    expect(screen.getByTestId('ShareItem')).toBeInTheDocument()
    expect(
      screen.getByTestId('DoneScreenGoToDashboardButton')
    ).toBeInTheDocument()
  })

  it('renders preview button as link when journey has slug', () => {
    const journeyWithSlug = {
      ...journey,
      slug: 'test-journey-slug'
    }

    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
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

  it('navigates to journey list when go to dashboard is clicked', () => {
    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    const goToDashboardButton = screen.getByRole('button', {
      name: 'Go to Dashboard'
    })
    fireEvent.click(goToDashboardButton)

    expect(push).toHaveBeenCalledWith('/journeys')
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
        <MockedProvider mocks={[getCustomDomainsMock, journeyForSharingMock]}>
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
})
