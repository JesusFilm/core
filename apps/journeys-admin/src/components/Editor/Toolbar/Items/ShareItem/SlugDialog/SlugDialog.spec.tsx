import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { JOURNEY_SLUG_UPDATE, SlugDialog } from '.'

describe('JourneyView/Properties/SlugDialog', () => {
  it('should not set journey slug on close', async () => {
    const onClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: defaultJourney,
              variant: 'admin'
            }}
          >
            <SlugDialog open onClose={onClose} journey={defaultJourney} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'new-journey' }
    })
    fireEvent.click(getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('should update journey slug on submit', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          slug: 'new-journey'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SLUG_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  slug: 'New Journey'
                }
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
            <SlugDialog open journey={defaultJourney} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), { target: { value: 'New Journey' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByRole('textbox')).toHaveValue('new-journey')
  })

  it('shows notistack error alert when slug fails to update', async () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SLUG_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  slug: 'new-journey'
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
            <SlugDialog open journey={defaultJourney} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), { target: { value: 'new-journey' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(
        getByText('Field update failed. Reload the page or try again.')
      ).toBeInTheDocument()
    )
  })

  it('is a required field', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyUpdate: {
          id: defaultJourney.id,
          __typename: 'Journey',
          slug: 'new-journey'
        }
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_SLUG_UPDATE,
              variables: {
                id: defaultJourney.id,
                input: {
                  slug: 'New Journey'
                }
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
            <SlugDialog open journey={defaultJourney} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), { target: { value: '' } })
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
    await waitFor(() => expect(result).not.toHaveBeenCalled())
  })

  it('shows custom domain if configured', async () => {
    const { getByText } = render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney,
                team: {
                  id: 'teamId',
                  __typename: 'Team',
                  title: 'Team',
                  publicTitle: 'Team'
                }
              },
              variant: 'admin'
            }}
          >
            <SlugDialog
              open
              hostname="www.customdomain.com"
              journey={defaultJourney}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(
      getByText('https://www.customdomain.com/').parentElement?.textContent
    ).toBe('https://www.customdomain.com/default')
  })
})
