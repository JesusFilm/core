import { TreeBlock } from '@core/journeys/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import {
  createContext,
  Dispatch,
  ReactElement,
  ReactNode,
  useReducer
} from 'react'

interface EditorState {
  steps: Array<TreeBlock<StepBlock>>
  selectedStep?: TreeBlock<StepBlock>
  selectedBlock?: TreeBlock
  selectedAttributeId?: string
}

interface SetSelectedStepAction {
  type: 'SetSelectedStepAction'
  step?: TreeBlock<StepBlock>
}

interface SetSelectedBlockAction {
  type: 'SetSelectedBlockAction'
  block?: TreeBlock
}

interface SetSelectedAttributeIdAction {
  type: 'SetSelectedAttributeIdAction'
  id?: string
}

type EditorAction =
  | SetSelectedStepAction
  | SetSelectedBlockAction
  | SetSelectedAttributeIdAction

const reducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'SetSelectedStepAction':
      return { ...state, selectedStep: action.step, selectedBlock: action.step }
    case 'SetSelectedBlockAction':
      return { ...state, selectedBlock: action.block }
    case 'SetSelectedAttributeIdAction':
      return { ...state, selectedAttributeId: action.id }
  }
}

export const EditorContext = createContext<{
  state: EditorState
  dispatch: Dispatch<EditorAction>
}>({
  state: { steps: [] },
  dispatch: () => null
})

interface EditorProviderProps {
  children: ReactNode
  initialState?: Partial<EditorState>
}

export function EditorProvider({
  children,
  initialState
}: EditorProviderProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    steps: [],
    selectedStep: initialState?.steps?.[0],
    selectedBlock: initialState?.steps?.[0],
    ...initialState
  })

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  )
}
