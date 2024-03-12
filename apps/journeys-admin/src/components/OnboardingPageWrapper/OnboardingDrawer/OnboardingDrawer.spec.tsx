import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { OnboardingDrawer } from './OnboardingDrawer'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('OnboardingDrawer', () => {
  const push = jest.fn()

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)
  })

  it('should render OnboardingDrawer', () => {
    const { getByRole } = render(
      <MockedProvider>
        <OnboardingDrawer />
      </MockedProvider>
    )

    expect(getByRole('img').getAttribute('alt')).toBe('Next Steps')
    expect(getByRole('img').getAttribute('src')).toBe('logo.svg')
  })

  it('should render the template card and the stepper', async () => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: '/templates/template-id/?newAccount=true' }
    } as unknown as NextRouter)

    const { getByRole, getAllByText } = render(
      <MockedProvider>
        <OnboardingDrawer />
      </MockedProvider>
    )

    expect(getByRole('img').getAttribute('alt')).toBe('Next Steps')
    expect(getByRole('img').getAttribute('src')).toBe('logo.svg')
    expect(getAllByText('Journey Template')[0]).toBeInTheDocument()
    expect(
      getByRole('heading', { name: `Let's get you on the journey` })
    ).toBeInTheDocument()
  })
})
