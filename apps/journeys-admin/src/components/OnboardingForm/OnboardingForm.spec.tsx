import { MockedProvider } from '@apollo/client/testing'
import {
  Form,
  FormElementType,
  FormStatus,
  FormSubmitLayout,
  FormValidate
} from '@formium/types'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'

import {
  JOURNEY_PROFILE_ONBOARDING_FORM_COMPLETE,
  OnboardingForm
} from './OnboardingForm'

jest.mock('@core/shared/ui/formiumClient', () => ({
  __esModule: true,
  formiumClient: {
    submitForm: jest.fn()
  }
}))

describe('OnboardingForm', () => {
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

  const authUser = {
    id: '1',
    email: 'test@example.com'
  } as unknown as User

  it('should handle submit', async () => {
    const result = jest.fn(() => ({
      data: {
        journeyProfileOnboardingFormComplete: {
          id: 'id'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_PROFILE_ONBOARDING_FORM_COMPLETE
            },
            result
          }
        ]}
      >
        <OnboardingForm form={form} authUser={authUser} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })
})
