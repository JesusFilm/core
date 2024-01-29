import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import isFunction from 'lodash/isFunction'
import {
  Dispatch,
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef
} from 'react'

import type { TreeBlock } from '../block'
import { BlockFields_StepBlock as StepBlock } from '../block/__generated__/BlockFields'
import { searchBlocks } from '../searchBlocks'

export enum ActiveTab {
  Journey = 0,
  Properties = 1,
  Blocks = 2
}

export enum ActiveFab {
  Add = 0,
  Edit = 1,
  Save = 2
}

export enum ActiveJourneyEditContent {
  Canvas = 'canvas',
  SocialPreview = 'social',
  Action = 'action',
  JourneyFlow = 'journeyFlow'
}

export enum ActiveSlide {
  JourneyFlow = 0,
  Canvas = 1,
  Drawer = 2
}

export interface EditorState {
  steps?: Array<TreeBlock<StepBlock>>
  selectedStep?: TreeBlock<StepBlock>
  selectedComponent?: string
  selectedBlock?: TreeBlock
  selectedAttributeId?: string
  drawerTitle?: string
  drawerChildren?: ReactNode
  drawerMobileOpen: boolean
  activeFab: ActiveFab
  activeSlide?: ActiveSlide
  activeTab: ActiveTab
  journeyEditContentComponent: ActiveJourneyEditContent
  smUp?: boolean
}

export interface SetSelectedStepAction {
  type: 'SetSelectedStepAction'
  step?: TreeBlock<StepBlock>
}
interface SetSelectedComponentAction {
  type: 'SetSelectedComponentAction'
  component?: string
}

interface SetSelectedBlockAction {
  type: 'SetSelectedBlockAction'
  block?: TreeBlock
}

export interface SetSelectedBlockByIdAction {
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

interface SetActiveFabAction {
  type: 'SetActiveFabAction'
  activeFab: ActiveFab
}

interface SetActiveJourneyEditContentAction {
  type: 'SetJourneyEditContentAction'
  component: ActiveJourneyEditContent
}

interface SetStepsAction {
  type: 'SetStepsAction'
  steps: Array<TreeBlock<StepBlock>>
}

interface SetSmUpAction {
  type: 'SetSmUpAction'
  smUp: boolean
}

type EditorAction =
  | SetSelectedStepAction
  | SetSelectedComponentAction
  | SetSelectedBlockAction
  | SetSelectedBlockByIdAction
  | SetSelectedAttributeIdAction
  | SetDrawerPropsAction
  | SetDrawerMobileOpenAction
  | SetActiveTabAction
  | SetActiveFabAction
  | SetStepsAction
  | SetActiveJourneyEditContentAction
  | SetSmUpAction

export const reducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'SetSelectedStepAction':
      return {
        ...state,
        selectedStep: action.step,
        selectedBlock: action.step,
        selectedComponent: undefined,
        journeyEditContentComponent: ActiveJourneyEditContent.Canvas,
        activeSlide: ActiveSlide.Canvas
      }
    case 'SetSelectedComponentAction':
      return {
        ...state,
        selectedComponent: action.component,
        selectedBlock: undefined,
        journeyEditContentComponent: ActiveJourneyEditContent.Canvas
      }
    case 'SetSelectedBlockAction':
      return {
        ...state,
        selectedBlock: action.block,
        selectedComponent: undefined,
        journeyEditContentComponent: ActiveJourneyEditContent.Canvas
      }
    case 'SetSelectedBlockByIdAction':
      return {
        ...state,
        selectedBlock:
          action.id != null
            ? searchBlocks(state.steps ?? [], action.id)
            : undefined,
        selectedComponent: undefined,
        journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
    case 'SetActiveFabAction':
      return {
        ...state,
        activeFab: action.activeFab
      }
    case 'SetStepsAction':
      return {
        ...state,
        steps: action.steps,
        selectedStep:
          state.selectedStep != null
            ? action.steps.find(({ id }) => id === state.selectedStep?.id)
            : action.steps[0],
        selectedBlock:
          state.selectedBlock != null
            ? searchBlocks(action.steps, state.selectedBlock.id)
            : action.steps[0]
      }
    case 'SetJourneyEditContentAction':
      return {
        ...state,
        journeyEditContentComponent: action.component
      }
    case 'SetSmUpAction':
      return {
        ...state,
        smUp: action.smUp
      }
  }
}

export const EditorContext = createContext<{
  state: EditorState
  dispatch: Dispatch<EditorAction>
}>({
  state: {
    steps: [],
    drawerMobileOpen: false,
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeTab: ActiveTab.Journey,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas
  },
  dispatch: () => null
})

interface EditorProviderProps {
  children: ((state: EditorState) => ReactNode) | ReactNode
  initialState?: Partial<EditorState>
}

export function EditorProvider({
  children,
  initialState
}: EditorProviderProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [state, dispatch] = useReducer(reducer, {
    steps: [],
    selectedStep: initialState?.steps?.[0],
    selectedBlock: initialState?.steps?.[0],
    drawerMobileOpen: false,
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeTab: ActiveTab.Journey,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas,
    smUp,
    ...initialState
  })

  useEffect(() => dispatch({ type: 'SetSmUpAction', smUp }), [smUp])
  useEffect(() => {
    if (initialState?.steps != null)
      dispatch({ type: 'SetStepsAction', steps: initialState.steps })
  }, [initialState?.steps])

  // only run once
  const stepRef = useRef(false)
  useEffect(() => {
    if (stepRef.current) return
    if (initialState?.selectedStep != null) {
      dispatch({
        type: 'SetSelectedStepAction',
        step: initialState.selectedStep
      })
      stepRef.current = true

      if (initialState?.selectedBlock != null)
        dispatch({
          type: 'SetSelectedBlockAction',
          block: initialState.selectedBlock
        })
    }
  }, [initialState?.selectedStep, initialState?.selectedBlock])

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      {isFunction(children) ? children(state) : children}
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
