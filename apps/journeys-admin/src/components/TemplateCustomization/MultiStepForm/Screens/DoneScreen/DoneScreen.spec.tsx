import { MockedProvider } from '@apollo/client/testing'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, NextRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { journey } from '@core/journeys/ui/JourneyProvider/JourneyProvider.mock'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GET_CUSTOM_DOMAINS } from '../../../../../libs/useCustomDomainsQuery/useCustomDomainsQuery'
import { GET_JOURNEY_FOR_SHARING } from '../../../../../libs/useJourneyForShareLazyQuery/useJourneyForShareLazyQuery'
import { DoneScreen } from './DoneScreen'
import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'

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

// Mock clipboard for ShareItem tests
Object.assign(navigator, { clipboard: { writeText: jest.fn() } })

describe('DoneScreen', () => {
  let push: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    push = jest.fn()

    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null },
      events: { on: jest.fn() }
    } as unknown as NextRouter)
  })

  it('renders the completion message', () => {
    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      "It's Ready!"
    )
  })

  it('renders journey preview card with title and description', () => {
    const journeyWithContent = {
      ...journey,
      seoTitle: 'Test Journey Title',
      seoDescription: 'This is a test journey description for testing purposes',
      displayTitle: 'Display Title'
    }

    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider
          value={{ journey: journeyWithContent, variant: 'admin' }}
        >
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Test Journey Title')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This is a test journey description for testing purposes'
      )
    ).toBeInTheDocument()
  })

  it('renders GridEmptyIcon when no primary image is available', () => {
    const journeyWithoutImage = {
      ...journey,
      primaryImageBlock: null
    }

    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider
          value={{ journey: journeyWithoutImage, variant: 'admin' }}
        >
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })

  it('renders journey image when primary image is available', async () => {
    const journeyWithImage = {
      ...journey,
      primaryImageBlock: {
        __typename: 'ImageBlock' as const,
        id: 'image-block-id',
        src: 'https://example.com/test-image.jpg',
        alt: 'Test Image Alt',
        width: 300,
        height: 200,
        parentBlockId: null,
        parentOrder: 0,
        blurhash: 'test-blurhash',
        scale: 1,
        focalTop: null,
        focalLeft: null
      } satisfies ImageBlock
    }

    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider
          value={{ journey: journeyWithImage, variant: 'admin' }}
        >
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      const image = screen.getByRole('img', { name: 'Test Image Alt' })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg')
    })
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
    expect(
      screen.getByTestId('DoneScreenContinueEditingButton')
    ).toBeInTheDocument()
    expect(screen.getByTestId('ShareItem')).toBeInTheDocument()
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

  it('navigates to journey edit page when continue editing is clicked', () => {
    const journeyWithId = {
      ...journey,
      id: 'test-journey-id'
    }

    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider value={{ journey: journeyWithId, variant: 'admin' }}>
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    const continueEditingButton = screen.getByRole('button', {
      name: 'Keep Editing'
    })
    fireEvent.click(continueEditingButton)

    expect(push).toHaveBeenCalledWith('/journeys/test-journey-id')
  })

  it('does not navigate when journey has no id', () => {
    const journeyWithoutId = {
      ...journey,
      id: null
    } as any

    render(
      <MockedProvider mocks={[getCustomDomainsMock]}>
        <JourneyProvider
          value={{ journey: journeyWithoutId, variant: 'admin' }}
        >
          <DoneScreen />
        </JourneyProvider>
      </MockedProvider>
    )

    const continueEditingButton = screen.getByRole('button', {
      name: 'Keep Editing'
    })
    fireEvent.click(continueEditingButton)

    expect(push).not.toHaveBeenCalled()
  })

  it('opens the Share dialog when ShareItem is clicked', async () => {
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
    expect(screen.getByRole('button', { name: 'QR Code' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Embed/ })).toBeInTheDocument()
  })
})
