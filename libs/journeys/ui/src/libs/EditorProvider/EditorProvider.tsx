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
import { type JourneyAnalytics } from '../useJourneyAnalyticsQuery'

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
export enum ActiveCanvasDetailsDrawer {
  Properties = 0,
  Footer = 1,
  AddBlock = 2
}
export interface EditorState {
  /**
   * activeCanvasDetailsDrawer indicates which drawer is currently visible on
   * CanvasDetails.
   */
  activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer
  /**
   * activeContent indicates which content is visible on the Content Slide and
   * the Settings Slide (the content and settings slides correspond to each
   * other).
   */
  activeContent: ActiveContent
  /**
   * activeFab indicates which Fab to display. If the user is currently editing
   * a text field this should be set to “Save”. If the user based on the
   * selected block can edit a text field the field should be set to “Edit”.
   * Otherwise this should be set to “Add”.
   */
  activeFab: ActiveFab
  /**
   * activeSlide indicates which slide is primarily in view of the user.
   * Note that Settings should only be set as active when on a mobile device.
   * */
  activeSlide: ActiveSlide
  /**
   * showAnalytics indicates if the analytics should be shown.
   * */
  showAnalytics?: boolean
  /**
   * store the result of the transformed GetJourneyAnalytics query.
   * */
  analytics?: JourneyAnalytics
  /**
   * selectedAttributeId indicates which attribute is current expanded on
   * Properties. Each attribute is in a collapsible accordion.
   */

  selectedAttributeId?: string
  /**
   * selectedBlock indicates which block is currently selected on the Canvas
   * and the JourneyFlow. It also indicates which attributes should be
   * displayed in relation to the SelectedBlock.
   */
  selectedBlock?: TreeBlock
  /**
   * selectedGoalUrl indicates which Goal to show on GoalDetails for editing.
   * If SelectedGoalUrl is unset then the information about goals will be shown.
   */
  selectedGoalUrl?: string
  /**
   * selectedStep indicates which step is currently displayed by the Canvas and
   * the JourneyFlow.
   */
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
interface SetSelectedBlockOnlyAction {
  type: 'SetSelectedBlockOnlyAction'
  selectedBlock?: TreeBlock
}
export interface SetSelectedBlockByIdAction {
  type: 'SetSelectedBlockByIdAction'
  selectedBlockId?: string
}
interface SetActiveCanvasDetailsDrawerAction {
  type: 'SetActiveCanvasDetailsDrawerAction'
  activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer
}
interface SetSelectedGoalUrlAction {
  type: 'SetSelectedGoalUrlAction'
  selectedGoalUrl?: string
}
export interface SetSelectedStepAction {
  type: 'SetSelectedStepAction'
  selectedStep?: TreeBlock<StepBlock>
}
interface SetStepsAction {
  type: 'SetStepsAction'
  steps: Array<TreeBlock<StepBlock>>
}
interface SetShowAnalyticsAction {
  type: 'SetShowAnalyticsAction'
  showAnalytics: boolean
}
interface SetAnalyticsAction {
  type: 'SetAnalyticsAction'
  analytics?: JourneyAnalytics
}

type EditorAction =
  | SetActiveCanvasDetailsDrawerAction
  | SetActiveContentAction
  | SetActiveFabAction
  | SetActiveSlideAction
  | SetSelectedAttributeIdAction
  | SetSelectedBlockAction
  | SetSelectedBlockOnlyAction
  | SetSelectedBlockByIdAction
  | SetSelectedGoalUrlAction
  | SetSelectedStepAction
  | SetStepsAction
  | SetShowAnalyticsAction
  | SetAnalyticsAction

export const reducer = (
  state: EditorState,
  action: EditorAction
): EditorState => {
  switch (action.type) {
    case 'SetActiveCanvasDetailsDrawerAction':
      return {
        ...state,
        activeCanvasDetailsDrawer: action.activeCanvasDetailsDrawer
      }
    case 'SetActiveContentAction':
      return {
        ...state,
        activeContent: action.activeContent
      }
    case 'SetActiveFabAction':
      return {
        ...state,
        activeFab: action.activeFab
      }
    case 'SetActiveSlideAction':
      return {
        ...state,
        activeContent: state.activeContent,
        activeSlide: action.activeSlide
      }
    case 'SetSelectedAttributeIdAction':
      return { ...state, selectedAttributeId: action.selectedAttributeId }
    case 'SetSelectedBlockAction':
      if (state.showAnalytics === true) return state

      return {
        ...state,
        selectedBlock: action.selectedBlock,
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
        activeContent: ActiveContent.Canvas,
        activeSlide: ActiveSlide.Content
      }
    case 'SetSelectedBlockOnlyAction':
      return { ...state, selectedBlock: action.selectedBlock }
    case 'SetSelectedBlockByIdAction':
      return {
        ...state,
        selectedBlock:
          action.selectedBlockId != null
            ? searchBlocks(state.steps ?? [], action.selectedBlockId)
            : undefined,
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
        activeContent: ActiveContent.Canvas
      }
    case 'SetSelectedGoalUrlAction':
      return {
        ...state,
        selectedGoalUrl: action.selectedGoalUrl
      }
    case 'SetSelectedStepAction':
      return {
        ...state,
        selectedStep: action.selectedStep,
        selectedBlock: action.selectedStep,
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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
    case 'SetShowAnalyticsAction':
      return {
        ...state,
        showAnalytics: action.showAnalytics
      }
    case 'SetAnalyticsAction': {
      return {
        ...state,
        analytics: action.analytics
      }
    }
  }
}

export const EditorContext = createContext<{
  state: EditorState
  dispatch: Dispatch<EditorAction>
}>({
  state: {
    steps: [],
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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
  const [state, dispatch] = useReducer(reducer, {
    steps: [],
    selectedStep: initialState?.steps?.[0],
    selectedBlock: initialState?.steps?.[0],
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas,
    ...initialState
  })

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
