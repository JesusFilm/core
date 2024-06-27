import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { getIntegrationMock } from '../../../libs/useIntegrationQuery/useIntegrationQuery.mock'
import {
  GrowthSpacesIntegrationDetails,
  INTEGRATION_GROWTH_SPACES_UPDATE
} from './GrowthSpacesIntegrationDetails'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('GrowthSpacesIntegrationDetails', () => {
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
    fireEvent.click(accessIdInput, {
      target: { value: 'new.access.id' }
    })
    fireEvent.submit(accessIdInput)

    const accessSecretInput = await waitFor(() =>
      screen.getByDisplayValue('access.secret')
    )
    fireEvent.click(accessSecretInput, {
      target: { value: 'new.access.secret' }
    })
    fireEvent.submit(accessSecretInput)

    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
