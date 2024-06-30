import { NextRouter, useRouter } from 'next/router'

import { render, screen } from '@testing-library/react'
import { Integrations } from './Integrations'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('Integrations', () => {
  it('should render integrations', () => {
    mockUseRouter.mockReturnValue({
      query: { teamId: 'teamId' }
    } as unknown as NextRouter)
    render(<Integrations />)
    expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
    expect(
      screen.getByTestId('Growth Spaces-IntegrationsButton')
    ).toHaveAttribute('href', '/teams/teamId/integrations/new/growth-spaces')
  })
})
