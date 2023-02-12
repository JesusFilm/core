import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { JOURNEY_PROFILE_CREATE } from './TermsAndConditions'
import { TermsAndConditions } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TermsAndConditions', () => {
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

  it('should link to EULA page', () => {
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

  it('should call mutation and redirect to journeys page on button click', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyProfileCreate: {
          id: 'journeyProfile.id',
          userId: 'user.id',
          acceptedTermsAt: '1970-01-01T00:00:00.000Z'
        }
      }
    }))
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_PROFILE_CREATE
            },
            result
          }
        ]}
      >
        <TermsAndConditions />
      </MockedProvider>
    )

    fireEvent.click(getByRole('checkbox'))
    const nextButton = getByRole('button', { name: 'Next' })
    fireEvent.click(nextButton)

    await waitFor(() => expect(result).toHaveBeenCalled())
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
  })
})
