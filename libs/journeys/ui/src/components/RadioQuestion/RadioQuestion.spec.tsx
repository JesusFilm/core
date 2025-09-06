import { MockedProvider } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'

import type { TreeBlock } from '../../libs/block'
import { blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify } from '../../libs/plausibleHelpers'

import { RadioQuestionFields } from './__generated__/RadioQuestionFields'

import { RADIO_QUESTION_SUBMISSION_EVENT_CREATE, RadioQuestion } from '.'

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

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

const block: TreeBlock<RadioQuestionFields> = {
  __typename: 'RadioQuestionBlock',
  id: 'RadioQuestion1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  gridView: false,
  children: [
    {
      __typename: 'RadioOptionBlock',
      id: 'RadioOption1',
      label: 'Option 1',
      parentBlockId: 'RadioQuestion1',
      parentOrder: 0,
      action: null,
      pollOptionImageBlockId: null,
      children: []
    },
    {
      __typename: 'RadioOptionBlock',
      id: 'RadioOption2',
      label: 'Option 2',
      parentBlockId: 'RadioQuestion1',
      parentOrder: 1,
      action: null,
      pollOptionImageBlockId: null,
      children: []
    }
  ]
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

describe('RadioQuestion', () => {
  it('should display the correct options', () => {
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <RadioQuestion {...block} addOption={jest.fn()} />
      </MockedProvider>
    )
    expect(getByText('Option 1')).toBeInTheDocument()
    expect(getByText('Option 2')).toBeInTheDocument()
    expect(getByText('Add Option')).toBeInTheDocument()
  })

  it('should select an option onClick', async () => {
    blockHistoryVar([activeBlock])

    const result = jest.fn(() => ({
      data: {
        radioQuestionSubmissionEventCreate: {
          id: 'uuid'
        }
      }
    }))

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_SUBMISSION_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'RadioQuestion1',
                  radioOptionBlockId: 'RadioOption1',
                  stepId: 'step.id',
                  label: 'Untitled',
                  value: 'Option 1'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider>
          <RadioQuestion {...block} uuid={() => 'uuid'} />
        </JourneyProvider>
      </MockedProvider>
    )
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(buttons[0]).toBeDisabled()
  })

  it('should disable unselected options', async () => {
    blockHistoryVar([activeBlock])

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_SUBMISSION_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'RadioQuestion1',
                  radioOptionBlockId: 'RadioOption1',
                  stepId: 'step.id',
                  label: 'Untitled',
                  value: 'Option 1'
                }
              }
            },
            result: {
              data: {
                radioQuestionSubmissionEventCreate: {
                  id: 'uuid'
                }
              }
            }
          }
        ]}
        addTypename={false}
      >
        <RadioQuestion {...block} uuid={() => 'uuid'} />
      </MockedProvider>
    )
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    await waitFor(() => expect(buttons[0]).toBeDisabled())
    expect(buttons[1]).toBeDisabled()
    fireEvent.click(buttons[1])
    expect(buttons[1]).toBeDisabled()
  })

  it('should display list options with wrappers', async () => {
    const { getByText, getAllByTestId } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <RadioQuestion
          {...block}
          wrappers={{
            RadioOptionWrapper: ({ children }) => (
              <div data-testid="radioOptionWrapper">{children}</div>
            )
          }}
        />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getByTestId(`JourneysRadioQuestionList-${block.id}`)
      ).toBeInTheDocument()
    )
    expect(getAllByTestId('radioOptionWrapper')[0]).toContainElement(
      getByText('Option 1')
    )
    expect(getAllByTestId('radioOptionWrapper')[1]).toContainElement(
      getByText('Option 2')
    )
  })

  it('should display grid options with wrappers', async () => {
    const { getByText, getAllByTestId } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <RadioQuestion
          {...block}
          gridView={true}
          wrappers={{
            RadioOptionWrapper: ({ children }) => (
              <div data-testid="radioOptionWrapper">{children}</div>
            )
          }}
        />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        screen.getByTestId(`JourneysRadioQuestionGrid-${block.id}`)
      ).toBeInTheDocument()
    )
    expect(getAllByTestId('radioOptionWrapper')[0]).toContainElement(
      getByText('Option 1')
    )
    expect(getAllByTestId('radioOptionWrapper')[1]).toContainElement(
      getByText('Option 2')
    )
  })

  it('should add radio submission to dataLayer', async () => {
    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_SUBMISSION_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'RadioQuestion1',
                  radioOptionBlockId: 'RadioOption1',
                  stepId: 'step.id',
                  label: 'Step {{number}}',
                  value: 'Option 1'
                }
              }
            },
            result: {
              data: {
                radioQuestionSubmissionEventCreate: {
                  id: 'uuid'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider>
          <RadioQuestion {...block} uuid={() => 'uuid'} />
        </JourneyProvider>
      </MockedProvider>
    )
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'radio_question_submission',
        eventId: 'uuid',
        blockId: 'RadioQuestion1',
        radioOptionSelectedId: 'RadioOption1',
        radioOptionSelectedLabel: 'Option 1',
        stepName: 'Step {{number}}'
      })
    )
  })

  it('should add radio submission to plausible', async () => {
    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_SUBMISSION_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'RadioQuestion1',
                  radioOptionBlockId: 'RadioOption1',
                  stepId: 'step.id',
                  label: 'Step {{number}}',
                  value: 'Option 1'
                }
              }
            },
            result: {
              data: {
                radioQuestionSubmissionEventCreate: {
                  id: 'uuid'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <RadioQuestion {...block} uuid={() => 'uuid'} />
        </JourneyProvider>
      </MockedProvider>
    )
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    await waitFor(() =>
      expect(mockPlausible).toHaveBeenCalledWith('radioQuestionSubmit', {
        u: expect.stringContaining(`/journey.id/step.id`),
        props: {
          id: 'uuid',
          blockId: 'RadioQuestion1',
          label: 'Step {{number}}',
          radioOptionBlockId: 'RadioOption1',
          stepId: 'step.id',
          value: 'Option 1',
          key: keyify({
            stepId: 'step.id',
            event: 'radioQuestionSubmit',
            blockId: 'RadioOption1',
            target: null
          }),
          simpleKey: keyify({
            stepId: 'step.id',
            event: 'radioQuestionSubmit',
            blockId: 'RadioOption1'
          })
        }
      })
    )
  })

  it('should set selectedId to null when  is false', () => {
    blockHistoryVar([activeBlock])

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_SUBMISSION_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'RadioQuestion1',
                  radioOptionBlockId: 'RadioOption1',
                  stepId: 'step.id',
                  label: 'Untitled',
                  value: 'Option 1'
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider>
          <RadioQuestion {...block} uuid={() => 'uuid'} />
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = getAllByRole('button')

    buttons.forEach((button) => {
      expect(button).not.toBeDisabled()
    })
  })
})
