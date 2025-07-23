import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CopyTextField } from '.'

describe('CopyTextField', () => {
  const originalNavigator = { ...global.navigator }

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn()
      }
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
    Object.assign(navigator, originalNavigator)
  })

  it('copies link to clipboard', async () => {
    const link = 'http://localhost/journeys/journeySlug'
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <CopyTextField value={link} />
      </SnackbarProvider>
    )
    expect(getByRole('textbox')).toHaveValue(link)
    fireEvent.click(getByRole('button', { name: 'Copy' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link)
    await waitFor(() => expect(getByText('Link copied')).toBeInTheDocument())
  })

  it('selects all text when input focused', () => {
    const link = 'http://localhost/journeys/journeySlug'
    const { getByRole } = render(
      <SnackbarProvider>
        <CopyTextField value={link} />
      </SnackbarProvider>
    )
    fireEvent.focus(getByRole('textbox'))
    const input = getByRole('textbox') as HTMLInputElement
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(37)
  })

  it('allows customization', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <CopyTextField
          label="Journey URL"
          value="http://localhost/journeys/journeySlug"
          helperText="this is custom helper text"
          messageText="Custom link copied"
        />
      </SnackbarProvider>
    )
    expect(getByRole('textbox', { name: 'Journey URL' })).toHaveValue(
      'http://localhost/journeys/journeySlug'
    )
    expect(getByText('this is custom helper text')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Copy' }))
    await waitFor(() =>
      expect(getByText('Custom link copied')).toBeInTheDocument()
    )
  })

  it('should show custom styling', () => {
    const { container } = render(
      <SnackbarProvider>
        <CopyTextField
          value="test"
          sx={{
            backgroundColor: 'rgb(255, 255, 255)'
          }}
        />
      </SnackbarProvider>
    )
    // Check that the TextField wrapper received the sx styling
    const textField = container.querySelector('.MuiTextField-root')
    expect(textField).toHaveStyle('background-color: rgb(255, 255, 255)')
  })
})
