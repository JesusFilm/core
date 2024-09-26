import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { JourneyProfileCreate } from '../../../__generated__/JourneyProfileCreate'

import { JOURNEY_PROFILE_CREATE } from './TermsAndConditions'

import { TermsAndConditions } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('TermsAndConditions', () => {
  const push = jest.fn()

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

  it('should create profile and redirect on next button click', async () => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)

    const result = jest.fn(() => ({
      data: {
        journeyProfileCreate: {
          __typename: 'JourneyProfile' as const,
          id: 'profile.id',
          userId: 'userId',
          acceptedTermsAt: 'date'
        }
      }
    }))

    const createJourneyProfileMock: MockedResponse<JourneyProfileCreate> = {
      request: {
        query: JOURNEY_PROFILE_CREATE
      },
      result
    }

    const { getByRole } = render(
      <MockedProvider mocks={[createJourneyProfileMock]}>
        <TermsAndConditions />
      </MockedProvider>
    )
    fireEvent.click(getByRole('checkbox'))
    fireEvent.click(getByRole('button', { name: 'Next' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith({
      pathname: '/teams/new',
      query: { redirect: null }
    })
  })

  it('should pass redirect query location to next page', async () => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: 'custom-location' }
    } as unknown as NextRouter)

    const result = jest.fn(() => ({
      data: {
        journeyProfileCreate: {
          __typename: 'JourneyProfile' as const,
          id: 'profile.id',
          userId: 'userId',
          acceptedTermsAt: 'date'
        }
      }
    }))

    const createJourneyProfileMock: MockedResponse<JourneyProfileCreate> = {
      request: {
        query: JOURNEY_PROFILE_CREATE
      },
      result
    }

    const { getByRole } = render(
      <MockedProvider mocks={[createJourneyProfileMock]}>
        <TermsAndConditions />
      </MockedProvider>
    )
    fireEvent.click(getByRole('checkbox'))
    fireEvent.click(getByRole('button', { name: 'Next' }))

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(push).toHaveBeenCalledWith({
      pathname: '/teams/new',
      query: { redirect: 'custom-location' }
    })
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
