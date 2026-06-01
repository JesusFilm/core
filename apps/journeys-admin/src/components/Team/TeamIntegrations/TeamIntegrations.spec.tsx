import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { getIntegrationMock } from '../../../libs/useIntegrationQuery/useIntegrationQuery.mock'

import { TeamIntegrations } from './TeamIntegrations'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('TeamIntegrations', () => {
  it('should render TeamIntegrations', async () => {
    mockUseRouter.mockReturnValue({
      query: { teamId: 'team.id' }
    } as unknown as NextRouter)
    render(
      <MockedProvider mocks={[getIntegrationMock]}>
        <TeamIntegrations />
      </MockedProvider>
    )

    expect(screen.getByText('Add Integration')).toBeInTheDocument()
    expect(screen.getByTestId('Add-IntegrationsButton')).toHaveAttribute(
      'href',
      '/teams/team.id/integrations/new'
    )

    await waitFor(() => {
      expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
      expect(
        screen.getByTestId('growthSpaces-IntegrationsButton')
      ).toHaveAttribute('href', '/teams/team.id/integrations/integration.id')
    })
  })
})
