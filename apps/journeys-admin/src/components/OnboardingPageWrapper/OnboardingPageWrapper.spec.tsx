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
    const { getByRole } = render(
      <OnboardingPageWrapper emailSubject="a question about onboarding">
        <div>Child</div>
      </OnboardingPageWrapper>
    )

    expect(getByRole('img', { name: 'Next Steps' })).toBeInTheDocument()
  })

  it('should render children', () => {
    const { getByText } = render(
      <OnboardingPageWrapper emailSubject="a question about onboarding">
        <div>Child</div>
      </OnboardingPageWrapper>
    )
    expect(getByText('Child')).toBeInTheDocument()
  })

  it('should show support link', () => {
    const emailSubject = 'a question about onboarding'
    const { getByRole } = render(
      <OnboardingPageWrapper emailSubject={emailSubject}>
        <div>Child</div>
      </OnboardingPageWrapper>
    )

    expect(getByRole('link', { name: 'Feedback & Support' })).toHaveAttribute(
      'href',
      `mailto:support@nextstep.is?subject=${emailSubject}`
    )
  })
})
