import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TermsAndConditions } from './TermsAndConditions'

describe('TermsAndConditions', () => {
  it('should enable next button when box is checked', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <TermsAndConditions />
      </MockedProvider>
    )
    expect(getByRole('link', { name: 'Next' })).toHaveAttribute('aria-disabled')
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() =>
      expect(getByRole('link', { name: 'Next' })).not.toHaveAttribute(
        'aria-disabled'
      )
    )
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() =>
      expect(getByRole('link', { name: 'Next' })).toHaveAttribute(
        'aria-disabled'
      )
    )
  })
})
