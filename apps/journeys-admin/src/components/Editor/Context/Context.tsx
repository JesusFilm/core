import { TreeBlock } from '@core/journeys/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../../__generated__/BlockFields'
import {
  createContext,
  Dispatch,
  ReactElement,
  ReactNode,
  useReducer
} from 'react'

export enum ActiveTab {
  Cards = 0,
  Properties = 1,
  Blocks = 2
}
interface EditorState {
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

type EditorAction =
  | SetSelectedStepAction
  | SetSelectedBlockAction
  | SetSelectedAttributeIdAction
  | SetDrawerPropsAction
  | SetDrawerMobileOpenAction
  | SetActiveTabAction

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
    case 'SetActiveTabAction':
      return {
        ...state,
        activeTab: action.activeTab
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

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {children}
    </EditorContext.Provider>
  )
}
