import Box from '@mui/material/Box'
import { fireEvent, render, screen } from '@testing-library/react'

import { selectableProps } from './selectable'

function renderSelectable(): {
  onSelect: ReturnType<typeof vi.fn>
  onParentClick: ReturnType<typeof vi.fn>
} {
  const onSelect = vi.fn()
  const onParentClick = vi.fn()
  render(
    <Box onClick={onParentClick} onKeyDown={onParentClick}>
      <Box data-testid="Selectable" {...selectableProps(onSelect, 'Hero')}>
        <textarea aria-label="Title" />
      </Box>
    </Box>
  )
  return { onSelect, onParentClick }
}

describe('selectableProps', () => {
  it('is focusable and labelled', () => {
    renderSelectable()

    const selectable = screen.getByTestId('Selectable')
    expect(selectable).toHaveAttribute('tabindex', '0')
    expect(selectable).toHaveAttribute('aria-label', 'Hero')
  })

  it('selects on click, and the click goes no further', () => {
    const { onSelect, onParentClick } = renderSelectable()

    fireEvent.click(screen.getByTestId('Selectable'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onParentClick).not.toHaveBeenCalled()
  })

  it.each(['Enter', ' '])(
    'selects on %j, and the key goes no further',
    (key) => {
      const { onSelect, onParentClick } = renderSelectable()

      const notCancelled = fireEvent.keyDown(screen.getByTestId('Selectable'), {
        key
      })

      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(notCancelled).toBe(false)
      expect(onParentClick).not.toHaveBeenCalled()
    }
  )

  it('ignores other keys', () => {
    const { onSelect } = renderSelectable()

    fireEvent.keyDown(screen.getByTestId('Selectable'), { key: 'a' })

    expect(onSelect).not.toHaveBeenCalled()
  })

  it.each(['Enter', ' '])(
    'does not select on %j typed in a nested textarea',
    (key) => {
      const { onSelect } = renderSelectable()

      const notCancelled = fireEvent.keyDown(
        screen.getByRole('textbox', { name: 'Title' }),
        { key }
      )

      expect(onSelect).not.toHaveBeenCalled()
      expect(notCancelled).toBe(true)
    }
  )
})
