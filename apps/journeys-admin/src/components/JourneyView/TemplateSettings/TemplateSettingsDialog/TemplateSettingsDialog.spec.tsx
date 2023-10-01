import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { defaultJourney } from '../../data'

import {
  JOURNEY_FEATURE_UPDATE,
  TITLE_DESCRIPTION_UPDATE,
  TemplateSettingsDialog
} from './TemplateSettingsDialog'

const onClose = jest.fn()

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
  beforeEach(() => jest.clearAllMocks())

  it('should update field data on submit', async () => {
    const updatedJourney = {
      title: 'New Title',
      description: 'New Description'
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
              query: TITLE_DESCRIPTION_UPDATE,
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
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
      expect(result2).toHaveBeenCalled()
    })
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
              query: TITLE_DESCRIPTION_UPDATE,
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

  it('shows error alert when either field fails to update', async () => {
    const { getByRole, getByText, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TITLE_DESCRIPTION_UPDATE,
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

  it('should not update featured at if not different from journey', async () => {
    const featuredAtJourney = {
      ...defaultJourney,
      featuredAt: 'featuredAt'
    }

    const result = jest.fn()

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_FEATURE_UPDATE,
              variables: {
                id: featuredAtJourney.id,
                feature: true
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: featuredAtJourney,
              variant: 'admin'
            }}
          >
            <TemplateSettingsDialog open onClose={onClose} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(result).not.toHaveBeenCalled()
    })
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
