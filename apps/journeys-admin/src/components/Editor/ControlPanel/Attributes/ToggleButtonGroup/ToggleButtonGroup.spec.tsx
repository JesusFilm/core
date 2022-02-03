import { fireEvent, render } from '@testing-library/react'
import { ToggleButtonGroup } from '.'

describe('ToggleButtonGroup', () => {
  it('changing value adjusts selected', () => {
    const options = [
      {
        value: 'abc',
        label: 'ABC',
        icon: <></>
      },
      {
        value: 'def',
        label: 'DEF',
        icon: <></>
      }
    ]
    const { getByText, rerender } = render(
      <ToggleButtonGroup options={options} value="abc" onChange={jest.fn()} />
    )
    expect(getByText('ABC').parentElement).toHaveClass('Mui-selected')
    expect(getByText('DEF').parentElement).not.toHaveClass('Mui-selected')
    rerender(
      <ToggleButtonGroup options={options} value="def" onChange={jest.fn()} />
    )
    expect(getByText('ABC').parentElement).not.toHaveClass('Mui-selected')
    expect(getByText('DEF').parentElement).toHaveClass('Mui-selected')
  })

  it('calls onChange', () => {
    const handleChange = jest.fn()
    const options = [
      {
        value: 'abc',
        label: 'ABC',
        icon: <></>
      }
    ]
    const { getByRole } = render(
      <ToggleButtonGroup
        options={options}
        value="abc"
        onChange={handleChange}
      />
    )
    fireEvent.click(getByRole('button', { name: 'ABC' }))
    expect(handleChange).toHaveBeenCalled()
  })

  it('renders custom label', () => {
    const options = [
      {
        value: 'abc',
        label: <div data-testid="abc-content">ABC</div>,
        icon: <></>
      }
    ]
    const { getByTestId } = render(
      <ToggleButtonGroup options={options} value="abc" onChange={jest.fn()} />
    )
    expect(getByTestId('abc-content')).toBeInTheDocument()
  })
})
