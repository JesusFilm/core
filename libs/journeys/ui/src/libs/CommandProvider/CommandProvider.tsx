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
  UndoParameters = ExecuteParameters
> {
  parameters?: {
    execute?: ExecuteParameters
    undo?: UndoParameters
  }
  execute: (parameters?: ExecuteParameters) => void
  undo?: (parameters?: UndoParameters) => void
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
      const commands = [
        ...state.commands.slice(0, state.commandIndex),
        action.command
      ]
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
        commands: commands,
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

export const CommandContext = createContext<{
  state: CommandState
  dispatch: Dispatch<CommandAction>
}>({
  state: {
    commandIndex: 0,
    commands: []
  },
  dispatch: () => null
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

  return (
    <CommandContext.Provider value={{ state, dispatch }}>
      {children}
    </CommandContext.Provider>
  )
}

export function useCommand(): {
  state: CommandState
  dispatch: Dispatch<CommandAction>
} {
  const context = useContext(CommandContext)
  if (context === undefined) {
    throw new Error('useCommand must be used within a CommandProvider')
  }
  return context
}
