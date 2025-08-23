import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  Command,
  CommandProvider,
  useCommand
} from '@core/journeys/ui/CommandProvider'

import { CommandUndoItem } from './CommandUndoItem'

jest.mock('@core/shared/ui/icons/FlipLeft', () => ({
  __esModule: true,
  default: () => null
}))

jest.mock('../Item/Item', () => ({
  __esModule: true,
  Item: ({ label, onClick, ButtonProps }: any) => (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={ButtonProps?.disabled}
    >
      {label}
    </button>
  )
}))

describe('Hotkeys', () => {
  it('should undo command when undo button is clicked', async () => {
    const command0: Command = {
      parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      execute: () => {},
      undo: jest.fn()
    }
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CommandProvider>
        <CommandUndoItem variant="icon-button" />
        {children}
      </CommandProvider>
    )

    const { result } = renderHook(() => useCommand(), {
      wrapper
    })

    await result.current.add(command0)
    await waitFor(() => expect(result.current.state.undo).toBeDefined())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(command0.undo).toHaveBeenCalledWith({ arg1: 'undo' })
  })

  it('should disable button if no undo', async () => {
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CommandProvider>
        <CommandUndoItem variant="icon-button" />
        {children}
      </CommandProvider>
    )

    const { result } = renderHook(() => useCommand(), {
      wrapper
    })

    expect(result.current.state.commands).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })
})
