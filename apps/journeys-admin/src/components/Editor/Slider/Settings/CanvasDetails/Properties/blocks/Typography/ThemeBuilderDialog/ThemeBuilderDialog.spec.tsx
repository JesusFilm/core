import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import { JourneyFields } from '../../../../../../../../../../__generated__/JourneyFields'

import {
  JOURNEY_FONTS_CREATE,
  JOURNEY_FONTS_UPDATE,
  ThemeBuilderDialog
} from './ThemeBuilderDialog'
import { FontFamily } from './ThemeSettings'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ThemeBuilderDialog', () => {
  const handleClose = jest.fn()

  const mockJourney: JourneyFields = {
    __typename: 'Journey',
    id: 'journey-id',
    slug: 'test-journey',
    title: 'Test Journey',
    description: 'Test description',
    status: JourneyStatus.draft,
    language: {
      __typename: 'Language',
      id: 'language-id',
      bcp47: 'en',
      iso3: 'eng',
      name: []
    },
    createdAt: '2021-11-19T12:34:56.789Z',
    updatedAt: '2021-11-19T12:34:56.789Z',
    publishedAt: null,
    featuredAt: null,
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    strategySlug: null,
    seoTitle: null,
    seoDescription: null,
    template: null,
    blocks: [],
    primaryImageBlock: null,
    creatorDescription: null,
    creatorImageBlock: null,
    userJourneys: [],
    chatButtons: [],
    host: null,
    team: null,
    tags: [],
    website: null,
    showShareButton: null,
    showLikeButton: null,
    showDislikeButton: null,
    displayTitle: null,
    logoImageBlock: null,
    menuButtonIcon: null,
    menuStepBlock: null,
    journeyTheme: {
      __typename: 'JourneyTheme',
      id: 'theme-id',
      headerFont: FontFamily.Montserrat,
      bodyFont: FontFamily.Inter,
      labelFont: FontFamily.Nunito
    }
  }

  const mockJourneyWithoutTheme: JourneyFields = {
    ...mockJourney,
    journeyTheme: null
  }

  const updateMock = {
    request: {
      query: JOURNEY_FONTS_UPDATE,
      variables: {
        id: 'theme-id',
        input: {
          headerFont: FontFamily.Montserrat,
          bodyFont: FontFamily.Inter,
          labelFont: FontFamily.Nunito
        }
      }
    },
    result: jest.fn(() => {
      return {
        data: {
          journeyThemeUpdate: {
            __typename: 'JourneyTheme',
            id: 'theme-id',
            journeyId: 'journey-id',
            headerFont: FontFamily.Montserrat,
            bodyFont: FontFamily.Inter,
            labelFont: FontFamily.Nunito
          }
        }
      }
    })
  }

  const createMock = {
    request: {
      query: JOURNEY_FONTS_CREATE,
      variables: {
        input: {
          journeyId: 'journey-id',
          headerFont: FontFamily.Montserrat,
          bodyFont: FontFamily.Montserrat,
          labelFont: FontFamily.Montserrat
        }
      }
    },
    result: jest.fn(() => {
      return {
        data: {
          journeyThemeCreate: {
            __typename: 'JourneyTheme',
            id: 'new-theme-id',
            journeyId: 'journey-id',
            headerFont: FontFamily.Montserrat,
            bodyFont: FontFamily.Montserrat,
            labelFont: FontFamily.Montserrat
          }
        }
      }
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useMediaQuery as jest.Mock).mockImplementation(() => true)
  })

  it('should render correctly when open', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
            <ThemeBuilderDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByText('Select Fonts')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('should initialize with journey theme values', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
            <ThemeBuilderDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(
      screen.getByRole('combobox', { name: 'Header Text' })
    ).toHaveTextContent(FontFamily.Montserrat)
    expect(
      screen.getByRole('combobox', { name: 'Body Text' })
    ).toHaveTextContent(FontFamily.Inter)
    expect(
      screen.getByRole('combobox', { name: 'Label Text' })
    ).toHaveTextContent(FontFamily.Nunito)
  })

  it('should show Montserrat in dropdowns when journey theme is null', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{ journey: mockJourneyWithoutTheme, variant: 'admin' }}
          >
            <ThemeBuilderDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(
      screen.getByRole('combobox', { name: 'Header Text' })
    ).toHaveTextContent(FontFamily.Montserrat)
    expect(
      screen.getByRole('combobox', { name: 'Body Text' })
    ).toHaveTextContent(FontFamily.Montserrat)
    expect(
      screen.getByRole('combobox', { name: 'Label Text' })
    ).toHaveTextContent(FontFamily.Montserrat)
  })

  it('should call onClose when cancel button is clicked', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
            <ThemeBuilderDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should update journey fonts when confirm is clicked and theme exists', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[updateMock]}>
          <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
            <ThemeBuilderDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => {
      expect(updateMock.result).toHaveBeenCalled()
    })
    expect(handleClose).toHaveBeenCalled()
    expect(screen.getByText('Fonts updated')).toBeInTheDocument()
  })

  it('should create journey fonts when confirm is clicked and theme does not exist', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[createMock]}>
          <JourneyProvider
            value={{ journey: mockJourneyWithoutTheme, variant: 'admin' }}
          >
            <ThemeBuilderDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByText('Confirm'))
    await waitFor(() => {
      expect(createMock.result).toHaveBeenCalled()
    })
    expect(handleClose).toHaveBeenCalled()
    expect(screen.getByText('Theme created')).toBeInTheDocument()
  })

  it('should show error snackbar when update fails', async () => {
    const errorMock = {
      request: {
        query: JOURNEY_FONTS_UPDATE,
        variables: {
          id: 'theme-id',
          input: {
            headerFont: FontFamily.Montserrat,
            bodyFont: FontFamily.Inter,
            labelFont: FontFamily.Nunito
          }
        }
      },
      error: new Error('Update failed')
    }
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[errorMock]}>
          <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
            <ThemeBuilderDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByText('Confirm'))
    await waitFor(() => {
      expect(screen.queryByText('Failed to update fonts')).toBeInTheDocument()
    })
  })

  it('should show error snackbar when theme creation fails', async () => {
    const errorMock = {
      request: {
        query: JOURNEY_FONTS_CREATE,
        variables: {
          input: {
            journeyId: 'journey-id',
            headerFont: FontFamily.Montserrat,
            bodyFont: FontFamily.Montserrat,
            labelFont: FontFamily.Montserrat
          }
        }
      },
      error: new Error('Create failed')
    }

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[errorMock]}>
          <JourneyProvider
            value={{ journey: mockJourneyWithoutTheme, variant: 'admin' }}
          >
            <ThemeBuilderDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const spy = jest.spyOn(require('notistack'), 'enqueueSnackbar')
    fireEvent.click(screen.getByText('Confirm'))
    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith(
        'Failed to create theme',
        expect.objectContaining({
          variant: 'error',
          preventDuplicate: true
        })
      )
    )
  })

  it('should disable confirm button while loading', async () => {
    const loadingMock = {
      delay: 30,
      request: {
        query: JOURNEY_FONTS_UPDATE,
        variables: {
          id: 'theme-id',
          input: {
            headerFont: FontFamily.Montserrat,
            bodyFont: FontFamily.Inter,
            labelFont: FontFamily.Nunito
          }
        }
      },
      result: jest.fn(() => {
        return {
          data: {
            journeyThemeUpdate: {
              __typename: 'JourneyTheme',
              id: 'theme-id',
              journeyId: 'journey-id',
              headerFont: FontFamily.Montserrat,
              bodyFont: FontFamily.Inter,
              labelFont: FontFamily.Nunito
            }
          }
        }
      })
    }

    render(
      <SnackbarProvider>
        <MockedProvider mocks={[loadingMock]}>
          <JourneyProvider value={{ journey: mockJourney, variant: 'admin' }}>
            <ThemeBuilderDialog open onClose={handleClose} />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByText('Confirm'))
    expect(screen.getByText('Confirm')).toBeDisabled()
  })
})
