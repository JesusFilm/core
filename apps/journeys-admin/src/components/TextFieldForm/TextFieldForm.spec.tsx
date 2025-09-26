import { act, fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { object, string } from 'yup'

import Search1Icon from '@core/shared/ui/icons/Search1'

import { TextFieldForm, TextFieldFormRef } from './TextFieldForm'

describe('TextFieldForm', () => {
  it('should render TextFieldForm', () => {
    const { getByText, getByRole, getByTestId } = render(
      <TextFieldForm
        id="TextField form"
        label="Navigate to..."
        initialValue="Default Value"
        placeholder="Placeholder Value"
        inputProps={{
          'data-testid': 'TextField form',
          'aria-label': 'Search'
        }}
        onSubmit={jest.fn()}
        endIcon={<Search1Icon />}
      />
    )
    const textField = getByRole('textbox')
    expect(getByText('Navigate to...')).toBeInTheDocument()
    expect(textField).toHaveAttribute('id', 'TextField form')
    expect(textField).toHaveAttribute('value', 'Default Value')
    expect(textField).toHaveAttribute('placeholder', 'Placeholder Value')
    expect(textField).toHaveAttribute('aria-label', 'Search')
    expect(getByTestId('TextField form')).toBeInTheDocument()
    expect(getByTestId('Search1Icon')).toBeInTheDocument()
  })

  it('should show helper text', () => {
    const { getByText } = render(
      <TextFieldForm
        id="helper"
        label="Navigate to..."
        initialValue="Default Value"
        helperText="Label goes here"
        onSubmit={jest.fn()}
      />
    )
    expect(getByText('Label goes here')).toBeInTheDocument()
  })

  it('should show error on change', async () => {
    const validationSchema = object({
      link: string().required('This field is required')
    })
    const onSubmit = jest.fn()

    const { getByRole } = render(
      <TextFieldForm
        id="link"
        label="Navigate to..."
        initialValue="url"
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      />
    )

    const field = getByRole('textbox')

    fireEvent.change(field, {
      target: { value: '' }
    })
    fireEvent.submit(field)

    await waitFor(() => {
      expect(field).toHaveAccessibleDescription('This field is required')
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  it('should call onSubmit on enter keypress', async () => {
    const onSubmit = jest.fn()
    const { getByRole, getByText } = render(
      <TextFieldForm
        id="enterSubmit"
        label="Navigate to..."
        initialValue="Default Value"
        onSubmit={onSubmit}
      />
    )
    expect(getByText('Navigate to...')).toBeInTheDocument()

    const field = getByRole('textbox')
    fireEvent.change(field, {
      target: { value: 'google.com' }
    })
    fireEvent.submit(field)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('should call onSubmit on blur', async () => {
    const onSubmit = jest.fn()
    const validationSchema = object({
      link: string().required('This field is required')
    })

    const { getByRole } = render(
      <TextFieldForm
        id="link"
        label="Navigate to..."
        initialValue="https://google.com"
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      />
    )
    const field = getByRole('textbox')
    fireEvent.change(field, {
      target: { value: 'google.com' }
    })
    fireEvent.blur(field)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('should keep initial value on blur from an empty required field', async () => {
    const validationSchema = object({
      link: string().required('This field is required')
    })
    const onSubmit = jest.fn()

    const { getByRole } = render(
      <TextFieldForm
        id="link"
        label="Navigate to..."
        initialValue="url"
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      />
    )

    const field = getByRole('textbox')
    await act(async () => {
      fireEvent.change(field, {
        target: { value: '' }
      })
    })
    await act(async () => {
      fireEvent.blur(field)
    })

    await waitFor(() => {
      expect(field).toHaveValue('url')
      expect(field).toHaveAccessibleDescription('')
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  it('should call onPaste when a user pastes value', async () => {
    const onPaste = jest.fn()
    const { getByRole } = render(
      <TextFieldForm
        id="link"
        label="Add image by url"
        onSubmit={jest.fn()}
        onPaste={onPaste}
      />
    )

    await fireEvent.paste(getByRole('textbox'), {
      clipboardData: { getData: () => 'https://google.com' }
    })
    expect(onPaste).toHaveBeenCalled()
  })

  it('should focus the text field when ref focus method is called', () => {
    const ref = React.createRef<TextFieldFormRef>()
    const { getByRole } = render(
      <TextFieldForm
        id="focusTest"
        label="Focus Test"
        onSubmit={jest.fn()}
        ref={ref}
      />
    )

    const textField = getByRole('textbox')

    act(() => {
      ref.current?.focus()
    })

    expect(textField).toHaveFocus()
  })
})
