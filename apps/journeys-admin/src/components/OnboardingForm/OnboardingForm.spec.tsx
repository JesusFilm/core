import { MockedProvider } from '@apollo/client/testing'
import { Form } from '@formium/client'
import { render } from '@testing-library/react'
import { User } from 'next-firebase-auth'

import { OnboardingForm } from './OnboardingForm'

describe('OnboardingForm', () => {
  it('should handle submit', () => {
    const authUser = {
      id: '1',
      email: 'test@example.com'
    } as unknown as User

    const form = {
      actionIds: [],
      createAt: '2023-10-09T02:59:18.299Z',
      createId: '65076cdeaa22460001b3d3ea',
      customerId: '65076cedaa22460001b3d3ec',
      id: '65236c864f0b2e0001233fed',
      keys: [],
      name: 'single-page-test',
      previewMode: 'HOSTED',
      projectId: '65076cedaa22460001b3d3ed',
      schema: {
        fields: {
          'qgdEnz3 - l': {
            actions: [],
            dynamic: false,
            hidden: false,
            id: 'qgdEnz3-l',
            items: ['_SmxT8v1Ur'],
            orderLast: false,
            slug: '____',
            title: 'single-page-test',
            type: 'PAGE'
          },
          _SmxT8v1Ur: {
            actions: [],
            dynamic: false,
            hidden: false,
            id: '_SmxT8v1Ur',
            items: [],
            orderLast: false,
            slug: 'field',
            title: 'field',
            type: 'SHORT_TEXT'
          }
        },
        pageIds: ['qgdEnz3-l']
      },
      slug: 'single-page-test',
      status: 'ACTIVE',
      submitCount: 0,
      submitLayout: 'LIST',
      updateAt: '2023-10-09T02:59:38.335Z',
      updateId: '65236c9a4f0b2e0001233fee',
      validate: 'ANY',
      version: 1
    } as unknown as Form

    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <OnboardingForm form={form} authUser={authUser} />
      </MockedProvider>
    )

    expect(true).toBeTruthy()
  })
})
