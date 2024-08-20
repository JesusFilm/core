import { fireEvent, renderHook, screen, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import {
  Command,
  CommandProvider,
  useCommand
} from '@core/journeys/ui/CommandProvider'

import { CommandRedoItem } from './CommandRedoItem'

describe('Hotkeys', () => {
  it('should undo command when undo button is clicked', async () => {
    const command0: Command = {
      parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      execute: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      undo: () => {},
      redo: jest.fn()
    }

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CommandProvider>
        <CommandRedoItem variant="icon-button" />
        {children}
      </CommandProvider>
    )

    const { result } = renderHook(() => useCommand(), {
      wrapper
    })

    await result.current.add(command0)
    await waitFor(() => expect(result.current.state.undo).toBeDefined())
    await waitFor(async () => result.current.undo())
    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    expect(command0.redo).toHaveBeenCalledWith({ arg1: 'execute' })
  })

  it('should disable button if no redo', async () => {
    const command0: Command = {
      parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
      execute: jest.fn(),
      undo: jest.fn()
    }

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CommandProvider>
        <CommandRedoItem variant="icon-button" />
        {children}
      </CommandProvider>
    )

    const { result } = renderHook(() => useCommand(), {
      wrapper
    })

    await result.current.add(command0)
    await waitFor(() => expect(result.current.state.undo).toBeDefined())

    expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled()
    expect(result.current.state.redo).toBeUndefined()
  })
})
