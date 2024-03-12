import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { OnboardingPageWrapper } from './OnboardingPageWrapper'

describe('OnboardingPageWrapper', () => {
  it('should render OnboardingPageWrapper', () => {
    const { getByRole, getByText } = render(
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
    expect(getByTestId('OnboardingDrawer')).toBeInTheDocument()
  })
})
