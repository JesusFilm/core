import { TreeBlock } from '@core/journeys/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import {
  createContext,
  Dispatch,
  ReactElement,
  ReactNode,
  useReducer
} from 'react'

interface State {
  steps: Array<TreeBlock<StepBlock>>
  selectedStep?: TreeBlock<StepBlock>
  selectedBlock?: TreeBlock
}

interface SetSelectedStepAction {
  type: 'SetSelectedStepAction'
  step?: TreeBlock<StepBlock>
}

interface SetSelectedBlockAction {
  type: 'SetSelectedBlockAction'
  block?: TreeBlock
}

export type Action = SetSelectedStepAction | SetSelectedBlockAction

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SetSelectedStepAction':
      return { ...state, selectedStep: action.step, selectedBlock: action.step }
    case 'SetSelectedBlockAction':
      return { ...state, selectedBlock: action.block }
  }
}

export const Context = createContext<{
  state: State
  dispatch: Dispatch<Action>
}>({
  state: { steps: [] },
  dispatch: () => null
})

interface EditorProviderProps {
  children: ReactNode
  initialState?: Partial<State>
}

export const Provider = ({
  children,
  initialState
}: EditorProviderProps): ReactElement => {
  const [state, dispatch] = useReducer(reducer, { steps: [], ...initialState })

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  )
}
