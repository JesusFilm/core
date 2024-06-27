import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import {
  GrowthSpacesCreateIntegration,
  INTEGRATION_GROWTH_SPACES_CREATE
} from './GrowthSpacesCreateIntegration'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('GrowthSpacesCreateIntegration', () => {
  it('should create a new integration', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      query: {
        teamId: 'team.id'
      }
    } as unknown as NextRouter)

    const result = jest.fn(() => ({
      data: {
        integrationGrowthSpacesCreate: {
          id: 'integration.id'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: INTEGRATION_GROWTH_SPACES_CREATE,
              variables: {
                input: {
                  accessId: 'access.id',
                  accessSecretPart: 'access.secret.part',
                  teamId: 'team.id'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <GrowthSpacesCreateIntegration />s
        </SnackbarProvider>
      </MockedProvider>
    )

    const accessIdInput = screen.getAllByDisplayValue('')[0]
    expect(accessIdInput).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getAllByTestId('EyeClosedIcon')[0])
    fireEvent.click(accessIdInput, {
      target: { value: 'access.id' }
    })
    fireEvent.submit(accessIdInput)

    const accessSecretPartInput = screen.getByDisplayValue('')
    expect(accessSecretPartInput).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getAllByTestId('EyeClosedIcon')[0])
    fireEvent.click(accessSecretPartInput, {
      target: { value: 'access.secret.part' }
    })
    fireEvent.submit(accessSecretPartInput)

    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should show notistack error on network error', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      query: {
        teamId: 'team.id'
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider>
        <SnackbarProvider>
          <GrowthSpacesCreateIntegration />s
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(
        screen.getByText(
          'Growth Spaces settings failed. Reload the page or try again.'
        )
      )
    })
  })
})
