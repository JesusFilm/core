import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { createShowSnackbar } from './showSnackbar'

describe('createShowSnackbar', () => {
  it('should call enqueueSnackbar with correct message and variant', () => {
    const enqueueSnackbar = jest.fn()
    const closeSnackbar = jest.fn()
    const showSnackbar = createShowSnackbar(enqueueSnackbar, closeSnackbar)

    showSnackbar('Test message', 'success')

    expect(enqueueSnackbar).toHaveBeenCalledWith('Test message', {
      variant: 'success',
      preventDuplicate: true,
      autoHideDuration: 4000,
      action: expect.any(Function)
    })
  })

  it('should include persist option when persist is true', () => {
    const enqueueSnackbar = jest.fn()
    const closeSnackbar = jest.fn()
    const showSnackbar = createShowSnackbar(enqueueSnackbar, closeSnackbar)

    showSnackbar('Test message', 'error', true)

    expect(enqueueSnackbar).toHaveBeenCalledWith('Test message', {
      variant: 'error',
      preventDuplicate: true,
      autoHideDuration: 4000,
      persist: true,
      action: expect.any(Function)
    })
  })

  it('should not include persist option when persist is false', () => {
    const enqueueSnackbar = jest.fn()
    const closeSnackbar = jest.fn()
    const showSnackbar = createShowSnackbar(enqueueSnackbar, closeSnackbar)

    showSnackbar('Test message', 'info', false)

    expect(enqueueSnackbar).toHaveBeenCalledWith('Test message', {
      variant: 'info',
      preventDuplicate: true,
      autoHideDuration: 4000,
      action: expect.any(Function)
    })
    expect(enqueueSnackbar.mock.calls[0][1]).not.toHaveProperty('persist')
  })

  it('should call closeSnackbar when action button is clicked', async () => {
    const user = userEvent.setup()
    const enqueueSnackbar = jest.fn()
    const closeSnackbar = jest.fn()
    const showSnackbar = createShowSnackbar(enqueueSnackbar, closeSnackbar)

    showSnackbar('Test message', 'warning')

    const actionFn = enqueueSnackbar.mock.calls[0][1].action
    const snackbarKey = 'test-key'
    const actionElement = actionFn(snackbarKey)

    const { container } = render(actionElement)
    const button = container.querySelector('button')

    expect(button).toBeInTheDocument()
    if (button != null) {
      await user.click(button)
      expect(closeSnackbar).toHaveBeenCalledWith(snackbarKey)
    }
  })

  it('should handle all variant types', () => {
    const enqueueSnackbar = jest.fn()
    const closeSnackbar = jest.fn()
    const showSnackbar = createShowSnackbar(enqueueSnackbar, closeSnackbar)

    const variants: Array<'success' | 'error' | 'info' | 'warning'> = [
      'success',
      'error',
      'info',
      'warning'
    ]

    variants.forEach((variant) => {
      showSnackbar(`Test ${variant}`, variant)
      expect(enqueueSnackbar).toHaveBeenCalledWith(`Test ${variant}`, {
        variant,
        preventDuplicate: true,
        autoHideDuration: 4000,
        action: expect.any(Function)
      })
    })
  })

  it('should handle options object with autoHideDuration and preventDuplicate', () => {
    const enqueueSnackbar = jest.fn()
    const closeSnackbar = jest.fn()
    const showSnackbar = createShowSnackbar(enqueueSnackbar, closeSnackbar)

    showSnackbar('Test message', 'success', {
      autoHideDuration: 5000,
      preventDuplicate: false
    })

    expect(enqueueSnackbar).toHaveBeenCalledWith('Test message', {
      variant: 'success',
      preventDuplicate: false,
      autoHideDuration: 5000,
      action: expect.any(Function)
    })
    expect(enqueueSnackbar.mock.calls[0][1]).not.toHaveProperty('persist')
  })

  it('should handle options object with persist true and autoHideDuration null', () => {
    const enqueueSnackbar = jest.fn()
    const closeSnackbar = jest.fn()
    const showSnackbar = createShowSnackbar(enqueueSnackbar, closeSnackbar)

    showSnackbar('Test message', 'warning', {
      persist: true,
      autoHideDuration: null
    })

    expect(enqueueSnackbar).toHaveBeenCalledWith('Test message', {
      variant: 'warning',
      preventDuplicate: true,
      persist: true,
      action: expect.any(Function)
    })
    expect(enqueueSnackbar.mock.calls[0][1]).not.toHaveProperty(
      'autoHideDuration'
    )
  })
})
