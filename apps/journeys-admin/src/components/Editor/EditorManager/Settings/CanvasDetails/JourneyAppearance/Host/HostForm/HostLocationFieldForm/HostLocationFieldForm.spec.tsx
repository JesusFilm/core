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
    const onChange = jest.fn()
    render(<HostLocationFieldForm value="" onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: 'Location' })
    fireEvent.change(input, { target: { value: 'Belfast' } })
    fireEvent.submit(input)

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
  })
})
