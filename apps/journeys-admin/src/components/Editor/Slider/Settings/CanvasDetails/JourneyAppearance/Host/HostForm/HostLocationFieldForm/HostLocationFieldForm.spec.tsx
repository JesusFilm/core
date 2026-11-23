import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'

import { HostLocationFieldForm } from './HostLocationFieldForm'

describe('HostLocationFieldForm', () => {
  it('should display host location', () => {
    render(<HostLocationFieldForm value="Florida, USA" onChange={noop} />)

    expect(screen.getByRole('textbox', { name: 'Location' })).toHaveAttribute(
      'value',
      'Florida, USA'
    )
  })

  it('should disable the field if host is null', () => {
    render(<HostLocationFieldForm value="" onChange={noop} disabled />)

    expect(screen.getByRole('textbox', { name: 'Location' })).toBeDisabled()
  })

  it('should call on change on text input', async () => {
    const onChange = vi.fn()
    render(<HostLocationFieldForm value="" onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: 'Location' })
    fireEvent.change(input, { target: { value: 'Belfast' } })
    fireEvent.submit(input)

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
  })

  it('should allow an empty location', async () => {
    const onChange = vi.fn()
    render(<HostLocationFieldForm value="Belfast" onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: 'Location' })
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.submit(input)

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(''))
    expect(screen.getByRole('textbox', { name: 'Location' })).not.toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })
})
