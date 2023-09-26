import { render } from '@testing-library/react'

import { OnboardingPageWrapper } from './OnboardingPageWrapper'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('OnboardingPageWrapper', () => {
  it('should show logo', () => {
    const { getByRole } = render(<OnboardingPageWrapper />)

    expect(getByRole('img', { name: 'Next Steps' })).toBeInTheDocument()
  })

  it('should render children', () => {
    const { getByText } = render(
      <OnboardingPageWrapper>
        <div>Child</div>
      </OnboardingPageWrapper>
    )
    expect(getByText('Child')).toBeInTheDocument()
  })

  it('should show support link', () => {
    const { getByRole } = render(<OnboardingPageWrapper />)

    expect(getByRole('link', { name: 'Feedback & Support' })).toHaveAttribute(
      'href',
      'mailto:support@nextstep.is?subject=A question about the terms and conditions form'
    )
  })
})
