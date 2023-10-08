import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JOURNEY_SETTINGS_UPDATE } from '../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation'
import { defaultJourney } from '../../data'

import {
  JOURNEY_FEATURE_UPDATE,
  TemplateSettingsDialog
} from './TemplateSettingsDialog'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateSettingsDialog', () => {
  const onClose = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('should update field data and close dialog on submit', async () => {
    const updatedJourney = {
      title: 'New Title',
      description: 'New Description',
      strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view'
    }

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          ...updatedJourney
        }
      }
    }))

    const result2 = jest.fn(() => ({
      data: {
        journeyFeature: {
          id: defaultJourney.id,
          __typename: 'Journey',
          featuredAt: Date.now()
        }
      }
    }))

    const { getByRole, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: updatedJourney
              }
            },
            result
          },
          {
            request: {
              query: JOURNEY_FEATURE_UPDATE,
              variables: {
                id: defaultJourney.id,
                feature: true
              }
            },
            result: result2
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'New Title' }
    })
    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('checkbox'))
    fireEvent.click(getByRole('tab', { name: 'About' }))

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://www.canva.com/design/DAFvDBw1z1A/view' }
    })

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
      expect(result2).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should update case study to a google slides embed link', async () => {
    const updatedJourney = {
      title: defaultJourney.title,
      description: defaultJourney.description,
      strategySlug:
        'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
    }

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          ...updatedJourney
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: updatedJourney
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('tab', { name: 'About' }))

    fireEvent.change(getByRole('textbox'), {
      target: {
        value:
          'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
      }
    })

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('should validate on invalid embed url', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('tab', { name: 'About' }))
    const textField = getByRole('textbox')
    fireEvent.change(textField, {
      target: { value: 'www.canva.com/123' }
    })
    fireEvent.submit(getByRole('textbox'))

    await waitFor(() =>
      expect(getByText('Invalid embed link')).toBeInTheDocument()
    )
  })

  it('should update embed url to null on empty string', async () => {
    const journeyWithStrategySlug = {
      ...defaultJourney,
      strategySlug:
        'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
    }

    const updatedJourney = {
      title: journeyWithStrategySlug.title,
      description: journeyWithStrategySlug.description,
      strategySlug: null
    }

    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: journeyWithStrategySlug.id,
          __typename: 'Journey',
          ...updatedJourney
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: journeyWithStrategySlug.id,
                input: { ...updatedJourney }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: journeyWithStrategySlug,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('tab', { name: 'About' }))
    expect(getByRole('textbox')).toHaveValue(
      journeyWithStrategySlug.strategySlug
    )
    await fireEvent.change(getByRole('textbox'), {
      target: { value: '' }
    })
    expect(getByRole('textbox')).toHaveValue('')
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not update field data if it remains unchanged on submit', async () => {
    const result = jest.fn()
    const result2 = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey'
        }
      }
    }))

    const { getByRole, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: defaultJourney.title,
                  description: defaultJourney.description
                }
              }
            },
            result
          },
          {
            request: {
              query: JOURNEY_FEATURE_UPDATE,
              variables: {
                id: defaultJourney.id,
                feature: false
              }
            },
            result: result2
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: defaultJourney.title }
    })
    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: defaultJourney.description }
    })

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).not.toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(result2).not.toHaveBeenCalled()
    })
  })

  it('shows error alert when any field fails to update', async () => {
    const { getByRole, getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SETTINGS_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  title: 'New Title',
                  description: 'New Description'
                }
              }
            },
            result: {
              data: {
                journeyUpdate: {
                  id: defaultJourney.id,
                  __typename: 'Journey',
                  title: 'New Title',
                  description: 'New Description'
                }
              }
            }
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'New Description' }
    })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Field update failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })

  it('calls on close and resets form when dialog is closed', async () => {
    const { getByRole, getByTestId, getAllByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getAllByRole('textbox')[0], {
      target: { value: 'some title that wont be saved' }
    })
    expect(getByTestId('template-settings-dialog-form')).toHaveFormValues({
      title: 'some title that wont be saved'
    })
    fireEvent.change(getAllByRole('textbox')[1], {
      target: { value: 'some description that wont be saved' }
    })
    expect(getByTestId('template-settings-dialog-form')).toHaveFormValues({
      description: 'some description that wont be saved'
    })
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
      expect(getByTestId('template-settings-dialog-form')).toHaveFormValues({
        description: defaultJourney.description
      })

      expect(getByTestId('template-settings-dialog-form')).toHaveFormValues({
        title: defaultJourney.title
      })
    })
  })

  it('switches between tabs', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('tab', { name: 'Categories' }))

    await waitFor(() => {
      expect(getByRole('tab', { selected: true })).toHaveTextContent(
        'Categories'
      )
    })
  })
})
