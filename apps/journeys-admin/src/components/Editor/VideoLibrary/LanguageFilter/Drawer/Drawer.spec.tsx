import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { Drawer } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => true)
}))

describe('LanguageDrawer', () => {
  it('should call onClose when closed', () => {
    const handleClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <Drawer
          open={true}
          onClose={handleClose}
          onChange={jest.fn()}
          selectedIds={[]}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should select languages based on selectedIds', () => {
    const handleClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <Drawer
          open={true}
          onClose={handleClose}
          onChange={jest.fn()}
          selectedIds={['en']}
        />
      </MockedProvider>
    )
    expect(getByRole('checkbox', { name: 'English English' })).toBeChecked()
    expect(getByRole('checkbox', { name: 'Chinese 中文' })).not.toBeChecked()
  })

  it('should call onChange and onClose when Apply clicked', () => {
    const handleChange = jest.fn()
    const handleClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <Drawer
          open={true}
          onClose={handleClose}
          onChange={handleChange}
          selectedIds={['en']}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('checkbox', { name: 'English English' }))
    fireEvent.click(getByRole('checkbox', { name: 'Chinese 中文' }))
    fireEvent.click(getByRole('button', { name: 'Apply' }))
    expect(handleChange).toHaveBeenCalledWith(['zh'])
    expect(handleClose).toHaveBeenCalled()
  })

  it('should clear selection when Clear clicked', () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <Drawer
          open={true}
          onClose={jest.fn()}
          onChange={handleChange}
          selectedIds={['en']}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Clear' }))
    expect(getByRole('button', { name: 'Clear' })).toBeDisabled()
    fireEvent.click(getByRole('checkbox', { name: 'Chinese 中文' }))
    fireEvent.click(getByRole('button', { name: 'Apply' }))
    expect(handleChange).toHaveBeenCalledWith(['zh'])
  })
})
