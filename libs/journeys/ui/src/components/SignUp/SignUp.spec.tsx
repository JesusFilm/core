import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'
import { blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify } from '../../libs/plausibleHelpers'

import { SignUpFields } from './__generated__/SignUpFields'
import { SIGN_UP_SUBMISSION_EVENT_CREATE, SignUp } from './SignUp'

jest.mock('../../libs/action', () => {
  const originalModule = jest.requireActual('../../libs/action')
  return {
    __esModule: true,
    ...originalModule,
    handleAction: jest.fn()
  }
})

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: () => null
    }
  }
}))

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

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
    url: '#',
    customizable: null,
    parentStepId: null
  },
  children: []
}

const activeBlock: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  slug: null,
  children: []
}

const journey = {
  id: 'journey.id'
} as unknown as Journey

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
    const { getByRole, getAllByText } = render(
      <SnackbarProvider>
        <SignUpMock />
      </SnackbarProvider>
    )

    const submit = getByRole('button')

    fireEvent.click(submit)

    await waitFor(() => {
      const inlineErrors = getAllByText('Required')
      expect(inlineErrors[0]).toHaveProperty('id', 'name-helper-text')
      expect(inlineErrors[1]).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should validate when name is too short', async () => {
    const { getByLabelText, getByRole, getByText } = render(
      <SnackbarProvider>
        <SignUpMock />
      </SnackbarProvider>
    )

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
    const { getByLabelText, getByRole, getByText } = render(
      <SnackbarProvider>
        <SignUpMock />
      </SnackbarProvider>
    )

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
    const { getByLabelText, getByRole, getByText } = render(
      <SnackbarProvider>
        <SignUpMock />
      </SnackbarProvider>
    )

    const email = getByLabelText('Email')
    const submit = getByRole('button')

    fireEvent.change(email, { target: { value: '123abc@' } })
    fireEvent.click(submit)

    await waitFor(() => {
      const inlineError = getByText('Please enter a valid email address')
      expect(inlineError).toHaveProperty('id', 'email-helper-text')
    })
  })

  it('should redirect when form submit succeeds', async () => {
    const mocks = [
      {
        request: {
          query: SIGN_UP_SUBMISSION_EVENT_CREATE,
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
            signUpSubmissionEventCreate: {
              id: 'uuid'
            }
          }
        }
      }
    ]

    const { getByLabelText, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <SignUpMock mocks={mocks} />
        </SnackbarProvider>
      </MockedProvider>
    )

    const name = getByLabelText('Name')
    const email = getByLabelText('Email')
    const submit = getByRole('button')

    fireEvent.change(name, { target: { value: 'Anon' } })
    fireEvent.change(email, { target: { value: '123abc@gmail.com' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(handleAction).toHaveBeenCalledWith(
        {
          push: expect.any(Function)
        },
        {
          __typename: 'LinkAction',
          parentBlockId: 'signUp0.id',
          gtmEventName: 'signUp',
          url: '#',
          customizable: null,
          parentStepId: null
        },
        undefined
      )
    })
  })

  it('should be in a loading state when waiting for response', async () => {
    const { getByTestId, getByLabelText } = render(
      <ApolloLoadingProvider>
        <SnackbarProvider>
          <SignUp {...block} uuid={() => 'uuid'} />
        </SnackbarProvider>
      </ApolloLoadingProvider>
    )
    const name = getByLabelText('Name')
    const email = getByLabelText('Email')
    const submit = getByTestId('submit')

    fireEvent.change(name, { target: { value: 'Anon' } })
    fireEvent.change(email, { target: { value: '123abc@gmail.com' } })

    expect(submit).not.toHaveClass('MuiButton-loading')

    fireEvent.click(submit)

    await waitFor(() => expect(submit).toHaveClass('MuiButton-loading'))
  })

  it('should create submission event on click', async () => {
    blockHistoryVar([activeBlock])

    const result = jest.fn(() => ({
      data: {
        signUpSubmissionEventCreate: {
          id: 'uuid'
        }
      }
    }))

    const mocks = [
      {
        request: {
          query: SIGN_UP_SUBMISSION_EVENT_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'signUp0.id',
              stepId: 'step.id',
              name: 'Anon',
              email: '123abc@gmail.com'
            }
          }
        },
        result
      }
    ]

    const { getByLabelText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider>
          <SnackbarProvider>
            <SignUpMock mocks={mocks} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const name = getByLabelText('Name')
    const email = getByLabelText('Email')
    const submit = getByRole('button')

    fireEvent.change(name, { target: { value: 'Anon' } })
    fireEvent.change(email, { target: { value: '123abc@gmail.com' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('should add submission event to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])

    const mocks = [
      {
        request: {
          query: SIGN_UP_SUBMISSION_EVENT_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'signUp0.id',
              stepId: 'step.id',
              name: 'Anon',
              email: '123abc@gmail.com'
            }
          }
        },
        result: {
          data: {
            signUpSubmissionEventCreate: {
              id: 'uuid'
            }
          }
        }
      }
    ]

    const { getByLabelText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider>
          <SnackbarProvider>
            <SignUpMock mocks={mocks} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const name = getByLabelText('Name')
    const email = getByLabelText('Email')
    const submit = getByRole('button')

    fireEvent.change(name, { target: { value: 'Anon' } })
    fireEvent.change(email, { target: { value: '123abc@gmail.com' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'sign_up_submission',
        eventId: 'uuid',
        blockId: 'signUp0.id',
        stepName: 'Step {{number}}'
      })
    })
  })

  it('should add submission event to plausible', async () => {
    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const mocks = [
      {
        request: {
          query: SIGN_UP_SUBMISSION_EVENT_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'signUp0.id',
              stepId: 'step.id',
              name: 'Anon',
              email: '123abc@gmail.com'
            }
          }
        },
        result: {
          data: {
            signUpSubmissionEventCreate: {
              id: 'uuid'
            }
          }
        }
      }
    ]

    const { getByLabelText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <SnackbarProvider>
            <SignUpMock mocks={mocks} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const name = getByLabelText('Name')
    const email = getByLabelText('Email')
    const submit = getByRole('button')

    fireEvent.change(name, { target: { value: 'Anon' } })
    fireEvent.change(email, { target: { value: '123abc@gmail.com' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(mockPlausible).toHaveBeenCalledWith('signupSubmit', {
        u: expect.stringContaining(`/journey.id/step.id`),
        props: {
          id: 'uuid',
          blockId: 'signUp0.id',
          stepId: 'step.id',
          name: 'Anon',
          email: '123abc@gmail.com',
          key: keyify({
            stepId: 'step.id',
            event: 'signupSubmit',
            blockId: 'signUp0.id',
            target: block.action
          }),
          simpleKey: keyify({
            stepId: 'step.id',
            event: 'signupSubmit',
            blockId: 'signUp0.id'
          })
        }
      })
    })
  })

  it('should show error when submit fails', async () => {
    blockHistoryVar([activeBlock])

    const mocks = [
      {
        request: {
          query: SIGN_UP_SUBMISSION_EVENT_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'signUp0.id',
              stepId: 'step.id',
              name: 'Anon',
              email: '123abc@gmail.com'
            }
          }
        },
        error: new Error('Error')
      }
    ]

    const { getByRole, getByLabelText, getByText } = render(
      <SnackbarProvider>
        <SignUpMock mocks={mocks} />
      </SnackbarProvider>
    )
    const name = getByLabelText('Name')
    const email = getByLabelText('Email')
    const submit = getByRole('button')

    fireEvent.change(name, { target: { value: 'Anon' } })
    fireEvent.change(email, { target: { value: '123abc@gmail.com' } })
    fireEvent.click(submit)

    expect(await waitFor(() => getByText('Error'))).toBeInTheDocument()
  })

  it('should not allow selection in editor', () => {
    const { getAllByRole } = render(
      <SnackbarProvider>
        <SignUpMock />
      </SnackbarProvider>
    )

    const name = getAllByRole('textbox')[0]
    fireEvent.click(name)
    expect(name.matches(':focus')).not.toBeTruthy()

    const email = getAllByRole('textbox')[1]
    fireEvent.click(email)
    expect(email.matches(':focus')).not.toBeTruthy()
  })

  it('should show default submit text if submit label is empty', () => {
    const emptyLabelBLockMock = {
      ...block,
      submitLabel: ''
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <SignUp {...emptyLabelBLockMock} uuid={() => 'uuid'} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('submit')).toHaveTextContent('Submit')
  })

  it('should show default submit text if submit label is null', () => {
    const input = <h1>Submit</h1>
    const emptyLabelBLockMock = {
      ...block,
      editableSubmitLabel: input
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <SignUp {...emptyLabelBLockMock} uuid={() => 'uuid'} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('submit')).toHaveTextContent('Submit')
  })

  it('should show submit label text', () => {
    const emptyLabelBLockMock = {
      ...block,
      submitLabel: 'Hello'
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <SignUp {...emptyLabelBLockMock} uuid={() => 'uuid'} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('submit')).toHaveTextContent('Hello')
  })
})
