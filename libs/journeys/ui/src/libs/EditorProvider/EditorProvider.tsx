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

export enum ActiveContent {
  Canvas = 'canvas',
  Social = 'social',
  Goals = 'goals'
}
export enum ActiveFab {
  Add = 0,
  Edit = 1,
  Save = 2
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
  selectedAttributeId?: string
  selectedBlock?: TreeBlock
  selectedComponent?: 'Footer' | 'AddBlock' | string
  selectedStep?: TreeBlock<StepBlock>
  steps?: Array<TreeBlock<StepBlock>>
}
interface SetActiveContentAction {
  type: 'SetActiveContentAction'
  activeContent: ActiveContent
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
  selectedAttributeId?: string
}
interface SetSelectedBlockAction {
  type: 'SetSelectedBlockAction'
  selectedBlock?: TreeBlock
}
export interface SetSelectedBlockByIdAction {
  type: 'SetSelectedBlockByIdAction'
  selectedBlockId?: string
}
interface SetSelectedComponentAction {
  type: 'SetSelectedComponentAction'
  selectedComponent?: EditorState['selectedComponent']
}
export interface SetSelectedStepAction {
  type: 'SetSelectedStepAction'
  selectedStep?: TreeBlock<StepBlock>
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
      return { ...state, selectedAttributeId: action.selectedAttributeId }
    case 'SetSelectedBlockAction':
      return {
        ...state,
        selectedBlock: action.selectedBlock,
        selectedComponent: undefined,
        activeContent: ActiveContent.Canvas,
        activeSlide: ActiveSlide.Content
      }
    case 'SetSelectedBlockByIdAction':
      return {
        ...state,
        selectedBlock:
          action.selectedBlockId != null
            ? searchBlocks(state.steps ?? [], action.selectedBlockId)
            : undefined,
        selectedComponent: undefined,
        activeContent: ActiveContent.Canvas
      }
    case 'SetSelectedComponentAction':
      return {
        ...state,
        selectedComponent: action.selectedComponent,
        selectedBlock: undefined
      }
    case 'SetSelectedStepAction':
      return {
        ...state,
        selectedStep: action.selectedStep,
        selectedBlock: action.selectedStep,
        selectedComponent: undefined,
        activeContent: ActiveContent.Canvas
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
        selectedStep: initialState.selectedStep
      })
      stepRef.current = true

      if (initialState?.selectedBlock != null)
        dispatch({
          type: 'SetSelectedBlockAction',
          selectedBlock: initialState.selectedBlock
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
