import {
  Command,
  CommandProvider,
  useCommand
} from '@core/journeys/ui/CommandProvider'
import { renderHook } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'

import { Hotkeys } from './Hotkeys'

describe('Hotkeys', () => {
  it('should undo command when mod+z is pressed', async () => {
    const command0: Command = {
      parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
      execute: jest.fn(),
      undo: jest.fn()
    }
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CommandProvider>
        <Hotkeys />
        {children}
      </CommandProvider>
    )

    const { result } = renderHook(() => useCommand(), {
      wrapper
    })
    result.current.add(command0)
    await userEvent.keyboard('{Meta>}Z{/Meta}')
    expect(command0.undo).toHaveBeenCalledWith({ arg1: 'undo' })
  })

  it('should redo command when mod+shift+z is pressed', async () => {
    const command0: Command = {
      parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
      execute: () => {},
      undo: () => {},
      redo: jest.fn()
    }
    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <CommandProvider>
        <Hotkeys />
        {children}
      </CommandProvider>
    )

    const { result } = renderHook(() => useCommand(), {
      wrapper
    })

    result.current.add(command0)
    await userEvent.keyboard('{Meta>}Z{/Meta}')
    await userEvent.keyboard('{Meta>}{Shift>}Z{/Shift}{/Meta}')
    expect(command0.redo).toHaveBeenCalledWith({ arg1: 'execute' })
  })
})
