import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'
import TagManager from 'react-gtm-module'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { JourneyProvider } from '../../libs/JourneyProvider'
import type { TreeBlock } from '../../libs/block'
import { blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../libs/block/__generated__/BlockFields'

import {
  TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
  TextResponse
} from './TextResponse'
import { TextResponseFields } from './__generated__/TextResponseFields'

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

const block: TreeBlock<TextResponseFields> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  hint: null,
  minRows: null,
  children: []
}

const activeBlock: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
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
    const { getByLabelText } = render(
      <TextResponseMock mocks={[submissionSuccess]} />
    )

    const responseField = getByLabelText('Your answer here')

    await waitFor(() => {
      expect(responseField).toHaveAttribute('maxlength', '1000')
    })
  })

  it('should be in a loading state when waiting for response', async () => {
    const { getByRole, getByLabelText } = render(
      <ApolloLoadingProvider>
        <TextResponseMock mocks={[submissionSuccess]} />
      </ApolloLoadingProvider>
    )
    const responseField = getByLabelText('Your answer here')
    const textField = getByRole('textbox')

    fireEvent.change(responseField, { target: { value: 'My response' } })

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
    const { getByLabelText, getByRole } = render(
      <TextResponseMock mocks={[{ ...submissionSuccess, result }]} />
    )

    const responseField = getByLabelText('Your answer here')
    const textField = getByRole('textbox')

    fireEvent.change(responseField, { target: { value: ' ' } })
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

    const { getByLabelText, getByRole } = render(
      <TextResponseMock mocks={[{ ...submissionSuccess, result }]} />
    )

    const responseField = getByLabelText('Your answer here')
    const textField = getByRole('textbox')

    fireEvent.change(responseField, { target: { value: 'My response' } })
    fireEvent.blur(textField)

    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })

  it('should add submission event to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])

    const { getByLabelText, getByRole } = render(
      <TextResponseMock mocks={[submissionSuccess]} />
    )

    const responseField = getByLabelText('Your answer here')
    const textField = getByRole('textbox')

    fireEvent.change(responseField, { target: { value: 'My response' } })
    fireEvent.blur(textField)

    await waitFor(() => {
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'text_response_submission',
          eventId: 'uuid',
          blockId: 'textResponse0.id',
          stepName: 'Step {{number}}'
        }
      })
    })
  })

  it('should show error when submit fails', async () => {
    const submissionError = {
      ...submissionSuccess,
      error: new Error()
    }

    const { getByRole, getByLabelText, getByText } = render(
      <TextResponseMock mocks={[submissionError]} />
    )
    const responseField = getByLabelText('Your answer here')
    const textField = getByRole('textbox')

    fireEvent.change(responseField, { target: { value: 'My response' } })
    fireEvent.blur(textField)

    expect(
      await waitFor(() =>
        getByText('Could not send response, please try again.')
      )
    ).toBeInTheDocument()
  })

  it('should not allow selection in editor', () => {
    const { getAllByRole } = render(
      <JourneyProvider>
        <SnackbarProvider>
          <TextResponseMock />
        </SnackbarProvider>
      </JourneyProvider>
    )

    const response = getAllByRole('textbox')[0]
    fireEvent.click(response)
    expect(response.matches(':focus')).not.toBeTruthy()
  })
})
