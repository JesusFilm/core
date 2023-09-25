import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { StrategySlugUpdate } from '../../../../__generated__/StrategySlugUpdate'
import { defaultJourney } from '../../JourneyView/data'

import {
  STRATEGY_SLUG_UPDATE,
  StrategySlugUpdateForm
} from './StrategySlugUpdateForm'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('StrategySlugUpdateForm', () => {
  const strategySlugUpdateNull: MockedResponse<StrategySlugUpdate> = {
    request: {
      query: STRATEGY_SLUG_UPDATE,
      variables: {
        id: defaultJourney.id,
        input: {
          strategySlug: null
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: defaultJourney.id,
          strategySlug: null
        }
      }
    }))
  }

  const strategySlugUpdateCanva: MockedResponse<StrategySlugUpdate> = {
    request: {
      query: STRATEGY_SLUG_UPDATE,
      variables: {
        id: defaultJourney.id,
        input: {
          strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: defaultJourney.id,
          strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view'
        }
      }
    }))
  }

  const strategySlugUpdateGoogle: MockedResponse<StrategySlugUpdate> = {
    request: {
      query: STRATEGY_SLUG_UPDATE,
      variables: {
        id: defaultJourney.id,
        input: {
          strategySlug:
            'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: defaultJourney.id,
          strategySlug:
            'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
        }
      }
    }))
  }

  afterEach(() => jest.clearAllMocks())

  it('should validate on invalid embed url', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider>
            <StrategySlugUpdateForm />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const textField = getByRole('textbox')
    fireEvent.change(textField, {
      target: { value: 'www.canva.com/123' }
    })
    fireEvent.submit(getByRole('textbox'))

    await waitFor(() => expect(getByText('Invalid URL')).toBeInTheDocument())
  })

  it('should update embed url for canva', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[strategySlugUpdateCanva]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <StrategySlugUpdateForm />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const textField = getByRole('textbox')
    fireEvent.change(textField, {
      target: { value: 'https://www.canva.com/design/DAFvDBw1z1A/view' }
    })
    fireEvent.submit(getByRole('textbox'))

    await waitFor(() =>
      expect(strategySlugUpdateCanva.result).toHaveBeenCalled()
    )
    expect(getByText('Embedded URL has been updated')).toBeInTheDocument()
  })

  it('should update embed url for google slides', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[strategySlugUpdateGoogle]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <StrategySlugUpdateForm />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const textField = getByRole('textbox')
    fireEvent.change(textField, {
      target: {
        value:
          'https://docs.google.com/presentation/d/e/2PACX-1vR9RRy1myecVCtOG06olCS7M4h2eEsVDrNdp_17Z1KjRpY0HieSnK5SFEWjDaE6LZR9kBbVm4hQOsr7/pub?start=false&loop=false&delayms=3000'
      }
    })
    fireEvent.submit(getByRole('textbox'))

    await waitFor(() =>
      expect(strategySlugUpdateGoogle.result).toHaveBeenCalled()
    )
    expect(getByText('Embedded URL has been updated')).toBeInTheDocument()
  })

  it('should update embed url to null', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider mocks={[strategySlugUpdateNull]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <StrategySlugUpdateForm />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const textField = getByRole('textbox')
    fireEvent.change(textField, {
      target: { value: '' }
    })
    fireEvent.submit(getByRole('textbox'))

    await waitFor(() =>
      expect(strategySlugUpdateNull.result).toHaveBeenCalled()
    )
    expect(getByText('Embedded URL has been updated')).toBeInTheDocument()
  })

  it('should show snackbar alert on error when strategy slug update fails', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[{ ...strategySlugUpdateNull, error: new Error('error') }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <StrategySlugUpdateForm />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const textField = getByRole('textbox')
    fireEvent.change(textField, {
      target: { value: '' }
    })
    fireEvent.submit(getByRole('textbox'))

    await waitFor(() =>
      expect(
        getByText('Strategy slug update failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })
})
