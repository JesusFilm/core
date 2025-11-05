import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'

import { getIntegrationMock } from '../../../libs/useIntegrationQuery/useIntegrationQuery.mock'

import {
  GrowthSpacesIntegrationDetails,
  INTEGRATION_GROWTH_SPACES_DELETE,
  INTEGRATION_GROWTH_SPACES_UPDATE
} from './GrowthSpacesIntegrationDetails'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('GrowthSpacesIntegrationDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Integration Update', () => {
    it('should update the integration on save', async () => {
      const push = jest.fn()
      mockedUseRouter.mockReturnValue({
        push,
        query: {
          teamId: 'team.id',
          integrationId: 'integration.id'
        }
      } as unknown as NextRouter)

      const result = jest.fn(() => ({
        data: {
          integrationGrowthSpacesUpdate: {
            id: 'integration.id'
          }
        }
      }))

      render(
        <MockedProvider
          mocks={[
            getIntegrationMock,
            {
              request: {
                query: INTEGRATION_GROWTH_SPACES_UPDATE,
                variables: {
                  id: 'integration.id',
                  input: {
                    accessId: 'new.access.id',
                    accessSecret: 'new.access.secret'
                  }
                }
              },
              result
            }
          ]}
        >
          <SnackbarProvider>
            <GrowthSpacesIntegrationDetails />
          </SnackbarProvider>
        </MockedProvider>
      )

      const accessIdInput = await waitFor(() =>
        screen.getByDisplayValue('access.id')
      )
      fireEvent.click(screen.getAllByTestId('EyeClosedIcon')[0])
      fireEvent.change(accessIdInput, {
        target: { value: 'new.access.id' }
      })
      fireEvent.submit(accessIdInput)
      await waitFor(() =>
        expect(screen.getByDisplayValue('new.access.id')).toBeInTheDocument()
      )

      const accessSecretInput = await waitFor(() =>
        screen.getByDisplayValue('access.secret')
      )
      fireEvent.click(screen.getAllByTestId('EyeClosedIcon')[0])
      fireEvent.change(accessSecretInput, {
        target: { value: 'new.access.secret' }
      })
      fireEvent.submit(accessSecretInput)
      await waitFor(() =>
        expect(
          screen.getByDisplayValue('new.access.secret')
        ).toBeInTheDocument()
      )

      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(
        screen.getByText('Growth Spaces settings saved')
      ).toBeInTheDocument()
    })

    it('should show error snackbar on network error', async () => {
      const push = jest.fn()
      mockedUseRouter.mockReturnValue({
        push,
        query: {
          teamId: 'team.id',
          integrationId: 'integration.id'
        }
      } as unknown as NextRouter)

      const result = jest.fn(() => ({
        data: {
          integrationGrowthSpacesUpdate: {
            id: null
          }
        }
      }))

      render(
        <MockedProvider
          mocks={[
            getIntegrationMock,
            {
              request: {
                query: INTEGRATION_GROWTH_SPACES_UPDATE,
                variables: {
                  id: 'integration.id',
                  input: {
                    accessId: 'new.access.id',
                    accessSecret: 'new.access.secret'
                  }
                }
              },
              result
            }
          ]}
        >
          <SnackbarProvider>
            <GrowthSpacesIntegrationDetails />
          </SnackbarProvider>
        </MockedProvider>
      )

      const accessIdInput = await waitFor(() =>
        screen.getByDisplayValue('access.id')
      )
      fireEvent.click(screen.getAllByTestId('EyeClosedIcon')[0])
      fireEvent.change(accessIdInput, {
        target: { value: 'new.access.id' }
      })
      await waitFor(() => fireEvent.submit(accessIdInput))
      await waitFor(() =>
        expect(screen.getByDisplayValue('new.access.id')).toBeInTheDocument()
      )

      const accessSecretInput = await waitFor(() =>
        screen.getByDisplayValue('access.secret')
      )
      fireEvent.click(screen.getAllByTestId('EyeClosedIcon')[0])

      fireEvent.change(accessSecretInput, {
        target: { value: 'new.access.secret' }
      })
      await waitFor(() => fireEvent.submit(accessSecretInput))
      await waitFor(() =>
        expect(
          screen.getByDisplayValue('new.access.secret')
        ).toBeInTheDocument()
      )

      fireEvent.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => {
        expect(result).toHaveBeenCalled()
      })
      expect(
        screen.getByText(
          'Growth Spaces settings failed. Reload the page or try again.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('Integration Delete', () => {
    it('should remove the integration on remove button click', async () => {
      const cache = new InMemoryCache()

      const push = jest.fn()
      mockedUseRouter.mockReturnValue({
        push,
        query: {
          teamId: 'team.id',
          integrationId: 'integration.id'
        }
      } as unknown as NextRouter)

      const mockResult = jest.fn().mockReturnValue(getIntegrationMock.result)

      const result = jest.fn(() => ({
        data: {
          integrationDelete: {
            __typename: 'IntegrationGrowthSpaces',
            id: 'integration.id'
          }
        }
      }))

      render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              ...getIntegrationMock,
              result: mockResult
            },
            {
              request: {
                query: INTEGRATION_GROWTH_SPACES_DELETE,
                variables: {
                  id: 'integration.id'
                }
              },
              result
            }
          ]}
        >
          <SnackbarProvider>
            <GrowthSpacesIntegrationDetails />
          </SnackbarProvider>
        </MockedProvider>
      )
      await waitFor(() => expect(mockResult).toHaveBeenCalled())
      expect(
        cache.extract()['IntegrationGrowthSpaces:integration.id']
      ).toBeDefined()

      fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(
        cache.extract()['IntegrationGrowthSpaces:integration.id']
      ).toBeUndefined()
      expect(
        screen.getByText('Growth Spaces integration deleted')
      ).toBeInTheDocument()
      expect(push).toHaveBeenCalledWith('/teams/team.id/integrations')
    })

    it('should show error snackbar on network error', async () => {
      mockedUseRouter.mockReturnValue({
        query: {
          teamId: 'team.id',
          integrationId: 'integration.id'
        }
      } as unknown as NextRouter)

      const mockResult = jest.fn().mockReturnValue(getIntegrationMock.result)

      const result = jest.fn(() => ({
        data: {
          integrationDelete: {
            id: null
          }
        }
      }))

      render(
        <MockedProvider
          mocks={[
            {
              ...getIntegrationMock,
              result: mockResult
            },
            {
              request: {
                query: INTEGRATION_GROWTH_SPACES_DELETE,
                variables: {
                  id: 'integration.id'
                }
              },
              result
            }
          ]}
        >
          <SnackbarProvider>
            <GrowthSpacesIntegrationDetails />
          </SnackbarProvider>
        </MockedProvider>
      )

      await waitFor(() => expect(mockResult).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
      await waitFor(() => {
        expect(result).toHaveBeenCalled()
        expect(
          screen.getByText(
            'Growth Spaces settings failed. Reload the page or try again.'
          )
        ).toBeInTheDocument()
      })
    })
  })
})
