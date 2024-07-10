import { renderHook } from '@testing-library/react'
import { ReactNode } from 'react'

import { Command, reducer, useCommand } from './CommandProvider'

import { CommandProvider, CommandState } from '.'

describe('CommandContext', () => {
  describe('reducer', () => {
    describe('AddCommandAction', () => {
      it('should update state when commands are empty', () => {
        const state: CommandState = {
          commandIndex: 0,
          commands: []
        }
        const command: Command = {
          execute: () => {},
          undo: () => {}
        }

        expect(
          reducer(state, {
            type: 'AddCommandAction',
            command
          })
        ).toEqual({
          commandIndex: 1,
          commands: [command],
          undo: command
        })
      })

      it('should update state when command index at end', () => {
        const command0: Command = {
          execute: () => {},
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 1,
          commands: [command0]
        }
        const command: Command = {
          execute: () => {},
          undo: () => {}
        }

        expect(
          reducer(state, {
            type: 'AddCommandAction',
            command
          })
        ).toEqual({
          commandIndex: 2,
          commands: [command0, command],
          undo: command
        })
      })

      it('should update state when command index in middle', () => {
        const command0: Command = {
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          execute: () => {},
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 1,
          commands: [command0, command1],
          undo: command0,
          redo: command1
        }
        const command: Command = {
          execute: () => {},
          undo: () => {}
        }

        expect(
          reducer(state, {
            type: 'AddCommandAction',
            command
          })
        ).toEqual({
          commandIndex: 2,
          commands: [command0, command],
          undo: command,
          redo: undefined
        })
      })

      it('should remove first element when commands exceed 20', () => {
        const commands: Command[] = Array.from({ length: 20 }).map(() => ({
          execute: () => {},
          undo: () => {}
        }))
        const state: CommandState = {
          commandIndex: 20,
          commands
        }
        const command: Command = {
          execute: () => {},
          undo: () => {}
        }
        expect(
          reducer(state, {
            type: 'AddCommandAction',
            command
          })
        ).toEqual({
          commandIndex: 20,
          commands: [...commands.slice(1), command],
          undo: command,
          redo: undefined
        })
      })
    })

    describe('UndoCallbackAction', () => {
      it('should update state when command index is at end', () => {
        const command0: Command = {
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          execute: () => {},
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 2,
          commands: [command0, command1],
          undo: command1,
          redo: undefined
        }

        expect(
          reducer(state, {
            type: 'UndoCallbackAction'
          })
        ).toEqual({
          commandIndex: 1,
          commands: [command0, command1],
          undo: command0,
          redo: command1
        })
      })
    })

    it('should update state when command index in middle', () => {
      const command0: Command = {
        execute: () => {},
        undo: () => {}
      }
      const command1: Command = {
        execute: () => {},
        undo: () => {}
      }
      const state: CommandState = {
        commandIndex: 1,
        commands: [command0, command1],
        undo: command0,
        redo: command1
      }

      expect(
        reducer(state, {
          type: 'UndoCallbackAction'
        })
      ).toEqual({
        commandIndex: 0,
        commands: [command0, command1],
        undo: undefined,
        redo: command0
      })
    })

    it('should do nothing when command index is at beginning', () => {
      const command0: Command = {
        execute: () => {},
        undo: () => {}
      }
      const command1: Command = {
        execute: () => {},
        undo: () => {}
      }
      const state: CommandState = {
        commandIndex: 0,
        commands: [command0, command1],
        undo: undefined,
        redo: command0
      }

      expect(
        reducer(state, {
          type: 'UndoCallbackAction'
        })
      ).toEqual(state)
    })

    describe('RedoCallbackAction', () => {
      it('should do nothing when command index is at end', () => {
        const command0: Command = {
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          execute: () => {},
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 2,
          commands: [command0, command1],
          undo: command1,
          redo: undefined
        }

        expect(
          reducer(state, {
            type: 'RedoCallbackAction'
          })
        ).toEqual(state)
      })
    })

    it('should update state when command index in middle', () => {
      const command0: Command = {
        execute: () => {},
        undo: () => {}
      }
      const command1: Command = {
        execute: () => {},
        undo: () => {}
      }
      const state: CommandState = {
        commandIndex: 1,
        commands: [command0, command1],
        undo: command0,
        redo: command1
      }

      expect(
        reducer(state, {
          type: 'RedoCallbackAction'
        })
      ).toEqual({
        commandIndex: 2,
        commands: [command0, command1],
        undo: command1,
        redo: undefined
      })
    })

    it('should update state when command index is at beginning', () => {
      const command0: Command = {
        execute: () => {},
        undo: () => {}
      }
      const command1: Command = {
        execute: () => {},
        undo: () => {}
      }
      const state: CommandState = {
        commandIndex: 0,
        commands: [command0, command1],
        undo: undefined,
        redo: command0
      }

      expect(
        reducer(state, {
          type: 'RedoCallbackAction'
        })
      ).toEqual({
        commandIndex: 1,
        commands: [command0, command1],
        undo: command0,
        redo: command1
      })
    })
  })

  describe('CommandProvider', () => {
    it('should set initial state', () => {
      const state: CommandState = {
        commands: [],
        commandIndex: 1
      }

      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <CommandProvider initialState={state}>{children}</CommandProvider>
      )
      const { result } = renderHook(() => useCommand(), {
        wrapper
      })

      expect(result.current.state).toEqual({
        commands: [],
        commandIndex: 1
      })
    })
  })
})
