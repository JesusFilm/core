import {
  createContext,
  Dispatch,
  ReactElement,
  ReactNode,
  useEffect,
  useContext,
  useReducer
} from 'react'
import { TreeBlock } from '../transformer'
import { StepFields as StepBlock } from '../../components/Step/__generated__/StepFields'

export enum ActiveTab {
  Cards = 0,
  Properties = 1,
  Blocks = 2
}

export interface EditorState {
  steps: Array<TreeBlock<StepBlock>>
  selectedStep?: TreeBlock<StepBlock>
  selectedBlock?: TreeBlock
  selectedAttributeId?: string
  drawerTitle?: string
  drawerChildren?: ReactNode
  drawerMobileOpen: boolean
  activeTab: ActiveTab
}

interface SetSelectedStepAction {
  type: 'SetSelectedStepAction'
  step?: TreeBlock<StepBlock>
}

interface SetSelectedBlockAction {
  type: 'SetSelectedBlockAction'
  block?: TreeBlock
}

interface SetSelectedBlockByIdAction {
  type: 'SetSelectedBlockByIdAction'
  id?: string
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

interface SetActiveTabAction {
  type: 'SetActiveTabAction'
  activeTab: ActiveTab
}

interface SetStepsAction {
  type: 'SetStepsAction'
  steps: Array<TreeBlock<StepBlock>>
}

type EditorAction =
  | SetSelectedStepAction
  | SetSelectedBlockAction
  | SetSelectedBlockByIdAction
  | SetSelectedAttributeIdAction
  | SetDrawerPropsAction
  | SetDrawerMobileOpenAction
  | SetActiveTabAction
  | SetStepsAction

function search(tree: TreeBlock[], id: string): TreeBlock | undefined {
  const stack = [...tree]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node != null) {
      if (node.id === id) return node
      if (node.children.length > 0) stack.push(...node.children)
    }
  }
}

export const reducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'SetSelectedStepAction':
      return { ...state, selectedStep: action.step, selectedBlock: action.step }
    case 'SetSelectedBlockAction':
      return { ...state, selectedBlock: action.block }
    case 'SetSelectedBlockByIdAction':
      return {
        ...state,
        selectedBlock:
          action.id != null ? search(state.steps, action.id) : undefined
      }
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
    case 'SetActiveTabAction':
      return {
        ...state,
        activeTab: action.activeTab
      }
    case 'SetStepsAction':
      return {
        ...state,
        steps: action.steps
      }
  }
}

export const EditorContext = createContext<{
  state: EditorState
  dispatch: Dispatch<EditorAction>
}>({
  state: { steps: [], drawerMobileOpen: false, activeTab: ActiveTab.Cards },
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
    activeTab: ActiveTab.Cards,
    ...initialState
  })

  useEffect(() => {
    if (initialState?.steps != null)
      dispatch({ type: 'SetStepsAction', steps: initialState.steps })
  }, [initialState?.steps])

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditor(): {
  state: EditorState
  dispatch: Dispatch<EditorAction>
} {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within a EditorProvider')
  }
  return context
}