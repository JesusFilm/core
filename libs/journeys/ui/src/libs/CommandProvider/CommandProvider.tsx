import noop from 'lodash/noop'
import {
  Dispatch,
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useReducer
} from 'react'

export interface Command<
  ExecuteParameters = unknown,
  RedoParameters = ExecuteParameters,
  UndoParameters = ExecuteParameters
> {
  /**
   * Unique identifier for the command. If successive commands have the same id,
   * they will be treated as the same command and only the most recent will be
   * kept. If not provided, the command will be treated as unique. Only the most
   * recent command is compared.
   */
  id?: string
  /**
   * Parameters for the command. Will be passed to execute, redo, and undo
   * functions.
   */
  parameters: {
    /**
     * Parameters for execute function. Will be passed to execute function when
     * the command is initially added to the stack. Will be passed to optional
     * redo function or execute function when redone.
     */
    execute: ExecuteParameters
    /**
     * Optional parameters for redo function. If not provided, execute
     * parameters will be used.
     */
    redo?: RedoParameters
    /**
     * Parameters for undo function.
     */
    undo: UndoParameters
  }
  /**
   * Function to execute the command. Will be called with the execute parameters
   * when the command is initially added to the stack. Will be called with the
   * redo parameters when redone and redo function is not present. Will be
   * called with the undo parameters when undone and undo function is not
   * present.
   */
  execute: (parameters: ExecuteParameters) => void
  /**
   * Optional redo function to override execute behavior. When command is
   * initially added it will run execute, but when redone it will use this
   * function if present. Will receive execute parameters if no redo parameters
   * are provided.
   */
  redo?: (parameters: RedoParameters) => void
  /**
   * Optional undo function to override execute behavior. When undone it will
   * use this function if present.
   */
  undo?: (parameters: UndoParameters) => void
}
export interface CommandState {
  /**
   * array of commands for undo / redo functionality
   */
  commands: Command[]
  /**
   * index of the current command
   */
  commandIndex: number
  /**
   * command to perform when undo occurs
   */
  undo?: Command
  /**
   * command to perform when redo occurs
   */
  redo?: Command
}
interface AddCommandAction {
  type: 'AddCommandAction'
  command: Command
}
interface UndoCallbackAction {
  type: 'UndoCallbackAction'
}
interface RedoCallbackAction {
  type: 'RedoCallbackAction'
}
type CommandAction = AddCommandAction | UndoCallbackAction | RedoCallbackAction

const MAX_UNDO_COMMANDS = 20

export const reducer = (
  state: CommandState,
  action: CommandAction
): CommandState => {
  switch (action.type) {
    case 'AddCommandAction': {
      let commands
      if (
        action.command.id != null &&
        state.commands[state.commandIndex - 1]?.id === action.command.id
      ) {
        commands = [
          ...state.commands.slice(0, state.commandIndex - 1),
          action.command
        ]
      } else {
        commands = [
          ...state.commands.slice(0, state.commandIndex),
          action.command
        ]
      }

      if (commands.length > MAX_UNDO_COMMANDS) {
        return {
          ...state,
          commands: commands.slice(1),
          commandIndex: MAX_UNDO_COMMANDS,
          undo: action.command,
          redo: undefined
        }
      }
      return {
        ...state,
        commands,
        commandIndex: commands.length,
        undo: action.command,
        redo: undefined
      }
    }
    case 'UndoCallbackAction': {
      const commandIndex = state.commandIndex - 1
      if (commandIndex < 0) return state
      return {
        ...state,
        commandIndex,
        undo: state.commands[commandIndex - 1],
        redo: state.commands[commandIndex]
      }
    }
    case 'RedoCallbackAction': {
      const commandIndex = state.commandIndex + 1
      if (commandIndex > state.commands.length) return state
      return {
        ...state,
        commandIndex,
        undo: state.commands[commandIndex - 1],
        redo: state.commands[commandIndex]
      }
    }
  }
}

interface CommandContextType {
  state: CommandState
  dispatch: Dispatch<CommandAction>
  /**
   * Execute a command and add it to the command stack.
   * @param command Command to add
   */
  add: <E = unknown, R = E, U = E>(command: Command<E, R, U>) => void
  /**
   * Undo the last command.
   */
  undo: () => void
  /**
   * Redo the last undone command.
   */
  redo: () => void
}

export const CommandContext = createContext<CommandContextType>({
  state: {
    commandIndex: 0,
    commands: []
  },
  dispatch: () => null,
  add: noop,
  undo: noop,
  redo: noop
})

interface CommandProviderProps {
  children: ReactNode
  initialState?: Partial<CommandState>
}

export function CommandProvider({
  children,
  initialState
}: CommandProviderProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    commandIndex: 0,
    commands: [],
    ...initialState
  })

  function undo(): void {
    if (state.undo == null) return
    dispatch({ type: 'UndoCallbackAction' })
    if (state.undo.undo != null) {
      state.undo.undo(state.undo.parameters?.undo)
    } else {
      state.undo.execute(state.undo.parameters?.undo)
    }
  }

  function redo(): void {
    if (state.redo == null) return
    dispatch({ type: 'RedoCallbackAction' })
    if (state.redo.redo != null) {
      state.redo.redo(
        state.redo.parameters?.redo ?? state.redo.parameters.execute
      )
    } else {
      state.redo.execute(
        state.redo.parameters?.redo ?? state.redo.parameters.execute
      )
    }
  }

  function add<E = unknown, R = E, U = E>(command: Command<E, R, U>): void {
    command.execute(command.parameters.execute)
    dispatch({ type: 'AddCommandAction', command: command as Command })
  }

  return (
    <CommandContext.Provider value={{ state, dispatch, undo, redo, add }}>
      {children}
    </CommandContext.Provider>
  )
}

export function useCommand(): CommandContextType {
  const context = useContext(CommandContext)
  if (context === undefined) {
    throw new Error('useCommand must be used within a CommandProvider')
  }
  return context
}
