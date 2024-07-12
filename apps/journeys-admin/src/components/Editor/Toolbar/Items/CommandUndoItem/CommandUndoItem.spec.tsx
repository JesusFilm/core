import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  Command,
  CommandProvider,
  useCommand
} from '@core/journeys/ui/CommandProvider'

import { CommandUndoItem } from './CommandUndoItem'

describe('Hotkeys', () => {
  it('should undo command when undo button is clicked', async () => {
    const command0: Command = {
      parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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

    result.current.add(command0)
    await waitFor(() => expect(result.current.state.commands.length).toBe(1))
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

    expect(result.current.state.commands.length).toBe(0)
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled()
  })
})
