import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { OnboardingLandingDrawer } from './OnboardingLandingDrawer'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('OnboardingLandingDrawer', () => {
  const push = jest.fn()

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null, newAccount: null }
    } as unknown as NextRouter)
  })

  it('should render landing image with landing description', () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <OnboardingLandingDrawer
          templateId="template"
          newAccountQuery={false}
        />
      </MockedProvider>
    )

    expect(getAllByRole('img')[0].getAttribute('alt')).toBe(
      'Landing Illustration'
    )
    expect(getAllByRole('img')[0].getAttribute('src')).toBe(
      'landing-illustration.png'
    )
    expect(getAllByRole('img')[1].getAttribute('alt')).toBe(
      'Landing Description'
    )
    expect(getAllByRole('img')[1].getAttribute('src')).toBe(
      'landing-description.png'
    )
  })

  it('should render landing image with the stepper', async () => {
    mockUseRouter.mockReturnValue({
      push,
      query: { newAccount: 'true' }
    } as unknown as NextRouter)

    const { getByRole, getAllByRole } = render(
      <MockedProvider>
        <OnboardingLandingDrawer templateId="template" newAccountQuery />
      </MockedProvider>
    )

    expect(getAllByRole('img')[0].getAttribute('alt')).toBe(
      'Landing Illustration'
    )
    expect(getAllByRole('img')[0].getAttribute('src')).toBe(
      'landing-illustration.png'
    )
    expect(
      getByRole('heading', { name: `Let's get you on the journey` })
    ).toBeInTheDocument()
    expect(
      getByRole('heading', { name: 'Create an account' })
    ).toBeInTheDocument()
  })
})
