import { render, screen } from '@testing-library/react'
import * as Apollo from '@apollo/client'

import { onboardingJourneys } from '../data'

import { OnboardingList } from './OnboardingList'

jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client')
  return {
    ...actual,
    useSuspenseQuery: jest.fn()
  }
})

const mockUseSuspenseQuery = Apollo.useSuspenseQuery as jest.Mock

beforeEach(() => {
  mockUseSuspenseQuery.mockReturnValue({ data: { onboardingJourneys } })
})

describe('OnboardingList', () => {
  it('should display onboarding templates', async () => {
    render(<OnboardingList />)

    expect(screen.getByText('template 1 title')).toBeInTheDocument()
    expect(screen.getByText('template 2 title')).toBeInTheDocument()
    expect(screen.getByText('template 3 title')).toBeInTheDocument()
    expect(screen.getByText('template 4 title')).toBeInTheDocument()
    expect(screen.getByText('template 5 title')).toBeInTheDocument()
  })

  it('should render link to template details page', async () => {
    render(<OnboardingList />)

    expect(screen.getByText('template 1 title')).toBeInTheDocument()
    const firstItem = screen.getAllByTestId('JourneysAdminMediaListItem')[0]
    expect(firstItem).toHaveAttribute(
      'href',
      '/templates/014c7add-288b-4f84-ac85-ccefef7a07d3'
    )
  })
})
