import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { GET_LANGUAGES } from './Drawer'
import { Drawer } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => true)
}))

describe('LanguageDrawer', () => {
  const mocks = [
    {
      request: {
        query: GET_LANGUAGES,
        variables: {
          languageId: '529'
        }
      },
      result: {
        data: {
          languages: [
            {
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true
                }
              ]
            },
            {
              id: '496',
              name: [
                {
                  value: 'Français',
                  primary: true
                },
                {
                  value: 'French',
                  primary: false
                }
              ]
            },
            {
              id: '1106',
              name: [
                {
                  value: 'Deutsch',
                  primary: true
                },
                {
                  value: 'German, Standard',
                  primary: false
                }
              ]
            }
          ]
        }
      }
    }
  ]

  it('should call onClose when closed', () => {
    const handleClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <Drawer
          open={true}
          onClose={handleClose}
          onChange={jest.fn()}
          selectedIds={[]}
          currentLanguageId="529"
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should select languages based on selectedIds', async () => {
    const handleClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <Drawer
          open={true}
          onClose={handleClose}
          onChange={jest.fn()}
          selectedIds={['529']}
          currentLanguageId="529"
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('checkbox', { name: 'English English' })).toBeChecked()
    )
    expect(getByRole('checkbox', { name: 'French Français' })).not.toBeChecked()
  })

  it('should call onChange and onClose when Apply clicked', async () => {
    const handleChange = jest.fn()
    const handleClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <Drawer
          open={true}
          onClose={handleClose}
          onChange={handleChange}
          selectedIds={['529']}
          currentLanguageId="529"
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('checkbox', { name: 'English English' })).toBeChecked()
    )
    fireEvent.click(getByRole('checkbox', { name: 'English English' }))
    fireEvent.click(getByRole('checkbox', { name: 'French Français' }))
    fireEvent.click(getByRole('button', { name: 'Apply' }))
    expect(handleChange).toHaveBeenCalledWith(['496'])
    expect(handleClose).toHaveBeenCalled()
  })

  it('should clear selection when Clear clicked', async () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <Drawer
          open={true}
          onClose={jest.fn()}
          onChange={handleChange}
          selectedIds={['529']}
          currentLanguageId="529"
        />
      </MockedProvider>
    )
    await waitFor(() =>
      expect(getByRole('checkbox', { name: 'English English' })).toBeChecked()
    )
    fireEvent.click(getByRole('button', { name: 'Clear' }))
    expect(getByRole('button', { name: 'Clear' })).toBeDisabled()
    fireEvent.click(getByRole('checkbox', { name: 'French Français' }))
    fireEvent.click(getByRole('button', { name: 'Apply' }))
    expect(handleChange).toHaveBeenCalledWith(['496'])
  })
})
