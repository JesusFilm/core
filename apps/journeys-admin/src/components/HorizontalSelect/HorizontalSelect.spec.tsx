import { render, fireEvent } from '@testing-library/react'
import Box from '@mui/material/Box'
import { HorizontalSelect } from '.'

describe('HorizontalSelect', () => {
  it('calls onChange when step is clicked on', () => {
    const onChange = jest.fn()
    const { getByText } = render(
      <HorizontalSelect onChange={onChange}>
        <Box id="step1.id">Option 1</Box>
        <Box id="step2.id">Option 2</Box>
      </HorizontalSelect>
    )
    fireEvent.click(getByText('Option 1'))
    expect(onChange).toHaveBeenCalledWith('step1.id')
  })

  it('shows border around selected', () => {
    const { getByText } = render(
      <HorizontalSelect onChange={jest.fn()} id="step1.id">
        <Box id="step1.id">Option 1</Box>
        <Box id="step2.id">Option 2</Box>
      </HorizontalSelect>
    )
    expect(getByText('Option 1').parentElement).toHaveStyle(
      'outline: 2px solid #1976d2'
    )
  })

  it('displays foolter', () => {
    const { getByTestId } = render(
      <HorizontalSelect
        onChange={jest.fn()}
        id="step1.id"
        footer={<div data-testid="this-is-a-test">Hello World</div>}
      >
        <Box id="step1.id">Option 1</Box>
        <Box id="step2.id">Option 2</Box>
      </HorizontalSelect>
    )
    expect(getByTestId('this-is-a-test')).toHaveTextContent('Hello World')
  })
})
