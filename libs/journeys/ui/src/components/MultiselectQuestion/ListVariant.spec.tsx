import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ListVariant as RadioOptionListVariant } from '../RadioOption/ListVariant'

import { ListVariant } from './ListVariant/ListVariant'

describe('ListVariant', () => {
  const mockHandleClick = jest.fn()
  const options = [
    <RadioOptionListVariant
      key="option1"
      label="Option 1"
      handleClick={mockHandleClick}
    />,
    <RadioOptionListVariant
      key="option2"
      label="Option 2"
      handleClick={mockHandleClick}
    />
  ]

  it('should display options', async () => {
    render(<ListVariant options={options} blockId="123" />)

    await waitFor(() =>
      expect(
        screen.getByTestId('JourneysRadioQuestionList-123')
      ).toBeInTheDocument()
    )
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('should display add option button', () => {
    const addOption = jest.fn()

    render(
      <ListVariant options={options} blockId="123" addOption={addOption} />
    )

    expect(screen.getByText('Add Option')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Add Option'))
    expect(addOption).toHaveBeenCalled()
  })
})
