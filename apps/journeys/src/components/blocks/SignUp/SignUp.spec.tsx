import { render, screen, act, fireEvent } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'

import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../__generated__/GetJourney'

import { SignUp, SIGN_UP_RESPONSE_CREATE } from './SignUp'
import { ReactElement } from 'react'
import { handleAction } from '../../../libs/action'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: () => 'uuid'
}))

jest.mock('../../../libs/action', () => {
  const originalModule = jest.requireActual('../../../libs/action')
  return {
    __esModule: true,
    ...originalModule,
    handleAction: jest.fn()
  }
})

const props: TreeBlock<SignUpBlock> = {
  __typename: 'SignUpBlock',
  id: 'SignUp1',
  parentBlockId: '0',
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
    <SignUp {...props} />
  </MockedProvider>
)

describe('SignUp', () => {
  it('should validate when fields are empty', async () => {
    render(<SignUpMock />)

    const submit = screen.getByRole('button')

    await act(async () => {
      fireEvent.click(submit)
    })

    const inlineErrors = screen.getAllByText('Required')

    expect(inlineErrors[0]).toHaveProperty('id', 'name-helper-text')
    expect(inlineErrors[1]).toHaveProperty('id', 'email-helper-text')
  })

  it('should validate when name is too short', async () => {
    render(<SignUpMock />)

    const name = screen.getByLabelText('Name')
    const submit = screen.getByRole('button')

    await act(async () => {
      fireEvent.change(name, { target: { value: 'S' } })
    })
    await act(async () => {
      fireEvent.click(submit)
    })

    const inlineError = screen.findByText('Name must be 2 characters or more')

    expect(await inlineError).toHaveProperty('id', 'name-helper-text')
  })

  it('should validate when name is too long', async () => {
    render(<SignUpMock />)

    const name = screen.getByLabelText('Name')
    const submit = screen.getByRole('button')

    await act(async () => {
      fireEvent.change(name, {
        target: { value: '123456789012345678901234567890123456789012345678901' }
      })
    })
    await act(async () => {
      fireEvent.click(submit)
    })

    const inlineError = screen.findByText('Name must be 50 characters or less')

    expect(await inlineError).toHaveProperty('id', 'name-helper-text')
  })

  it('should validate when email is invalid', async () => {
    render(<SignUpMock />)

    const email = screen.getByLabelText('Email')
    const submit = screen.getByRole('button')

    await act(async () => {
      fireEvent.change(email, { target: { value: '123abc@' } })
    })
    await act(async () => {
      fireEvent.click(submit)
    })

    const inlineError = screen.findByText('Please enter a valid email address')

    expect(await inlineError).toHaveProperty('id', 'email-helper-text')
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

    render(<SignUpMock mocks={mocks} />)

    const name = screen.getByLabelText('Name')
    const email = screen.getByLabelText('Email')
    const submit = screen.getByRole('button')

    await act(async () => {
      fireEvent.change(name, { target: { value: 'Anon' } })
      fireEvent.change(email, { target: { value: '123abc@gmail.com' } })
    })
    await act(async () => {
      fireEvent.click(submit)
    })

    expect(handleAction).toBeCalledWith({
      __typename: 'LinkAction',
      gtmEventName: 'signUp',
      url: '#'
    })
  })

  // it('should show error when submit fails', async () => {
  // })
})
