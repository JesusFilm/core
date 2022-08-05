import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { defaultJourney } from '../data'
import { Menu, TEMPLATE_PUBLISH } from './Menu'

describe('TemplateView/Menu', () => {
  it('should open menu on click', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
            <Menu />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
  })

  it('should publish when clicked', async () => {
    const result = jest.fn(() => {
      return {
        data: {
          journeyPublish: {
            id: defaultJourney.id,
            __typename: 'Journey',
            status: JourneyStatus.published
          }
        }
      }
    })

    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: TEMPLATE_PUBLISH,
                variables: {
                  id: defaultJourney.id
                }
              },
              result
            }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
            <Menu />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Publish' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
