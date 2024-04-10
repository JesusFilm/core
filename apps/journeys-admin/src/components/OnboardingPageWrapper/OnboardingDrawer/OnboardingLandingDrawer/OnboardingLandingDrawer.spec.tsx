import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import { OnboardingLandingDrawer } from './OnboardingLandingDrawer'

describe('OnboardingLandingDrawer', () => {
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
