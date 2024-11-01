import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'

import { HostTitleFieldForm } from './HostTitleFieldForm'

describe('HostTitleFieldForm', () => {
  it('should display host title', () => {
    render(<HostTitleFieldForm value="title" onChange={noop} />)

    expect(screen.getByRole('textbox', { name: 'Host Name' })).toHaveAttribute(
      'value',
      'title'
    )
  })

  it('should change label if label prop provided', () => {
    render(
      <HostTitleFieldForm
        value=""
        label="Please enter your name"
        onChange={noop}
      />
    )

    expect(screen.queryByText('Host Name')).not.toBeInTheDocument() // default label
    expect(screen.getByText('Please enter your name')).toBeInTheDocument()
  })

  it('should call on change on text input', async () => {
    const onChange = jest.fn()
    render(<HostTitleFieldForm value="" onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: 'Host Name' })
    fireEvent.change(input, { target: { value: 'Someone' } })
    fireEvent.submit(input)

    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
  })

  it('should show different error message when hosttitlerequirederrormessage prop is passed in', async () => {
    render(
      <HostTitleFieldForm
        value=""
        hostTitleRequiredErrorMessage="new error message"
        onChange={noop}
      />
    )

    const field = screen.getByRole('textbox')
    fireEvent.change(field, { target: { value: '' } })
    fireEvent.blur(field)

    await waitFor(() => {
      expect(
        screen.queryByText('Please enter a host name')
      ).not.toBeInTheDocument() // default error message
      expect(screen.getByText('new error message')).toBeInTheDocument()
    })
  })
})
