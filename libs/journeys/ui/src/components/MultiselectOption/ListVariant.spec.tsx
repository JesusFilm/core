import { fireEvent, render, screen } from '@testing-library/react'

import { ListVariant } from './ListVariant/ListVariant'

describe('ListVariant', () => {
  it('should show label', () => {
    render(<ListVariant label="label" handleClick={jest.fn()} />)

    expect(screen.getByText('label')).toBeInTheDocument()
  })

  it('should show editable label', () => {
    render(
      <ListVariant
        label="label"
        editableLabel={<span>editableLabel</span>}
        handleClick={jest.fn()}
      />
    )

    expect(screen.getByText('editableLabel')).toBeInTheDocument()
  })

  it('should handleClick', () => {
    const handleClick = jest.fn()

    render(<ListVariant label="label" handleClick={handleClick} />)

    fireEvent.click(screen.getByTestId('JourneysRadioOptionList'))

    expect(handleClick).toHaveBeenCalled()
  })
})
