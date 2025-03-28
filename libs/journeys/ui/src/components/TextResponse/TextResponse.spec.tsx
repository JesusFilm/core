import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { TextResponseType } from '../../../__generated__/globalTypes'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import type { TreeBlock } from '../../libs/block'
import { blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../libs/JourneyProvider'

import { TextResponseFields } from './__generated__/TextResponseFields'
import {
  TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
  TextResponse
} from './TextResponse'

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

const block: TreeBlock<TextResponseFields> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  placeholder: null,
  hint: null,
  minRows: null,
  required: null,
  integrationId: null,
  type: null,
  routeId: null,
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

const submissionSuccess = {
  request: {
    query: TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId: 'textResponse0.id',
        stepId: 'step.id',
        label: 'Step {{number}}',
        value: 'My response'
      }
    }
  },
  result: {
    data: {
      textResponseSubmissionEventCreate: {
        id: 'uuid'
      }
    }
  }
}

interface TextResponseMockProps {
  mocks?: Array<MockedResponse<Record<string, unknown>>>
}

const TextResponseMock = ({
  mocks = []
}: TextResponseMockProps): ReactElement => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <JourneyProvider>
      <SnackbarProvider>
        <TextResponse {...block} uuid={() => 'uuid'} />
      </SnackbarProvider>
    </JourneyProvider>
  </MockedProvider>
)

describe('TextResponse', () => {
  it('should have 1000 character max length', async () => {
    render(<TextResponseMock mocks={[submissionSuccess]} />)

    const responseField = screen.getByRole('textbox')

    await waitFor(() => {
      expect(responseField).toHaveAttribute('maxlength', '1000')
    })
  })

  it('should show default text if label is empty', async () => {
    const emptyLabelBlock: TreeBlock<TextResponseFields> = {
      __typename: 'TextResponseBlock',
      id: 'textResponse0.id',
      parentBlockId: '0',
      parentOrder: 0,
      label: '',
      placeholder: null,
      hint: null,
      minRows: null,
      required: null,
      integrationId: null,
      type: null,
      routeId: null,
      children: []
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <JourneyProvider>
          <SnackbarProvider>
            <TextResponse {...emptyLabelBlock} uuid={() => 'uuid'} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('should be in a loading state when waiting for response', async () => {
    render(
      <ApolloLoadingProvider>
        <TextResponseMock mocks={[submissionSuccess]} />
      </ApolloLoadingProvider>
    )
    const textField = screen.getByRole('textbox')

    fireEvent.change(textField, { target: { value: 'My response' } })

    expect(textField).not.toBeDisabled()

    fireEvent.blur(textField)

    await waitFor(() => expect(textField).toBeDisabled())
  })

  it('should not create submission event if input is empty', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseSubmissionEventCreate: {
          id: 'uuid'
        }
      }
    }))
    render(<TextResponseMock mocks={[{ ...submissionSuccess, result }]} />)

    const textField = screen.getByRole('textbox')

    fireEvent.change(textField, { target: { value: ' ' } })
    fireEvent.blur(textField)

    await waitFor(() => {
      expect(result).not.toHaveBeenCalled()
    })
  })

  it('should create submission event on blur', async () => {
    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])

    const result = jest.fn(() => ({
      data: {
        textResponseSubmissionEventCreate: {
          id: 'uuid'
        }
      }
    }))

    render(<TextResponseMock mocks={[{ ...submissionSuccess, result }]} />)

    const textField = screen.getByRole('textbox')

    fireEvent.change(textField, { target: { value: 'My response' } })
    fireEvent.blur(textField)

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('should not create a submission event if the values dont change', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseSubmissionEventCreate: {
          id: 'uuid'
        }
      }
    }))

    render(<TextResponseMock mocks={[{ ...submissionSuccess, result }]} />)

    const textField = screen.getByRole('textbox')

    fireEvent.change(textField, { target: { value: 'Your answer here' } })
    fireEvent.blur(textField)

    await waitFor(() => {
      expect(result).not.toHaveBeenCalled()
    })
  })

  it('should add submission event to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])

    render(<TextResponseMock mocks={[submissionSuccess]} />)

    const textField = screen.getByRole('textbox')

    fireEvent.change(textField, { target: { value: 'My response' } })
    fireEvent.blur(textField)

    await waitFor(() => {
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'text_response_submission',
        eventId: 'uuid',
        blockId: 'textResponse0.id',
        stepName: 'Step {{number}}'
      })
    })
  })

  it('should show error when submit fails', async () => {
    const submissionError = {
      ...submissionSuccess,
      error: new Error()
    }

    render(<TextResponseMock mocks={[submissionError]} />)
    const textField = screen.getByRole('textbox')

    fireEvent.change(textField, { target: { value: 'My response' } })
    fireEvent.blur(textField)

    expect(
      await waitFor(() =>
        screen.getByText('Could not send response, please try again.')
      )
    ).toBeInTheDocument()
  })

  it('should show placeholder text to guide user input', () => {
    const blockWithPlaceholder: TreeBlock<TextResponseFields> = {
      ...block,
      placeholder: 'Enter your thoughts here'
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <JourneyProvider>
          <SnackbarProvider>
            <TextResponse {...blockWithPlaceholder} uuid={() => 'uuid'} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'placeholder',
      'Enter your thoughts here'
    )
  })

  it('should not allow selection in editor', () => {
    render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponseMock />
        </SnackbarProvider>
      </JourneyProvider>
    )

    const response = screen.getByRole('textbox')
    fireEvent.click(response)
    expect(response.matches(':focus')).not.toBeTruthy()
  })

  it('should have correct aria-labelledby attribute', () => {
    render(<TextResponseMock />)
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-labelledby',
      'textResponse-label'
    )
  })

  it('should show asterisk if required', () => {
    const requiredBlock: TreeBlock<TextResponseFields> = {
      ...block,
      required: true
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <JourneyProvider>
          <SnackbarProvider>
            <TextResponse {...requiredBlock} uuid={() => 'uuid'} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Your answer here*')).toBeInTheDocument()
  })

  it('should not show asterisk if not required', () => {
    const notRequiredBlock: TreeBlock<TextResponseFields> = {
      ...block,
      required: false
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <JourneyProvider>
          <SnackbarProvider>
            <TextResponse {...notRequiredBlock} uuid={() => 'uuid'} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.queryByText('Your answer here*')).not.toBeInTheDocument()
    expect(screen.getByText('Your answer here')).toBeInTheDocument()
  })

  it('should show "Required" error message if field is required and left empty', async () => {
    const requiredBlock: TreeBlock<TextResponseFields> = {
      ...block,
      required: true
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <JourneyProvider>
          <SnackbarProvider>
            <TextResponse {...requiredBlock} uuid={() => 'uuid'} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.blur(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })

  it('should show email validation error for invalid email', async () => {
    const emailBlock: TreeBlock<TextResponseFields> = {
      ...block,
      type: TextResponseType.email
    }

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <JourneyProvider>
          <SnackbarProvider>
            <TextResponse {...emailBlock} uuid={() => 'uuid'} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'invalid-email' }
    })
    fireEvent.blur(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument()
    })
  })

  it('should not submit if required validation fails', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseSubmissionEventCreate: {
          id: 'uuid'
        }
      }
    }))

    const requiredBlock: TreeBlock<TextResponseFields> = {
      ...block,
      required: true
    }

    render(
      <MockedProvider
        mocks={[{ ...submissionSuccess, result }]}
        addTypename={false}
      >
        <JourneyProvider>
          <SnackbarProvider>
            <TextResponse {...requiredBlock} uuid={() => 'uuid'} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.blur(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
      expect(result).not.toHaveBeenCalled()
    })
  })

  it('should not submit if email validation fails', async () => {
    const result = jest.fn(() => ({
      data: {
        textResponseSubmissionEventCreate: {
          id: 'uuid'
        }
      }
    }))

    const emailBlock: TreeBlock<TextResponseFields> = {
      ...block,
      type: TextResponseType.email
    }

    render(
      <MockedProvider
        mocks={[{ ...submissionSuccess, result }]}
        addTypename={false}
      >
        <JourneyProvider>
          <SnackbarProvider>
            <TextResponse {...emailBlock} uuid={() => 'uuid'} />
          </SnackbarProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'invalid-email' }
    })
    fireEvent.blur(screen.getByRole('textbox'))

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument()
      expect(result).not.toHaveBeenCalled()
    })
  })
})
