import { render } from '@testing-library/react'

import { OnboardingStepper } from './OnboardingStepper'
import { NextRouter, useRouter } from 'next/router'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('OnboardingStepper', () => {
  it('should render correct steps', () => {
    mockedUseRouter.mockReturnValue({
      query: {
        pathname: '/users/sign-in'
      }
    } as unknown as NextRouter)

    const { getByRole } = render(<OnboardingStepper />)

    expect(
      getByRole('heading', { name: 'Create an account' })
    ).toBeInTheDocument()
    expect(
      getByRole('heading', { name: 'Terms and Conditions' })
    ).toBeInTheDocument()
    expect(getByRole('heading', { name: 'User Insights' })).toBeInTheDocument()
    expect(getByRole('heading', { name: 'Create a Team' })).toBeInTheDocument()
    expect(getByRole('heading', { name: `Journey Begins` })).toBeInTheDocument()
  })

  it('should indicate the active step based on pathname', () => {
    mockedUseRouter.mockReturnValue({
      query: {
        pathname: '/users/sign-in'
      }
    } as unknown as NextRouter)

    const { getByTestId } = render(<OnboardingStepper />)

    expect(getByTestId('Create an account')).toBeInTheDocument()
  })

  it('should render mobile stepper', () => {
    const { getByRole } = render(<OnboardingStepper />)

    expect(getByRole('progressbar')).toBeInTheDocument()
  })
})
