import { render, fireEvent, waitFor } from '@testing-library/react'
import { Platform } from '../utils/types'
import { ChatOption, PlatformDetails } from './ChatOption'

describe('ChatOption', () => {
  const value: PlatformDetails = {
    id: '1',
    active: true,
    title: 'Test Option',
    linkValue: 'https://example.com',
    enableIconSelect: false,
    chatIcon: Platform.facebook,
    helperInfo: 'This is a helper message'
  }

  const setValue = jest.fn()
  const handleUpdate = jest.fn()
  const handleToggle = jest.fn()

  it('should toggle checkbox', () => {
    const { getByRole } = render(
      <ChatOption
        value={value}
        disableSelection={false}
        setValue={setValue}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
    )

    fireEvent.click(getByRole('checkbox'))
    expect(handleToggle).toHaveBeenCalledWith(value.id, false)
  })

  it('should disable checkbox', () => {
    const disabledValue = {
      ...value,
      active: false
    }

    const { getByRole } = render(
      <ChatOption
        value={disabledValue}
        disableSelection
        setValue={setValue}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
    )

    expect(getByRole('checkbox')).toBeDisabled()
  })

  it('should change link value', () => {
    const { getByRole } = render(
      <ChatOption
        value={value}
        disableSelection={false}
        setValue={setValue}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
    )
    fireEvent.click(getByRole('button', { name: 'Test Option' }))
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://newexample.com' }
    })

    expect(setValue).toHaveBeenCalledWith({
      ...value,
      linkValue: 'https://newexample.com'
    })
  })

  it('should change chat icon', async () => {
    const customButton = {
      ...value,
      enableIconSelect: true,
      chatIcon: Platform.snapchat
    }

    const { getByRole, getByText } = render(
      <ChatOption
        value={customButton}
        disableSelection={false}
        setValue={setValue}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
    )

    fireEvent.click(getByRole('button', { name: 'Test Option' }))
    expect(getByText('SnapChat')).toBeInTheDocument()
    fireEvent.mouseDown(getByRole('button', { name: 'Chat Platform' }))
    await waitFor(() => fireEvent.click(getByRole('option', { name: 'VK' })))

    expect(setValue).toHaveBeenCalledWith({
      ...customButton,
      chatIcon: Platform.vk
    })
  })

  it('should show default icon when no icon is selected', () => {
    const customButton = {
      ...value,
      active: false,
      enableIconSelect: true,
      chatIcon: undefined
    }

    const { getByText } = render(
      <ChatOption
        value={customButton}
        disableSelection={false}
        setValue={setValue}
        handleUpdate={handleUpdate}
        handleToggle={handleToggle}
      />
    )

    expect(getByText('Select an icon...')).toBeInTheDocument()
  })
})
