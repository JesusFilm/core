import { render } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { OnboardingStepper } from './OnboardingStepper'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('OnboardingStepper', () => {
  it('should render correct steps', () => {
    mockedUseRouter.mockReturnValue({
      pathname: '/users/sign-in'
    } as unknown as NextRouter)

    const { getByRole, queryByRole } = render(
      <OnboardingStepper variant="desktop" />
    )

    expect(
      getByRole('heading', { name: 'Create an account' })
    ).toBeInTheDocument()
    expect(
      getByRole('heading', { name: 'Terms and Conditions' })
    ).toBeInTheDocument()
    expect(
      queryByRole('heading', { name: 'Express Setup' })
    ).not.toBeInTheDocument()
  })

  it('should render correct steps for quick', () => {
    mockedUseRouter.mockReturnValue({
      pathname: '/users/sign-in',
      query: {
        redirect: 'http://localhost/templates/journeyId/quick'
      }
    } as unknown as NextRouter)

    const { getByRole, queryByRole } = render(
      <OnboardingStepper variant="desktop" />
    )

    expect(
      getByRole('heading', { name: 'Create an account' })
    ).toBeInTheDocument()
    expect(
      getByRole('heading', { name: 'Terms and Conditions' })
    ).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Express Setup' })).toBeInTheDocument()
    expect(
      queryByRole('heading', { name: 'User Insights' })
    ).not.toBeInTheDocument()
    expect(
      queryByRole('heading', { name: 'Create Your Workspace' })
    ).not.toBeInTheDocument()
  })

  it('should indicate the active step based on pathname', () => {
    mockedUseRouter.mockReturnValue({
      query: {
        pathname: '/users/sign-in'
      }
    } as unknown as NextRouter)

    const { getByTestId } = render(<OnboardingStepper variant="desktop" />)

    expect(getByTestId('Create an account')).toBeInTheDocument()
  })

  it('should render mobile stepper', () => {
    mockedUseRouter.mockReturnValue({
      query: {
        pathname: '/users/sign-in'
      }
    } as unknown as NextRouter)
    const { getByRole } = render(<OnboardingStepper variant="mobile" />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })
})
