import { fireEvent, render } from '@testing-library/react'

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
    const mockOnCopyClick = jest.fn().mockImplementation(async () => {
      await navigator.clipboard.writeText(link)
    })

    const { getByRole } = render(
      <CopyTextField value={link} onCopyClick={mockOnCopyClick} />
    )
    expect(getByRole('textbox')).toHaveValue(link)
    fireEvent.click(getByRole('button', { name: 'Copy' }))
    expect(mockOnCopyClick).toHaveBeenCalledTimes(1)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link)
  })

  it('selects all text when input focused', () => {
    const link = 'http://localhost/journeys/journeySlug'
    const { getByRole } = render(
      <CopyTextField value={link} />
    )
    fireEvent.focus(getByRole('textbox'))
    const input = getByRole('textbox') as HTMLInputElement
    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(37)
  })

  it('allows customization', () => {
    const mockOnCopyClick = jest.fn()
    const { getByRole, getByText } = render(
      <CopyTextField
        label="Journey URL"
        value="http://localhost/journeys/journeySlug"
        helperText="this is custom helper text"
        messageText="Custom link copied"
        onCopyClick={mockOnCopyClick}
      />
    )
    expect(getByRole('textbox', { name: 'Journey URL' })).toHaveValue(
      'http://localhost/journeys/journeySlug'
    )
    expect(getByText('this is custom helper text')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Copy' }))
    expect(mockOnCopyClick).toHaveBeenCalledTimes(1)
  })

  it('should show custom styling', () => {
    const { getByRole } = render(
      <CopyTextField
        value="test"
        sx={{
          '.MuiFilledInput-root': {
            backgroundColor: 'rgb (255, 255, 255)'
          }
        }}
      />
    )
    expect(getByRole('textbox')).toHaveStyle(
      'background-color: rgb (255, 255, 255)'
    )
  })
})
