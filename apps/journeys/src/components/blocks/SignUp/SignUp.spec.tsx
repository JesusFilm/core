import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../__generated__/GetJourney'
import { SignUp, SIGN_UP_RESPONSE_CREATE } from './SignUp'
import { ReactElement } from 'react'
import { handleAction } from '../../../libs/action'

jest.mock('../../../libs/action', () => {
  const originalModule = jest.requireActual('../../../libs/action')
  return {
    __esModule: true,
    ...originalModule,
    handleAction: jest.fn()
  }
})

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: () => null
    }
  }
}))

const props: TreeBlock<SignUpBlock> = {
  __typename: 'SignUpBlock',
  id: 'SignUp1',
  parentBlockId: '0',
  submitIcon: null,
  submitLabel: null,
  action: {
    __typename: 'LinkAction',
    gtmEventName: 'signUp',
    url: '#'
  },
  children: []
}

interface SignUpMockProps {
  mocks?: Array<MockedResponse<Record<string, unknown>>>
}

const SignUpMock = ({ mocks = [] }: SignUpMockProps): ReactElement => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <SignUp {...props} uuid={() => 'uuid'} />
  </MockedProvider>
)

describe('SignUp', () => {
  it('should validate when fields are empty', async () => {
    const { getByRole, getAllByText } = render(<SignUpMock />)

    const submit = getByRole('button')

    fireEvent.click(submit)

    await waitFor(() => {
      const inlineErrors = getAllByText('Required')
      expect(inlineErrors[0]).toHaveProperty('id', 'name-helper-text')
      expect(inlineErrors[1]).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should validate when name is too short', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignUpMock />)

    const name = getByLabelText('Name')
    const submit = getByRole('button')

    fireEvent.change(name, { target: { value: 'S' } })
    fireEvent.click(submit)

    await waitFor(() => {
      const inlineError = getByText('Name must be 2 characters or more')
      expect(inlineError).toHaveProperty('id', 'name-helper-text')
    })
  })

  it('should validate when name is too long', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignUpMock />)

    const name = getByLabelText('Name')
    const submit = getByRole('button')

    fireEvent.change(name, {
      target: { value: '123456789012345678901234567890123456789012345678901' }
    })
    fireEvent.click(submit)

    await waitFor(() => {
      const inlineError = getByText('Name must be 50 characters or less')
      expect(inlineError).toHaveProperty('id', 'name-helper-text')
    })
  })

  it('should validate when email is invalid', async () => {
    const { getByLabelText, getByRole, getByText } = render(<SignUpMock />)

    const email = getByLabelText('Email')
    const submit = getByRole('button')

    fireEvent.change(email, { target: { value: '123abc@' } })
    fireEvent.click(submit)

    await waitFor(() => {
      const inlineError = getByText('Please enter a valid email address')
      expect(inlineError).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should redirect when form submit suceeds', async () => {
    const mocks = [
      {
        request: {
          query: SIGN_UP_RESPONSE_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'SignUp1',
              name: 'Anon',
              email: '123abc@gmail.com'
            }
          }
        },
        result: {
          data: {
            signUpResponseCreate: {
              id: 'uuid',
              blockId: 'SignUp1',
              name: 'Anon',
              email: '123abc@gmail.com'
            }
          }
        }
      }
    ]

    const { getByLabelText, getByRole } = render(<SignUpMock mocks={mocks} />)

    const name = getByLabelText('Name')
    const email = getByLabelText('Email')
    const submit = getByRole('button')

    fireEvent.change(name, { target: { value: 'Anon' } })
    fireEvent.change(email, { target: { value: '123abc@gmail.com' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(handleAction).toBeCalledWith(
        {
          push: expect.any(Function)
        },
        {
          __typename: 'LinkAction',
          gtmEventName: 'signUp',
          url: '#'
        }
      )
    })
  })

  // it('should show error when submit fails', async () => {
  // })
})
