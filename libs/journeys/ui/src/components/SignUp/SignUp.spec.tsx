import { ReactElement } from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { TreeBlock, handleAction } from '../..'
import { SignUp, SIGN_UP_RESPONSE_CREATE } from './SignUp'
import { SignUpFields } from './__generated__/SignUpFields'

jest.mock('../../libs/action', () => {
  const originalModule = jest.requireActual('../../libs/action')
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

const block: TreeBlock<SignUpFields> = {
  __typename: 'SignUpBlock',
  id: 'signUp0.id',
  parentBlockId: '0',
  parentOrder: 0,
  submitIconId: null,
  submitLabel: null,
  action: {
    __typename: 'LinkAction',
    parentBlockId: 'signUp0.id',
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
    <SignUp {...block} uuid={() => 'uuid'} />
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
              blockId: 'signUp0.id',
              name: 'Anon',
              email: '123abc@gmail.com'
            }
          }
        },
        result: {
          data: {
            signUpResponseCreate: {
              id: 'uuid',
              blockId: 'signUp0.id',
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
          parentBlockId: 'signUp0.id',
          gtmEventName: 'signUp',
          url: '#'
        }
      )
    })
  })

  // it('should show error when submit fails', async () => {
  // })

  it('should be in a loading state when waiting for response', async () => {
    const { getByRole, getByLabelText } = render(
      <ApolloLoadingProvider>
        <SignUp {...block} uuid={() => 'uuid'} />
      </ApolloLoadingProvider>
    )
    const name = getByLabelText('Name')
    const email = getByLabelText('Email')
    const submit = getByRole('button', { name: 'Submit' })

    fireEvent.change(name, { target: { value: 'Anon' } })
    fireEvent.change(email, { target: { value: '123abc@gmail.com' } })

    expect(submit).not.toHaveClass('MuiLoadingButton-loading')

    fireEvent.click(submit)

    await waitFor(() => expect(submit).toHaveClass('MuiLoadingButton-loading'))
    expect(submit).toBeDisabled()
  })
})
