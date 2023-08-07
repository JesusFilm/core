import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TermsAndConditions } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

describe('TermsAndConditions', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should enable next button when box is checked', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <TermsAndConditions />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Next' })).toBeDisabled()
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Next' })).not.toBeDisabled()
    )
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() =>
      expect(getByRole('button', { name: 'Next' })).toBeDisabled()
    )
  })

  it('should link to terms of use page', () => {
    const { getByRole } = render(
      <MockedProvider>
        <TermsAndConditions />
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      'https://your.nextstep.is/terms-of-use'
    )
  })

  it('should link to EULA page', () => {
    const { getByRole } = render(
      <MockedProvider>
        <TermsAndConditions />
      </MockedProvider>
    )
    expect(
      getByRole('link', { name: 'End User License Agreement' })
    ).toHaveAttribute(
      'href',
      'https://your.nextstep.is/end-user-license-agreement'
    )
  })

  it('should link to community guidelines page', () => {
    const { getByRole } = render(
      <MockedProvider>
        <TermsAndConditions />
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Community Guidelines' })).toHaveAttribute(
      'href',
      'https://your.nextstep.is/community-guidelines'
    )
  })
})
