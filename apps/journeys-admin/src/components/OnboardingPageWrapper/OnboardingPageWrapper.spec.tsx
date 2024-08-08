import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { OnboardingPageWrapper } from './OnboardingPageWrapper'

describe('OnboardingPageWrapper', () => {
  it('should render OnboardingPageWrapper', () => {
    render(
      <MockedProvider>
        <OnboardingPageWrapper
          title="Custom Title"
          emailSubject="a question about onboarding"
        >
          <div>Child</div>
        </OnboardingPageWrapper>
      </MockedProvider>
    )
    expect(
      screen.getByRole('heading', { name: 'Custom Title' })
    ).toBeInTheDocument()
    expect(screen.getByText('Child')).toBeInTheDocument()
    expect(screen.getByTestId('HelpScoutBeaconIconButton')).toBeInTheDocument()
  })

  it('should show onboarding utilities', async () => {
    const emailSubject = 'a question about onboarding'
    render(
      <MockedProvider>
        <OnboardingPageWrapper emailSubject={emailSubject}>
          <div>Child</div>
        </OnboardingPageWrapper>
      </MockedProvider>
    )

    expect(
      screen.getAllByRole('link', { name: 'Feedback & Support' })[0]
    ).toHaveAttribute(
      'href',
      `mailto:support@nextstep.is?subject=${emailSubject}`
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'Language' })[0])
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: 'Change Language' })
      ).toBeInTheDocument()
    )
  })

  it('should show OnboardingDrawer', () => {
    render(
      <MockedProvider>
        <OnboardingPageWrapper
          title="Custom Title"
          emailSubject="a question about onboarding"
        >
          <div>Child</div>
        </OnboardingPageWrapper>
      </MockedProvider>
    )
    expect(
      screen.getByTestId('JourneysAdminOnboardingDrawer')
    ).toBeInTheDocument()
  })
})
