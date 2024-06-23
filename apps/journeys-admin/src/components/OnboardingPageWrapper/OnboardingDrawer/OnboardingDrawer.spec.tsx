import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { OnboardingDrawer } from './OnboardingDrawer'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('OnboardingDrawer', () => {
  const push = jest.fn()

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
    expect(getAllByText('Journey')[0]).toBeInTheDocument()
    expect(
      getByRole('heading', { name: `Let's get you on the journey` })
    ).toBeInTheDocument()
    expect(
      getByRole('heading', { name: 'Create an account' })
    ).toBeInTheDocument()
  })
})
