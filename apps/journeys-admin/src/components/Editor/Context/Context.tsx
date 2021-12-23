import { TreeBlock } from '@core/journeys/ui'
import {
  createContext,
  Dispatch,
  ReactElement,
  ReactNode,
  useReducer
} from 'react'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'

interface EditorState {
  steps: Array<TreeBlock<StepBlock>>
  selectedStep?: TreeBlock<StepBlock>
  selectedBlock?: TreeBlock
  selectedAttributeId?: string
  drawerTitle?: string
  drawerChildren?: ReactNode
  drawerMobileOpen: boolean
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

interface SetDrawerPropsAction {
  type: 'SetDrawerPropsAction'
  title?: string
  children?: ReactNode
  mobileOpen?: boolean
}

interface SetDrawerMobileOpenAction {
  type: 'SetDrawerMobileOpenAction'
  mobileOpen: boolean
}

type EditorAction =
  | SetSelectedStepAction
  | SetSelectedBlockAction
  | SetSelectedAttributeIdAction
  | SetDrawerPropsAction
  | SetDrawerMobileOpenAction

const reducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'SetSelectedStepAction':
      return { ...state, selectedStep: action.step, selectedBlock: action.step }
    case 'SetSelectedBlockAction':
      return { ...state, selectedBlock: action.block }
    case 'SetSelectedAttributeIdAction':
      return { ...state, selectedAttributeId: action.id }
    case 'SetDrawerPropsAction':
      return {
        ...state,
        drawerTitle: action.title,
        drawerChildren: action.children,
        drawerMobileOpen: action.mobileOpen ?? state.drawerMobileOpen
      }
    case 'SetDrawerMobileOpenAction':
      return {
        ...state,
        drawerMobileOpen: action.mobileOpen
      }
  }
}

const EditorContext = createContext<{
  state: EditorState
  dispatch: Dispatch<EditorAction>
}>({
  state: { steps: [], drawerMobileOpen: false },
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
    drawerMobileOpen: false,
    ...initialState
  })

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  )
}

export { EditorContext }
