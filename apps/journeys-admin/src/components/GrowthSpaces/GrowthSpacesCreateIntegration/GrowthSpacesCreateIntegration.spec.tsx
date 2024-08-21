import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { IntegrationType } from '../../../../__generated__/globalTypes'

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
    const cache = new InMemoryCache()

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
          __typename: 'IntegrationGrowthSpaces',
          id: 'integration.id',
          team: { id: 'teamId' },
          type: IntegrationType.growthSpaces,
          accessId: 'access.id',
          accessSecretPart: 'access.secret.part',
          routes: []
        }
      }
    }))

    render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: INTEGRATION_GROWTH_SPACES_CREATE,
              variables: {
                input: {
                  accessId: 'access.id',
                  accessSecret: 'access.secret.part',
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
    fireEvent.click(screen.getAllByTestId('EyeClosedIcon')[0])
    fireEvent.change(accessIdInput, {
      target: { value: 'access.id' }
    })
    fireEvent.submit(accessIdInput)
    await waitFor(() =>
      expect(screen.getByDisplayValue('access.id')).toBeInTheDocument()
    )

    const accessSecretPartInput = screen.getByDisplayValue('')
    fireEvent.click(screen.getByTestId('EyeClosedIcon'))
    fireEvent.change(accessSecretPartInput, {
      target: { value: 'access.secret.part' }
    })
    fireEvent.submit(accessSecretPartInput)
    await waitFor(() =>
      expect(screen.getByDisplayValue('access.secret.part')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    console.log()
    expect(screen.getByText('Growth Spaces settings saved')).toBeInTheDocument()
    expect(cache.extract()['IntegrationGrowthSpaces:integration.id']).toEqual({
      __typename: 'IntegrationGrowthSpaces',
      accessId: 'access.id',
      accessSecretPart: 'access.secret.part',
      id: 'integration.id',
      routes: [],
      team: { id: 'teamId' },
      type: 'growthSpaces'
    })
    expect(push).toHaveBeenCalledWith('/teams/team.id/integrations')
  })

  it('should show notistack error on network error', async () => {
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
          id: null
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
                  accessSecret: 'access.secret.part',
                  teamId: 'team.id'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <GrowthSpacesCreateIntegration />
        </SnackbarProvider>
      </MockedProvider>
    )

    const accessIdInput = screen.getAllByDisplayValue('')[0]
    fireEvent.click(screen.getAllByTestId('EyeClosedIcon')[0])
    fireEvent.change(accessIdInput, {
      target: { value: 'access.id' }
    })
    fireEvent.submit(accessIdInput)
    await waitFor(() =>
      expect(screen.getByDisplayValue('access.id')).toBeInTheDocument()
    )

    const accessSecretPartInput = screen.getByDisplayValue('')
    fireEvent.click(screen.getByTestId('EyeClosedIcon'))
    fireEvent.change(accessSecretPartInput, {
      target: { value: 'access.secret.part' }
    })
    fireEvent.submit(accessSecretPartInput)
    await waitFor(() =>
      expect(screen.getByDisplayValue('access.secret.part')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
      expect(
        screen.getByText(
          'Growth Spaces settings failed. Reload the page or try again.'
        )
      ).toBeInTheDocument()
    })
  })

  it('should show error snackbar on request failure', async () => {
    const push = jest.fn()
    mockedUseRouter.mockReturnValue({
      push,
      query: {
        teamId: 'team.id'
      }
    } as unknown as NextRouter)

    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <GrowthSpacesCreateIntegration />s
        </SnackbarProvider>
      </MockedProvider>
    )

    const accessIdInput = screen.getAllByDisplayValue('')[0]
    fireEvent.click(screen.getAllByTestId('EyeClosedIcon')[0])
    fireEvent.change(accessIdInput, {
      target: { value: 'access.id' }
    })
    fireEvent.submit(accessIdInput)
    await waitFor(() =>
      expect(screen.getByDisplayValue('access.id')).toBeInTheDocument()
    )

    const accessSecretPartInput = screen.getByDisplayValue('')
    fireEvent.click(screen.getByTestId('EyeClosedIcon'))
    fireEvent.change(accessSecretPartInput, {
      target: { value: 'access.secret.part' }
    })
    fireEvent.submit(accessSecretPartInput)
    await waitFor(() =>
      expect(screen.getByDisplayValue('access.secret.part')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })
})
