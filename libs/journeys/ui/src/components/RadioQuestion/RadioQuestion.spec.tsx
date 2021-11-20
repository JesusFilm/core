import { MockedProvider } from '@apollo/client/testing'
import { TreeBlock } from '../../'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { RadioQuestion, RADIO_QUESTION_RESPONSE_CREATE } from '.'
import { RadioQuestionFields } from './__generated__/RadioQuestionFields'

jest.mock('../../libs/action', () => {
  const originalModule = jest.requireActual('../../libs/action')
  return {
    __esModule: true,
    ...originalModule,
    handleAction: jest.fn()
  }
})

describe('RadioQuestion', () => {
  const block: TreeBlock<RadioQuestionFields> = {
    __typename: 'RadioQuestionBlock',
    id: 'RadioQuestion1',
    label: 'Label',
    description: 'Description',
    parentBlockId: 'RadioQuestion1',
    children: [
      {
        __typename: 'RadioOptionBlock',
        id: 'RadioOption1',
        label: 'Option 1',
        parentBlockId: 'RadioQuestion1',
        action: null,
        children: []
      },
      {
        __typename: 'RadioOptionBlock',
        id: 'RadioOption2',
        label: 'Option 2',
        parentBlockId: 'RadioQuestion1',
        action: null,
        children: []
      }
    ]
  }

  it('should render question props', () => {
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <RadioQuestion {...block} />
      </MockedProvider>
    )

    expect(getByText('Label')).toBeInTheDocument()
    expect(getByText('Description')).toBeInTheDocument()
  })

  it('should display the correct options', () => {
    const { getByText } = render(
      <MockedProvider mocks={[]} addTypename={false}>
        <RadioQuestion {...block} />
      </MockedProvider>
    )
    expect(getByText('Option 1')).toBeInTheDocument()
    expect(getByText('Option 2')).toBeInTheDocument()
  })

  it('should select an option onClick', async () => {
    const { getByTestId, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_RESPONSE_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'RadioQuestion1',
                  radioOptionBlockId: 'RadioOption1'
                }
              }
            },
            result: {
              data: {
                radioQuestionResponseCreate: {
                  id: 'uuid',
                  radioOptionBlockId: 'RadioOption1'
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
    expect(buttons[0]).toContainElement(
      getByTestId('RadioOptionCheckCircleIcon')
    )
  })

  it('should disable unselected options', async () => {
    const { getByTestId, getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: RADIO_QUESTION_RESPONSE_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'RadioQuestion1',
                  radioOptionBlockId: 'RadioOption1'
                }
              }
            },
            result: {
              data: {
                radioQuestionResponseCreate: {
                  id: 'uuid',
                  radioOptionBlockId: 'RadioOption1'
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
    expect(
      getByTestId('RadioOptionRadioButtonUncheckedIcon')
    ).toBeInTheDocument()
    expect(buttons[1]).toBeDisabled()
    expect(buttons[1]).toContainElement(
      getByTestId('RadioOptionRadioButtonUncheckedIcon')
    )
    fireEvent.click(buttons[1])
    expect(buttons[1]).toBeDisabled()
  })
})
