import Box from '@mui/material/Box'
import { fireEvent, render } from '@testing-library/react'

import { ScrollableSelect } from '.'

describe('ScrollableSelect', () => {
  it('should call onChange when step is clicked on', () => {
    const onChange = jest.fn()
    const { getByText } = render(
      <ScrollableSelect onChange={onChange}>
        <Box id="step1.id">Option 1</Box>
        <Box id="step2.id">Option 2</Box>
      </ScrollableSelect>
    )
    fireEvent.click(getByText('Option 1'))
    expect(onChange).toHaveBeenCalledWith('step1.id')
  })

  it('should show border around selected', () => {
    const { getByText } = render(
      <ScrollableSelect onChange={jest.fn()} id="step1.id">
        <Box id="step1.id">Option 1</Box>
        <Box id="step2.id">Option 2</Box>
      </ScrollableSelect>
    )
    expect(getByText('Option 1').parentElement).toHaveStyle(
      'outline: 2px solid #1976d2'
    )
  })

  it('should display footer', () => {
    const { getByTestId } = render(
      <ScrollableSelect
        onChange={jest.fn()}
        id="step1.id"
        footer={<div data-testid="this-is-a-test">Hello World</div>}
      >
        <Box id="step1.id">Option 1</Box>
        <Box id="step2.id">Option 2</Box>
      </ScrollableSelect>
    )
    expect(getByTestId('this-is-a-test')).toHaveTextContent('Hello World')
  })
})
