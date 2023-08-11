import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'
import TagManager from 'react-gtm-module'

import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'
import { blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../libs/JourneyProvider'

import { TextResponseFields } from './__generated__/TextResponseFields'
import {
  TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
  TextResponse
} from './TextResponse'

jest.mock('../../libs/action', () => {
  const originalModule = jest.requireActual('../../libs/action')
  return {
    __esModule: true,
    ...originalModule,
    handleAction: jest.fn()
  }
})

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: () => null
    }
  }
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

const block: TreeBlock<TextResponseFields> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  hint: null,
  minRows: null,
  submitIconId: null,
  submitLabel: null,
  action: {
    __typename: 'LinkAction',
    parentBlockId: 'textResponse0.id',
    gtmEventName: 'textResponse',
    url: '#'
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

  it('should redirect when form submit suceeds', async () => {
    const { getByLabelText, getByRole } = render(
      <TextResponseMock mocks={[submissionSuccess]} />
    )

    const responseField = getByLabelText('Your answer here')
    const submit = getByRole('button')

    fireEvent.change(responseField, { target: { value: 'My response' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(handleAction).toHaveBeenCalledWith(
        {
          push: expect.any(Function)
        },
        {
          __typename: 'LinkAction',
          parentBlockId: 'textResponse0.id',
          gtmEventName: 'textResponse',
          url: '#'
        }
      )
    })
  })

  it('should be in a loading state when waiting for response', async () => {
    const { getByRole, getByLabelText } = render(
      <ApolloLoadingProvider>
        <TextResponseMock mocks={[submissionSuccess]} />
      </ApolloLoadingProvider>
    )
    const responseField = getByLabelText('Your answer here')
    const submit = getByRole('button')

    fireEvent.change(responseField, { target: { value: 'My response' } })

    expect(submit).not.toHaveClass('MuiLoadingButton-loading')

    fireEvent.click(submit)

    await waitFor(() => expect(submit).toHaveClass('MuiLoadingButton-loading'))
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
    const submit = getByRole('button')

    fireEvent.change(responseField, { target: { value: ' ' } })
    fireEvent.click(submit)

    await waitFor(() => {
      expect(result).not.toHaveBeenCalled()
      expect(handleAction).toHaveBeenCalled()
    })
  })

  it('should create submission event on click', async () => {
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
    const submit = getByRole('button')

    fireEvent.change(responseField, { target: { value: 'My response' } })
    fireEvent.click(submit)

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
    const submit = getByRole('button')

    fireEvent.change(responseField, { target: { value: 'My response' } })
    fireEvent.click(submit)

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
    const submit = getByRole('button')

    fireEvent.change(responseField, { target: { value: 'My response' } })
    fireEvent.click(submit)

    expect(
      await waitFor(() =>
        getByText('Could not send response, please try again.')
      )
    ).toBeInTheDocument()
  })
})
