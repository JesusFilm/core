import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ConfigField } from './ConfigField'

describe('ConfigField', () => {
  it('should call onChange callback when the value is changed', async () => {
    const handleChange = jest.fn()
    render(
      <ConfigField
        label="Access Key"
        value="accessKey"
        onChange={handleChange}
      />
    )
    const input = screen.getByDisplayValue('accessKey')
    fireEvent.change(input, { target: { value: 'newAccessKey' } })
    fireEvent.submit(input)
    await waitFor(() =>
      expect(handleChange).toHaveBeenCalledWith('newAccessKey')
    )
  })

  it('should show error message when value is empty', async () => {
    const onSubmit = jest.fn()
    render(<ConfigField label="Access Key" value="" onChange={onSubmit} />)
    const input = screen.getByDisplayValue('')
    fireEvent.submit(input)
    await waitFor(() =>
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    )
  })

  it('should show the value on text field click', async () => {
    render(
      <ConfigField label="Access Key" value="accessKey" onChange={jest.fn()} />
    )
    const input = screen.getByDisplayValue('accessKey')
    fireEvent.click(input)
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByDisplayValue('accessKey')).toBeInTheDocument()
  })

  it('should toggle value visibility upon clicking eye icon', () => {
    render(
      <ConfigField label="Access Key" value="accessKey" onChange={jest.fn()} />
    )
    const input = screen.getByDisplayValue('accessKey')
    expect(input).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByTestId('EyeClosedIcon'))
    expect(input).toHaveAttribute('type', 'text')
    fireEvent.click(screen.getByTestId('EyeOpenIcon'))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('should show add missing value text on hover', () => {
    render(<ConfigField label="Access Key" onChange={jest.fn()} />)
    const input = screen.getByDisplayValue('')
    fireEvent.mouseEnter(input)
    expect(screen.getByText('Add missing value')).toBeInTheDocument()
    fireEvent.mouseLeave(input)
    expect(screen.queryByText('Add missing value')).not.toBeInTheDocument()
  })

  it('should show reveal secret text on hover', () => {
    render(
      <ConfigField label="Access Key" value="accessKey" onChange={jest.fn()} />
    )
    const input = screen.getByDisplayValue('accessKey')
    fireEvent.mouseEnter(input)
    expect(screen.getByText('Click to reveal the secret')).toBeInTheDocument()
    fireEvent.mouseLeave(input)
    expect(
      screen.queryByText('Click to reveal the secret')
    ).not.toBeInTheDocument()
  })
})
