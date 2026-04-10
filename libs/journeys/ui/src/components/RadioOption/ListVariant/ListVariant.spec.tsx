import { fireEvent, render, screen } from '@testing-library/react'

import { ListVariant } from './ListVariant'

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

  it('should apply selected class when selected', () => {
    render(
      <ListVariant label="label" selected={true} handleClick={jest.fn()} />
    )

    expect(screen.getByTestId('JourneysRadioOptionList')).toHaveClass(
      'selected'
    )
  })

  it('should not apply selected class when not selected', () => {
    render(
      <ListVariant label="label" selected={false} handleClick={jest.fn()} />
    )

    expect(screen.getByTestId('JourneysRadioOptionList')).not.toHaveClass(
      'selected'
    )
  })

  it('should apply dimmed class when dimmed', () => {
    render(
      <ListVariant label="label" dimmed={true} handleClick={jest.fn()} />
    )

    expect(screen.getByTestId('JourneysRadioOptionList')).toHaveClass('dimmed')
  })

  it('should not apply dimmed class when not dimmed', () => {
    render(
      <ListVariant label="label" dimmed={false} handleClick={jest.fn()} />
    )

    expect(screen.getByTestId('JourneysRadioOptionList')).not.toHaveClass(
      'dimmed'
    )
  })

  it('should still be clickable when dimmed', () => {
    const handleClick = jest.fn()

    render(
      <ListVariant label="label" dimmed={true} handleClick={handleClick} />
    )

    fireEvent.click(screen.getByTestId('JourneysRadioOptionList'))

    expect(handleClick).toHaveBeenCalled()
  })
})
