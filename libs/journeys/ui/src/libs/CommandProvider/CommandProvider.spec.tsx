/* eslint-disable @typescript-eslint/no-empty-function */
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
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 1,
          commands: [command0]
        }
        const command: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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

      it('should update state when command index at end and the previous command id matches', () => {
        const command0: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          id: 'commandId',
          parameters: {
            execute: { arg1: 'execute1' },
            undo: { arg1: 'undo1' }
          },
          execute: () => {},
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 2,
          commands: [command0, command1],
          undo: command0,
          redo: command1
        }
        const command: Command = {
          id: 'commandId',
          parameters: {
            execute: { arg1: 'execute2' },
            undo: { arg1: 'undo2' }
          },
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

      it('should update state when command index at end and the previous command id does not match', () => {
        const command0: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          id: 'commandId',
          parameters: {
            execute: { arg1: 'execute1' },
            undo: { arg1: 'undo1' }
          },
          execute: () => {},
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 2,
          commands: [command0, command1],
          undo: command0,
          redo: command1
        }
        const command: Command = {
          id: 'commandId2',
          parameters: {
            execute: { arg1: 'execute2' },
            undo: { arg1: 'undo2' }
          },
          execute: () => {},
          undo: () => {}
        }

        expect(
          reducer(state, {
            type: 'AddCommandAction',
            command
          })
        ).toEqual({
          commandIndex: 3,
          commands: [command0, command1, command],
          undo: command,
          redo: undefined
        })
      })

      it('should update state when command index in middle', () => {
        const command0: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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

      it('should update state when command index in middle and the previous command id matches', () => {
        const command0: Command = {
          id: 'commandId',
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          parameters: {
            execute: { arg1: 'execute1' },
            undo: { arg1: 'undo1' }
          },
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
          id: 'commandId',
          parameters: {
            execute: { arg1: 'execute2' },
            undo: { arg1: 'undo2' }
          },
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
          undo: command,
          redo: undefined
        })
      })

      it('should remove first element when commands exceed 20', () => {
        const commands: Command[] = Array.from({ length: 20 }).map(() => ({
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }))
        const state: CommandState = {
          commandIndex: 20,
          commands
        }
        const command: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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
        parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
        execute: () => {},
        undo: () => {}
      }
      const command1: Command = {
        parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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
        parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
        execute: () => {},
        undo: () => {}
      }
      const command1: Command = {
        parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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

    // eslint-disable-next-line jest/no-identical-title
    it('should update state when command index in middle', () => {
      const command0: Command = {
        parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
        execute: () => {},
        undo: () => {}
      }
      const command1: Command = {
        parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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
        parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
        execute: () => {},
        undo: () => {}
      }
      const command1: Command = {
        parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
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
        commandIndex: 0
      }

      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <CommandProvider initialState={state}>{children}</CommandProvider>
      )
      const { result } = renderHook(() => useCommand(), {
        wrapper
      })

      expect(result.current.state).toEqual({
        commands: [],
        commandIndex: 0
      })
    })

    describe('undo', () => {
      it('should process undo', async () => {
        const command0: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: jest.fn()
        }
        const state: CommandState = {
          commandIndex: 2,
          commands: [command0, command1],
          undo: command1,
          redo: undefined
        }

        const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
          <CommandProvider initialState={state}>{children}</CommandProvider>
        )
        const { result, rerender } = renderHook(() => useCommand(), {
          wrapper
        })

        result.current.undo()

        rerender()

        expect(command1.undo).toHaveBeenCalledWith({ arg1: 'undo' })

        expect(result.current.state).toEqual({
          commandIndex: 1,
          commands: [command0, command1],
          undo: command0,
          redo: command1
        })
      })

      it('should process execute when no undo', async () => {
        const command0: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: jest.fn()
        }
        const state: CommandState = {
          commandIndex: 2,
          commands: [command0, command1],
          undo: command1,
          redo: undefined
        }

        const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
          <CommandProvider initialState={state}>{children}</CommandProvider>
        )
        const { result, rerender } = renderHook(() => useCommand(), {
          wrapper
        })

        result.current.undo()

        rerender()

        expect(command1.execute).toHaveBeenCalledWith({ arg1: 'undo' })

        expect(result.current.state).toEqual({
          commandIndex: 1,
          commands: [command0, command1],
          undo: command0,
          redo: command1
        })
      })

      it('should not process undo when undo command is not set', async () => {
        const command0: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 0,
          commands: [command0],
          undo: undefined,
          redo: command0
        }

        const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
          <CommandProvider initialState={state}>{children}</CommandProvider>
        )
        const { result, rerender } = renderHook(() => useCommand(), {
          wrapper
        })

        result.current.undo()

        rerender()

        expect(result.current.state).toEqual(state)
      })
    })

    describe('redo', () => {
      it('should process redo', async () => {
        const command0: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: jest.fn(),
          redo: jest.fn(),
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 1,
          commands: [command0, command1],
          undo: command0,
          redo: command1
        }

        const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
          <CommandProvider initialState={state}>{children}</CommandProvider>
        )
        const { result, rerender } = renderHook(() => useCommand(), {
          wrapper
        })

        result.current.redo()

        rerender()

        expect(command1.execute).not.toHaveBeenCalled()
        expect(command1.redo).toHaveBeenCalledWith({ arg1: 'execute' })

        expect(result.current.state).toEqual({
          commandIndex: 2,
          commands: [command0, command1],
          undo: command1,
          redo: undefined
        })
      })

      it('should process execute when no redo', async () => {
        const command0: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const command1: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: jest.fn()
        }
        const state: CommandState = {
          commandIndex: 1,
          commands: [command0, command1],
          undo: command0,
          redo: command1
        }

        const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
          <CommandProvider initialState={state}>{children}</CommandProvider>
        )
        const { result, rerender } = renderHook(() => useCommand(), {
          wrapper
        })

        result.current.redo()

        rerender()

        expect(command1.execute).toHaveBeenCalledWith({ arg1: 'execute' })

        expect(result.current.state).toEqual({
          commandIndex: 2,
          commands: [command0, command1],
          undo: command1,
          redo: undefined
        })
      })

      it('should not process redo when redo command is not set', async () => {
        const command0: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: () => {},
          undo: () => {}
        }
        const state: CommandState = {
          commandIndex: 1,
          commands: [command0],
          undo: command0,
          redo: undefined
        }

        const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
          <CommandProvider initialState={state}>{children}</CommandProvider>
        )
        const { result, rerender } = renderHook(() => useCommand(), {
          wrapper
        })

        result.current.redo()

        rerender()

        expect(result.current.state).toEqual(state)
      })
    })

    describe('add', () => {
      it('should add command', async () => {
        const command: Command = {
          parameters: { execute: { arg1: 'execute' }, undo: { arg1: 'undo' } },
          execute: jest.fn()
        }
        const state: CommandState = {
          commandIndex: 0,
          commands: []
        }

        const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
          <CommandProvider initialState={state}>{children}</CommandProvider>
        )
        const { result, rerender } = renderHook(() => useCommand(), {
          wrapper
        })

        result.current.add(command)

        rerender()

        expect(command.execute).toHaveBeenCalledWith({ arg1: 'execute' })

        expect(result.current.state).toEqual({
          commandIndex: 1,
          commands: [command],
          undo: command,
          redo: undefined
        })
      })
    })
  })
})
