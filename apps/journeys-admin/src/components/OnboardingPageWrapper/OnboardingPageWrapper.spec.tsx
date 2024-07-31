import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { OnboardingPageWrapper } from './OnboardingPageWrapper'

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: jest.fn(() => ({
    id: 'userId',
    name: 'userName',
    email: 'user@example.com'
  }))
}))

describe('OnboardingPageWrapper', () => {
  it('should render OnboardingPageWrapper', () => {
    const { getByRole, getByText, getByTestId } = render(
      <MockedProvider>
        <OnboardingPageWrapper
          title="Custom Title"
          emailSubject="a question about onboarding"
        >
          <div>Child</div>
        </OnboardingPageWrapper>
      </MockedProvider>
    )
    expect(getByRole('heading', { name: 'Custom Title' })).toBeInTheDocument()
    expect(getByText('Child')).toBeInTheDocument()
    expect(getByTestId('HelpScoutBeaconIconButton')).toBeInTheDocument()
  })

  it('should show onboarding utilities', async () => {
    const emailSubject = 'a question about onboarding'
    const { getByRole, getAllByRole } = render(
      <MockedProvider>
        <OnboardingPageWrapper emailSubject={emailSubject}>
          <div>Child</div>
        </OnboardingPageWrapper>
      </MockedProvider>
    )

    expect(
      getAllByRole('link', { name: 'Feedback & Support' })[0]
    ).toHaveAttribute(
      'href',
      `mailto:support@nextstep.is?subject=${emailSubject}`
    )
    fireEvent.click(getAllByRole('button', { name: 'Language' })[0])
    await waitFor(() =>
      expect(
        getByRole('dialog', { name: 'Change Language' })
      ).toBeInTheDocument()
    )
  })

  it('should show OnboardingDrawer', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <OnboardingPageWrapper
          title="Custom Title"
          emailSubject="a question about onboarding"
        >
          <div>Child</div>
        </OnboardingPageWrapper>
      </MockedProvider>
    )
    expect(getByTestId('JourneysAdminOnboardingDrawer')).toBeInTheDocument()
  })
})
