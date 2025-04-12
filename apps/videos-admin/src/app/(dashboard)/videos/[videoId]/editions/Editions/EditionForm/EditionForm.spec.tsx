import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EditionForm } from './EditionForm'

describe('EditionForm', () => {
  it('should render for create', async () => {
    const onSubmit = jest.fn()

    render(
      <EditionForm
        variant="create"
        initialValues={{ name: '' }}
        onSubmit={onSubmit}
      />
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Name' })
    const button = screen.getByRole('button', { name: 'Create' })

    expect(textbox).toBeInTheDocument()
    expect(textbox).toHaveValue('')
    expect(button).toBeInTheDocument()

    await user.type(textbox, 'New edition')
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledWith(
      { name: 'New edition' },
      expect.any(Object)
    )
  })

  it('should render for edit', async () => {
    const onSubmit = jest.fn()

    render(
      <EditionForm
        variant="edit"
        initialValues={{ name: 'base' }}
        onSubmit={onSubmit}
      />
    )

    const user = userEvent.setup()

    const textbox = screen.getByRole('textbox', { name: 'Name' })
    const button = screen.getByRole('button', { name: 'Update' })

    expect(textbox).toBeInTheDocument()
    expect(textbox).toHaveValue('base')
    expect(button).toBeInTheDocument()

    await user.clear(textbox)
    await user.type(textbox, 'updated')
    await user.click(button)

    expect(onSubmit).toHaveBeenCalledWith(
      { name: 'updated' },
      expect.any(Object)
    )
  })
})
