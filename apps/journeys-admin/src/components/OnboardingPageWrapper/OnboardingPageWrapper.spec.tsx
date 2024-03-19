import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { OnboardingPageWrapper } from './OnboardingPageWrapper'

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

  it('should open language switcher dialog', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <OnboardingPageWrapper emailSubject="a question about onboarding">
          <div>Child</div>
        </OnboardingPageWrapper>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Language' }))
    await waitFor(() =>
      expect(
        getByRole('dialog', { name: 'Change Language' })
      ).toBeInTheDocument()
    )
  })
})
