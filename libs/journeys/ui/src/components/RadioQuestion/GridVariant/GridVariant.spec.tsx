import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GridVariant as RadioOptionGridVariant } from '../../RadioOption/GridVariant'

import { GridVariant } from './GridVariant'

describe('GridVariant', () => {
  const mockHandleClick = jest.fn()
  const options = [
    <RadioOptionGridVariant
      key="option1"
      label="Option 1"
      handleClick={mockHandleClick}
      children={[]}
    />,
    <RadioOptionGridVariant
      key="option2"
      label="Option 2"
      handleClick={mockHandleClick}
      children={[]}
    />
  ]

  it('should display options', async () => {
    render(<GridVariant options={options} blockId="123" />)

    await waitFor(() =>
      expect(
        screen.getByTestId('JourneysRadioQuestionGrid-123')
      ).toBeInTheDocument()
    )
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('should display add option button', () => {
    const addOption = jest.fn()

    render(
      <GridVariant options={options} blockId="123" addOption={addOption} />
    )

    expect(screen.getByText('Add Option')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Add Option'))
    expect(addOption).toHaveBeenCalled()
  })
})
