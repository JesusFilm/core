import { MockedProvider } from '@apollo/client/testing'
import { FormiumClient, createClient } from '@formium/client'
import {
  Form,
  FormElementType,
  FormStatus,
  FormSubmitLayout,
  FormValidate
} from '@formium/types'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { User } from 'next-firebase-auth'

import {
  JOURNEY_PROFILE_ONBOARDING_FORM_COMPLETE,
  OnboardingForm
} from './OnboardingForm'

jest.mock('@formium/client', () => ({
  __esModule: true,
  createClient: jest.fn()
}))
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('OnboardingForm', () => {
  const push = jest.fn()

  beforeEach(() => {
    const mockFormiumClient = {
      submitForm: jest.fn()
    } as unknown as FormiumClient
    mockCreateClient.mockReturnValueOnce(mockFormiumClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const form: Form = {
    actionIds: [],
    createAt: '2023-10-09T02:59:18.299Z',
    createId: '65076cdeaa22460001b3d3ea',
    customerId: '65076cedaa22460001b3d3ec',
    id: '65236c864f0b2e0001233fed',
    keys: [],
    name: 'single-page-test',
    previewUrl: 'https://previewurl.com',
    projectId: '65076cedaa22460001b3d3ed',
    schema: {
      fields: {
        'qgdEnz3-l': {
          actions: [],
          dynamic: false,
          hidden: false,
          id: 'qgdEnz3-l',
          items: ['_SmxT8v1Ur'],
          slug: '____',
          title: 'single-page-test',
          type: FormElementType.PAGE
        },
        _SmxT8v1Ur: {
          actions: [],
          dynamic: false,
          hidden: false,
          id: '_SmxT8v1Ur',
          items: [],
          slug: 'field',
          title: 'field',
          type: FormElementType.SHORT_TEXT
        }
      },
      pageIds: ['qgdEnz3-l']
    },
    status: FormStatus.ACTIVE,
    slug: 'single-page-test',
    submitCount: 0,
    submitLayout: FormSubmitLayout.LIST,
    updateAt: '2023-10-09T02:59:38.335Z',
    updateId: '65236c9a4f0b2e0001233fee',
    validate: FormValidate.ANY
  }

  const user = {
    id: '1',
    email: 'test@example.com'
  } as unknown as User

  it('should handle submit', async () => {
    mockUseRouter.mockReturnValue({
      push,
      query: { redirect: null }
    } as unknown as NextRouter)

    const result = jest.fn(() => ({
      data: {
        journeyProfileOnboardingFormComplete: {
          id: 'id'
        }
      }
    }))

    const formCompleteMock = {
      request: {
        query: JOURNEY_PROFILE_ONBOARDING_FORM_COMPLETE
      },
      result
    }

    const { getByRole } = render(
      <MockedProvider mocks={[formCompleteMock]}>
        <OnboardingForm form={form} user={user} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Next' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
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
        journeyProfileOnboardingFormComplete: {
          id: 'id'
        }
      }
    }))

    const formCompleteMock = {
      request: {
        query: JOURNEY_PROFILE_ONBOARDING_FORM_COMPLETE
      },
      result
    }

    const { getByRole } = render(
      <MockedProvider mocks={[formCompleteMock]}>
        <OnboardingForm form={form} user={user} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Next' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    expect(push).toHaveBeenCalledWith({
      pathname: '/teams/new',
      query: { redirect: 'custom-location' }
    })
  })
})
