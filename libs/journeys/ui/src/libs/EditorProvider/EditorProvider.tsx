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
import { CommandProvider } from '../CommandProvider'
import { searchBlocks } from '../searchBlocks'
import { type JourneyAnalytics } from '../useJourneyAnalyticsQuery'

export enum ActiveContent {
  Canvas = 'canvas',
  Social = 'social',
  Goals = 'goals'
}
export enum ActiveSlide {
  JourneyFlow = 0,
  Content = 1,
  Drawer = 2
}
export enum ActiveCanvasDetailsDrawer {
  Properties = 0,
  JourneyAppearance = 1,
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
   * selectedBlockId indicates which block is currently selected on the Canvas
   * and the JourneyFlow. It also indicates which attributes should be
   * displayed in relation to the SelectedBlock.
   */
  selectedBlockId?: string
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
  /**
   * selectedStepId indicates which step is currently displayed by the Canvas
   * and the JourneyFlow. However, this can be used to selected the step before
   * it is added to the steps array i.e in creation mutations. This is important as running a dispatch
   * action to set the selected step before it is added to the steps array will
   * not work.
   */
  selectedStepId?: string
  steps?: Array<TreeBlock<StepBlock>>
}
interface SetActiveContentAction {
  type: 'SetActiveContentAction'
  activeContent: ActiveContent
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
export interface SetSelectedStepByIdAction {
  type: 'SetSelectedStepByIdAction'
  selectedStepId?: string
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

/**
 * SetEditorFocusAction is a special action that allows setting multiple state
 * properties at once. This is primarily used to set the UI position of the
 * editor.
 */
export interface SetEditorFocusAction {
  type: 'SetEditorFocusAction'
  activeCanvasDetailsDrawer?: ActiveCanvasDetailsDrawer
  activeContent?: ActiveContent
  activeSlide?: ActiveSlide
  selectedAttributeId?: string
  selectedBlock?: TreeBlock
  selectedBlockId?: string
  selectedGoalUrl?: string
  selectedStep?: TreeBlock<StepBlock>
  selectedStepId?: string
}
export type EditorAction =
  | SetActiveCanvasDetailsDrawerAction
  | SetActiveContentAction
  | SetActiveSlideAction
  | SetSelectedAttributeIdAction
  | SetSelectedBlockAction
  | SetSelectedBlockOnlyAction
  | SetSelectedBlockByIdAction
  | SetSelectedGoalUrlAction
  | SetSelectedStepAction
  | SetSelectedStepByIdAction
  | SetStepsAction
  | SetShowAnalyticsAction
  | SetAnalyticsAction
  | SetEditorFocusAction
  | SetSelectedStepByIdAction

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
    case 'SetActiveSlideAction':
      return {
        ...state,
        activeSlide: state.showAnalytics === true ? 0 : action.activeSlide
      }
    case 'SetSelectedAttributeIdAction':
      return {
        ...state,
        selectedAttributeId: action.selectedAttributeId
      }
    case 'SetSelectedBlockAction':
      return {
        ...state,
        selectedBlockId: action.selectedBlock?.id,
        selectedBlock: action.selectedBlock,
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
        activeContent: ActiveContent.Canvas,
        activeSlide: ActiveSlide.Content
      }
    case 'SetSelectedBlockOnlyAction':
      return {
        ...state,
        selectedBlock: action.selectedBlock
      }
    case 'SetSelectedBlockByIdAction':
      return {
        ...state,
        selectedBlockId: action.selectedBlockId,
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
        selectedStepId: action.selectedStep?.id,
        selectedStep: action.selectedStep,
        selectedBlockId: action.selectedStep?.id,
        selectedBlock: action.selectedStep,
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
        activeContent: ActiveContent.Canvas
      }
    case 'SetSelectedStepByIdAction': {
      const selectedStep =
        action.selectedStepId != null
          ? (searchBlocks(state.steps ?? [], action.selectedStepId, {
              filter: 'searchStepsOnly'
            }) as TreeBlock<StepBlock>)
          : undefined
      return {
        ...state,
        selectedStepId: action.selectedStepId,
        selectedStep,
        selectedBlockId: action.selectedStepId,
        selectedBlock: selectedStep,
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
        activeContent: ActiveContent.Canvas
      }
    }
    case 'SetStepsAction': {
      const selectedStep =
        state.selectedStepId != null
          ? (action.steps.find(({ id }) => id === state.selectedStepId) ??
            action.steps[0])
          : action.steps[0]
      const selectedBlock =
        state.selectedBlockId != null
          ? (searchBlocks(action.steps, state.selectedBlockId) ??
            action.steps[0])
          : action.steps[0]
      return {
        ...state,
        steps: action.steps,
        selectedStep,
        selectedStepId: selectedStep?.id,
        selectedBlock,
        selectedBlockId: selectedBlock?.id
      }
    }
    case 'SetShowAnalyticsAction':
      return {
        ...state,
        showAnalytics: action.showAnalytics
      }
    case 'SetAnalyticsAction':
      return {
        ...state,
        analytics: action.analytics
      }
    case 'SetEditorFocusAction': {
      let stateCopy = { ...state }
      const {
        activeCanvasDetailsDrawer,
        activeContent,
        activeSlide,
        selectedAttributeId,
        selectedGoalUrl,
        selectedBlock,
        selectedBlockId,
        selectedStep,
        selectedStepId
      } = action
      if (selectedStep != null)
        stateCopy = reducer(stateCopy, {
          type: 'SetSelectedStepAction',
          selectedStep
        })
      if (selectedStepId != null)
        stateCopy = reducer(stateCopy, {
          type: 'SetSelectedStepByIdAction',
          selectedStepId
        })
      if (selectedBlock != null)
        stateCopy = reducer(stateCopy, {
          type: 'SetSelectedBlockAction',
          selectedBlock
        })
      if (selectedBlockId != null)
        stateCopy = reducer(stateCopy, {
          type: 'SetSelectedBlockByIdAction',
          selectedBlockId
        })
      if (activeSlide != null)
        stateCopy = reducer(stateCopy, {
          type: 'SetActiveSlideAction',
          activeSlide
        })
      if (activeContent != null)
        stateCopy = reducer(stateCopy, {
          type: 'SetActiveContentAction',
          activeContent
        })
      if (activeCanvasDetailsDrawer != null)
        stateCopy = reducer(stateCopy, {
          type: 'SetActiveCanvasDetailsDrawerAction',
          activeCanvasDetailsDrawer
        })
      if (selectedAttributeId != null)
        stateCopy = reducer(stateCopy, {
          type: 'SetSelectedAttributeIdAction',
          selectedAttributeId
        })
      if (selectedGoalUrl != null)
        stateCopy = reducer(stateCopy, {
          type: 'SetSelectedGoalUrlAction',
          selectedGoalUrl
        })
      return stateCopy
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

    if (initialState?.activeCanvasDetailsDrawer != null) {
      dispatch({
        type: 'SetActiveCanvasDetailsDrawerAction',
        activeCanvasDetailsDrawer: initialState.activeCanvasDetailsDrawer
      })
    }

    if (initialState?.activeContent != null) {
      dispatch({
        type: 'SetActiveContentAction',
        activeContent: initialState.activeContent
      })
    }

    if (initialState?.activeSlide != null) {
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: initialState.activeSlide
      })
    }
  }, [
    initialState?.selectedStep,
    initialState?.selectedBlock,
    initialState?.activeCanvasDetailsDrawer,
    initialState?.activeContent,
    initialState?.activeSlide
  ])

  return (
    <EditorContext.Provider value={{ state, dispatch }}>
      <CommandProvider>
        {isFunction(children) ? children({ state, dispatch }) : children}
      </CommandProvider>
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
