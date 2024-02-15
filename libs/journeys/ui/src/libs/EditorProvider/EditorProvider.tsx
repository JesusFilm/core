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

export enum ActiveFab {
  Add = 0,
  Edit = 1,
  Save = 2
}
export enum ActiveContent {
  Canvas = 'canvas',
  Social = 'social',
  Action = 'action'
}
export enum ActiveSlide {
  JourneyFlow = 0,
  Content = 1,
  Drawer = 2
}
export interface EditorState {
  activeContent: ActiveContent
  activeFab: ActiveFab
  activeSlide: ActiveSlide
  selectedStep?: TreeBlock<StepBlock>
  selectedAttributeId?: string
  selectedBlock?: TreeBlock
  selectedComponent?: 'Footer' | 'AddBlock' | string
  steps?: Array<TreeBlock<StepBlock>>
}
interface SetActiveContentAction {
  type: 'SetActiveContentAction'
  component: ActiveContent
}
interface SetActiveFabAction {
  type: 'SetActiveFabAction'
  activeFab: ActiveFab
}
interface SetActiveSlideAction {
  type: 'SetActiveSlideAction'
  activeSlide: ActiveSlide
}
interface SetSelectedAttributeIdAction {
  type: 'SetSelectedAttributeIdAction'
  id?: string
}
interface SetSelectedBlockAction {
  type: 'SetSelectedBlockAction'
  block?: TreeBlock
}
export interface SetSelectedBlockByIdAction {
  type: 'SetSelectedBlockByIdAction'
  id?: string
}
interface SetSelectedComponentAction {
  type: 'SetSelectedComponentAction'
  component?: EditorState['selectedComponent']
}
export interface SetSelectedStepAction {
  type: 'SetSelectedStepAction'
  step?: TreeBlock<StepBlock>
}
interface SetStepsAction {
  type: 'SetStepsAction'
  steps: Array<TreeBlock<StepBlock>>
}
type EditorAction =
  | SetActiveContentAction
  | SetActiveFabAction
  | SetActiveSlideAction
  | SetSelectedAttributeIdAction
  | SetSelectedBlockAction
  | SetSelectedBlockByIdAction
  | SetSelectedComponentAction
  | SetSelectedStepAction
  | SetStepsAction

export const reducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'SetActiveContentAction':
      return {
        ...state,
        activeContent: action.component
      }
    case 'SetSelectedStepAction':
      return {
        ...state,
        selectedStep: action.step,
        selectedBlock: action.step,
        selectedComponent: undefined,
        activeContent: ActiveContent.Canvas
      }
    case 'SetActiveFabAction':
      return {
        ...state,
        activeFab: action.activeFab
      }
    case 'SetActiveSlideAction':
      return {
        ...state,
        activeContent:
          action.activeSlide === ActiveSlide.JourneyFlow
            ? ActiveContent.Canvas
            : state.activeContent,
        activeSlide: action.activeSlide
      }
    case 'SetSelectedAttributeIdAction':
      return { ...state, selectedAttributeId: action.id }
    case 'SetSelectedBlockAction':
      return {
        ...state,
        selectedBlock: action.block,
        selectedComponent: undefined,
        activeContent: ActiveContent.Canvas,
        activeSlide: ActiveSlide.Content
      }
    case 'SetSelectedBlockByIdAction':
      return {
        ...state,
        selectedBlock:
          action.id != null
            ? searchBlocks(state.steps ?? [], action.id)
            : undefined,
        selectedComponent: undefined,
        activeContent: ActiveContent.Canvas
      }
    case 'SetSelectedComponentAction':
      return {
        ...state,
        selectedComponent: action.component,
        selectedBlock: undefined
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
  }
}

export const EditorContext = createContext<{
  state: EditorState
  dispatch: Dispatch<EditorAction>
}>({
  state: {
    steps: [],
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas
  },
  dispatch: () => null
})

interface EditorProviderProps {
  children:
    | ((context: {
        state: EditorState
        dispatch: Dispatch<EditorAction>
      }) => ReactNode)
    | ReactNode
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
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas,
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
      {isFunction(children) ? children({ state, dispatch }) : children}
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
