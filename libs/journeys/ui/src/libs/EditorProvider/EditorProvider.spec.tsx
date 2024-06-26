import { renderHook } from '@testing-library/react'
import { ReactNode, useContext } from 'react'

import type { TreeBlock } from '../block'

import { EditorContext, reducer } from './EditorProvider'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '.'
import { type JourneyAnalytics } from '../useJourneyAnalyticsQuery'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('EditorContext', () => {
  describe('reducer', () => {
    describe('SetActiveCanvasDetailsDrawerAction', () => {
      it('should set selected component', () => {
        const block: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          children: []
        }

        const state: EditorState = {
          steps: [block],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Edit,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetActiveCanvasDetailsDrawerAction',
            activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Footer
          })
        ).toEqual({
          ...state,
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Footer,
          selectedBlock: undefined
        })
      })
    })

    describe('SetActiveContentAction', () => {
      it('should set journey edit content component', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetActiveContentAction',
            activeContent: ActiveContent.Canvas
          })
        ).toEqual({
          ...state,
          activeContent: ActiveContent.Canvas
        })
      })
    })

    describe('SetActiveFabAction', () => {
      it('should set active fab', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetActiveFabAction',
            activeFab: ActiveFab.Save
          })
        ).toEqual({
          ...state,
          activeFab: ActiveFab.Save
        })
      })
    })

    describe('SetActiveSlideAction', () => {
      it('should set active slide and active content', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.Content,
          activeContent: ActiveContent.Social
        }
        expect(
          reducer(state, {
            type: 'SetActiveSlideAction',
            activeSlide: ActiveSlide.JourneyFlow
          })
        ).toEqual({
          ...state,
          activeContent: ActiveContent.Social,
          activeSlide: ActiveSlide.JourneyFlow
        })
      })

      it('should set active slide', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.Content,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetActiveSlideAction',
            activeSlide: ActiveSlide.Content
          })
        ).toEqual({
          ...state,
          activeSlide: ActiveSlide.Content
        })
      })
    })

    describe('SetSelectedAttributeIdAction', () => {
      it('should set selected attribute id', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedAttributeIdAction',
            selectedAttributeId: 'testId'
          })
        ).toEqual({
          ...state,
          selectedAttributeId: 'testId'
        })
      })
    })

    describe('SetSelectedBlockAction', () => {
      it('should set selected block', () => {
        const block: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          children: []
        }
        const state: EditorState = {
          steps: [block],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Edit,
          activeSlide: ActiveSlide.Content,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockOnlyAction',
            selectedBlock: block
          })
        ).toEqual({
          ...state,
          selectedBlock: block
        })
      })

      it('should change to content view when block selected', () => {
        const block: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          children: []
        }
        const state: EditorState = {
          steps: [block],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockAction',
            selectedBlock: block
          })
        ).toEqual({
          ...state,
          selectedBlock: block,
          activeSlide: ActiveSlide.Content
        })
      })
    })

    describe('SetSelectedBlockByIdAction', () => {
      it('should set selected block by id', () => {
        const block: TreeBlock = {
          id: 'card0.id',
          __typename: 'CardBlock',
          parentBlockId: null,
          backgroundColor: null,
          coverBlockId: null,
          parentOrder: 0,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: []
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          children: [block]
        }
        const state: EditorState = {
          steps: [step],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Footer,
          activeFab: ActiveFab.Edit,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockByIdAction',
            selectedBlockId: 'card0.id'
          })
        ).toEqual({
          ...state,
          selectedBlock: block,
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
        })
      })

      it('should set selected block to undefined when id not found', () => {
        const block: TreeBlock = {
          id: 'card0.id',
          __typename: 'CardBlock',
          parentBlockId: null,
          backgroundColor: null,
          coverBlockId: null,
          parentOrder: 0,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: []
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          children: [block]
        }
        const state: EditorState = {
          steps: [step],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockByIdAction',
            selectedBlockId: 'card1.id'
          })
        ).toEqual({
          ...state,
          selectedBlock: undefined
        })
      })

      it('should set selected block to undefined when id is undefined', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeContent: ActiveContent.Canvas,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockByIdAction'
          })
        ).toEqual({
          ...state,
          selectedBlock: undefined
        })
      })
    })

    describe('SetSelectedGoalUrlAction', () => {
      it('should set selected goal url', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedGoalUrlAction',
            selectedGoalUrl: 'testUrl'
          })
        ).toEqual({
          ...state,
          selectedGoalUrl: 'testUrl'
        })
      })
    })

    describe('SetSelectedStepAction', () => {
      it('should set selected step', () => {
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          children: []
        }
        const state: EditorState = {
          steps: [step],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedStepAction',
            selectedStep: step
          })
        ).toEqual({
          ...state,
          selectedStep: step,
          selectedBlock: step,
          active: undefined
        })
      })
    })

    describe('SetStepsAction', () => {
      it('should set steps', () => {
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          children: []
        }
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetStepsAction',
            steps: [step]
          })
        ).toEqual({
          ...state,
          steps: [step],
          selectedBlock: step,
          selectedStep: step
        })
      })

      it('should retain previously set steps and blocks', () => {
        const block: TreeBlock = {
          id: 'card0.id',
          __typename: 'CardBlock',
          parentBlockId: null,
          backgroundColor: null,
          coverBlockId: null,
          parentOrder: 0,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: []
        }
        const updatedBlock: TreeBlock = {
          ...block,
          fullscreen: true
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          children: [block]
        }
        const updatedStep: TreeBlock = {
          ...step,
          children: [updatedBlock]
        }
        const state: EditorState = {
          steps: [step],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          selectedBlock: block,
          selectedStep: step,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetStepsAction',
            steps: [updatedStep]
          })
        ).toEqual({
          ...state,
          steps: [updatedStep],
          selectedBlock: updatedBlock,
          selectedStep: updatedStep
        })
      })
    })

    describe('SetShowAnalyticsAction', () => {
      it('should set showAnalytics', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.Content,
          activeContent: ActiveContent.Social
        }

        expect(
          reducer(state, {
            type: 'SetShowAnalyticsAction',
            showAnalytics: true
          })
        ).toEqual({
          ...state,
          showAnalytics: true
        })
      })
    })

    describe('SetAnalyticsAction', () => {
      it('should set analytics', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }

        const analytics: JourneyAnalytics = {
          totalVisitors: 0,
          chatsStarted: 0,
          linksVisited: 0,
          referrers: { nodes: [], edges: [] },
          stepsStats: [],
          stepMap: new Map(),
          blockMap: new Map(),
          targetMap: new Map()
        }

        expect(
          reducer(state, {
            type: 'SetAnalyticsAction',
            analytics
          })
        ).toEqual({
          ...state,
          analytics
        })
      })
    })
  })

  describe('EditorProvider', () => {
    it('should set initial state', () => {
      const block: TreeBlock = {
        id: 'step0.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: []
      }

      const initialState = {
        steps: [block],
        selectedBlock: block,
        selectedStep: block
      }

      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <EditorProvider initialState={initialState}>{children}</EditorProvider>
      )
      const { result } = renderHook(() => useContext(EditorContext), {
        wrapper
      })

      expect(result.current.state).toEqual({
        steps: [block],
        selectedStep: block,
        selectedBlock: block,
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
        activeFab: ActiveFab.Add,
        activeSlide: ActiveSlide.Content,
        activeContent: ActiveContent.Canvas
      })
    })
  })
})
