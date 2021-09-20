import {
  fireEvent,
  renderWithApolloClient
} from '../../../../test/testingLibrary'
import { RadioQuestion } from '.'
import { GetJourney_journey_blocks_RadioQuestionBlock as RadioQuestionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { RadioQuestionVariant } from '../../../../__generated__/globalTypes'
describe('RadioQuestion', () => {
  const block: TreeBlock<RadioQuestionBlock> = {
    __typename: 'RadioQuestionBlock',
    id: 'RadioQuestion1',
    label: 'Label',
    description: 'Description',
    variant: RadioQuestionVariant.LIGHT,
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
    const { getByText, getByTestId } = renderWithApolloClient(
      <RadioQuestion {...block} />
    )
    expect(getByText('Label')).toBeInTheDocument()
    expect(getByText('Description')).toBeInTheDocument()
    expect(getByTestId('RadioQuestionCard')).toHaveClass(
      'MuiRadioQuestionComponent-light'
    )
  })

  it('should display the correct options', () => {
    const { getByText } = renderWithApolloClient(<RadioQuestion {...block} />)
    expect(getByText('Option 1')).toBeInTheDocument()
    expect(getByText('Option 2')).toBeInTheDocument()
  })

  it('should render dark theme', () => {
    const { getByTestId } = renderWithApolloClient(
      <RadioQuestion {...block} variant={RadioQuestionVariant.DARK} />
    )
    expect(getByTestId('RadioQuestionCard')).toHaveClass(
      'MuiRadioQuestionComponent-dark'
    )
  })

  it('should select an option OnClick', () => {
    const { getByTestId, getAllByRole } = renderWithApolloClient(
      <RadioQuestion {...block} />
    )
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(buttons[0]).not.toBeDisabled()
    expect(buttons[0]).toContainElement(
      getByTestId('RadioOptionCheckCircleIcon')
    )
  })

  it('should disable unselected options', () => {
    const { getByTestId, getAllByRole } = renderWithApolloClient(
      <RadioQuestion {...block} />
    )
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
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
