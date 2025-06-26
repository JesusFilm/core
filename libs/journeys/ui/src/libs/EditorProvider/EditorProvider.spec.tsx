import { renderHook } from '@testing-library/react'
import { ReactNode, useContext } from 'react'

import type { TreeBlock } from '../block'
import { type JourneyAnalytics } from '../useJourneyAnalyticsQuery'

import { EditorContext, reducer } from './EditorProvider'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  EditorState
} from '.'

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
          slug: null,
          children: []
        }

        const state: EditorState = {
          steps: [block],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetActiveCanvasDetailsDrawerAction',
            activeCanvasDetailsDrawer:
              ActiveCanvasDetailsDrawer.JourneyAppearance
          })
        ).toEqual({
          ...state,
          activeCanvasDetailsDrawer:
            ActiveCanvasDetailsDrawer.JourneyAppearance,
          selectedBlock: undefined
        })
      })
    })

    describe('SetActiveContentAction', () => {
      it('should set journey edit content component', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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

    describe('SetActiveSlideAction', () => {
      it('should set active slide and active content', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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
          slug: null,
          children: []
        }
        const state: EditorState = {
          steps: [block],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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

      it('should not set ActiveSlide when showAnalytics is true', () => {
        const block: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: []
        }

        const state: EditorState = {
          steps: [block],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas,
          showAnalytics: true,
          selectedBlockId: 'step0.id',
          selectedBlock: {
            id: 'step0.id',
            __typename: 'StepBlock',
            parentBlockId: null,
            parentOrder: 0,
            locked: false,
            nextBlockId: null,
            slug: null,
            children: []
          }
        }
        const newState = reducer(state, {
          type: 'SetActiveSlideAction',
          activeSlide: ActiveSlide.Content
        })

        expect(newState).toEqual(state)
      })

      it('should change to content view when block selected', () => {
        const block: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: []
        }
        const state: EditorState = {
          steps: [block],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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
          selectedBlockId: 'step0.id',
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
          backdropBlur: null,
          children: []
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: [block]
        }
        const state: EditorState = {
          steps: [step],
          activeCanvasDetailsDrawer:
            ActiveCanvasDetailsDrawer.JourneyAppearance,
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
          selectedBlockId: 'card0.id',
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
          backdropBlur: null,
          children: []
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: [block]
        }
        const state: EditorState = {
          steps: [step],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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
          selectedBlockId: 'card1.id',
          selectedBlock: undefined
        })
      })

      it('should set selected block to undefined when id is undefined', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeContent: ActiveContent.Canvas,
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

    describe('SetSelectedStepByIdAction', () => {
      it('should set selected step by id', () => {
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
          backdropBlur: null,
          children: []
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: [block]
        }
        const step2: TreeBlock = {
          id: 'step1.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: [block]
        }
        const state: EditorState = {
          steps: [step, step2],
          activeCanvasDetailsDrawer:
            ActiveCanvasDetailsDrawer.JourneyAppearance,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        } as unknown as EditorState
        expect(
          reducer(state, {
            type: 'SetSelectedStepByIdAction',
            selectedStepId: 'step1.id'
          })
        ).toEqual({
          ...state,
          selectedStep: step2,
          selectedBlock: step2,
          selectedBlockId: 'step1.id',
          selectedStepId: 'step1.id',
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
        })
      })

      it('should set selected step to undefined when id not found', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        } as unknown as EditorState
        expect(
          reducer(state, {
            type: 'SetSelectedStepByIdAction',
            selectedStepId: 'step1.id'
          })
        ).toEqual({
          ...state,
          selectedStepId: 'step1.id',
          selectedStep: undefined,
          selectedBlock: undefined,
          selectedBlockId: 'step1.id'
        })
      })

      it('should set selected step to undefined when id is undefined', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeContent: ActiveContent.Canvas,
          activeSlide: ActiveSlide.JourneyFlow
        } as unknown as EditorState
        expect(
          reducer(state, {
            type: 'SetSelectedStepByIdAction'
          })
        ).toEqual({
          ...state,
          selectedStep: undefined
        })
      })
    })

    describe('SetSelectedGoalUrlAction', () => {
      it('should set selected goal url', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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
          slug: null,
          children: []
        }
        const state: EditorState = {
          steps: [step],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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
          selectedStepId: 'step0.id',
          selectedBlock: step,
          selectedBlockId: 'step0.id',
          active: undefined
        })
      })
    })

    describe('SetStepsAction', () => {
      it('should select first step when no previous selection exists', () => {
        const step1: TreeBlock = {
          id: 'step1.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: []
        }
        const step2: TreeBlock = { ...step1, id: 'step2.id', parentOrder: 1 }
        const state: EditorState = {
          steps: [],
          selectedStep: undefined,
          selectedStepId: undefined,
          selectedBlock: undefined,
          selectedBlockId: undefined,
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetStepsAction',
            steps: [step1, step2]
          })
        ).toEqual({
          ...state,
          steps: [step1, step2],
          selectedStep: step1,
          selectedStepId: step1.id,
          selectedBlock: step1,
          selectedBlockId: step1.id
        })
      })

      it('should maintain existing selections when found in new steps', () => {
        const originalBlock: TreeBlock = {
          id: 'original-block.id',
          __typename: 'CardBlock',
          parentBlockId: null,
          backgroundColor: null,
          coverBlockId: null,
          parentOrder: 0,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          backdropBlur: null,
          children: []
        }
        const originalStep: TreeBlock = {
          id: 'original-step.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: [originalBlock]
        }
        const newBlock: TreeBlock = { ...originalBlock, id: 'new-block.id' }
        const newStep: TreeBlock = {
          ...originalStep,
          id: 'new-step.id',
          parentOrder: 1,
          children: [newBlock]
        }
        const state: EditorState = {
          steps: [originalStep],
          selectedStep: originalStep,
          selectedStepId: originalStep.id,
          selectedBlock: originalBlock,
          selectedBlockId: originalBlock.id,
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetStepsAction',
            steps: [originalStep, newStep]
          })
        ).toEqual({
          ...state,
          steps: [originalStep, newStep],
          selectedStep: originalStep,
          selectedStepId: originalStep.id,
          selectedBlock: originalBlock,
          selectedBlockId: originalBlock.id
        })
      })

      it('should fallback to first step when previous selection no longer exists', () => {
        const step1: TreeBlock = {
          id: 'step1.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: []
        }
        const step2: TreeBlock = { ...step1, id: 'step2.id', parentOrder: 1 }
        const state: EditorState = {
          steps: [],
          selectedStepId: 'non-existent-id',
          selectedStep: undefined,
          selectedBlockId: 'non-existent-block-id',
          selectedBlock: undefined,
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetStepsAction',
            steps: [step1, step2]
          })
        ).toEqual({
          ...state,
          steps: [step1, step2],
          selectedStep: step1,
          selectedStepId: step1.id,
          selectedBlock: step1,
          selectedBlockId: step1.id
        })
      })

      it('should fallback block when step survives but block is deleted', () => {
        const cardBlock: TreeBlock = {
          id: 'card.id',
          __typename: 'CardBlock',
          parentBlockId: null,
          backgroundColor: null,
          coverBlockId: null,
          parentOrder: 0,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          backdropBlur: null,
          children: []
        }
        const persistentStep: TreeBlock = {
          id: 'persistent-step.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: [cardBlock]
        }
        const newStep: TreeBlock = {
          id: 'new-step.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 1,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: []
        }
        // Updated version of persistent step without the nested card block
        const updatedPersistentStep: TreeBlock = {
          ...persistentStep,
          children: []
        }
        const state: EditorState = {
          steps: [persistentStep],
          selectedStepId: 'persistent-step.id',
          selectedStep: persistentStep,
          selectedBlockId: 'card.id', // This block will no longer exist
          selectedBlock: cardBlock,
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetStepsAction',
            steps: [updatedPersistentStep, newStep]
          })
        ).toEqual({
          ...state,
          steps: [updatedPersistentStep, newStep],
          selectedStep: updatedPersistentStep,
          selectedStepId: updatedPersistentStep.id,
          selectedBlock: updatedPersistentStep, // Block falls back to first step
          selectedBlockId: updatedPersistentStep.id
        })
      })
    })

    describe('SetEditorFocusAction', () => {
      it('should set editor state with given overrides', () => {
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
          backdropBlur: null,
          children: []
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: [block]
        }
        const state: EditorState = {
          steps: [step],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            activeCanvasDetailsDrawer:
              ActiveCanvasDetailsDrawer.JourneyAppearance,
            activeContent: ActiveContent.Canvas,
            activeSlide: ActiveSlide.Content,
            selectedAttributeId: 'selectedAttributeId',
            selectedBlock: block,
            selectedGoalUrl: 'https://www.example.com',
            selectedStep: step,
            selectedStepId: 'step0.id',
            selectedBlockId: block.id,
            type: 'SetEditorFocusAction'
          })
        ).toEqual({
          activeCanvasDetailsDrawer:
            ActiveCanvasDetailsDrawer.JourneyAppearance,
          activeContent: 'canvas',
          activeSlide: ActiveSlide.Content,
          selectedAttributeId: 'selectedAttributeId',
          selectedBlock: block,
          selectedGoalUrl: 'https://www.example.com',
          selectedBlockId: block.id,
          selectedStepId: 'step0.id',
          selectedStep: {
            __typename: 'StepBlock',
            children: [block],
            id: 'step0.id',
            locked: false,
            nextBlockId: null,
            parentBlockId: null,
            parentOrder: 0,
            slug: null
          },
          steps: [step]
        })
      })

      it('should retain previous state for overrides not provided', () => {
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
          backdropBlur: null,
          children: []
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: null,
          children: [block]
        }

        const state: EditorState = {
          steps: [step],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
          activeSlide: ActiveSlide.JourneyFlow,
          selectedBlock: block,
          selectedStep: step,
          activeContent: ActiveContent.Canvas
        }
        expect(reducer(state, { type: 'SetEditorFocusAction' })).toEqual(state)
      })
    })

    describe('SetShowAnalyticsAction', () => {
      it('should set showAnalytics', () => {
        const state: EditorState = {
          steps: [],
          activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
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
    const block: TreeBlock = {
      id: 'step0.id',
      __typename: 'StepBlock',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: []
    }

    const initialState = {
      steps: [block],
      selectedBlock: block,
      selectedStep: block
    }

    it('should set initial state', () => {
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
        selectedStepId: 'step0.id',
        selectedBlockId: 'step0.id',
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
        activeSlide: ActiveSlide.Content,
        activeContent: ActiveContent.Canvas
      })
    })

    it('should set initial state for discrete states', () => {
      const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
        <EditorProvider
          initialState={{
            ...initialState,
            activeCanvasDetailsDrawer:
              ActiveCanvasDetailsDrawer.JourneyAppearance,
            activeSlide: ActiveSlide.JourneyFlow,
            activeContent: ActiveContent.Social
          }}
        >
          {children}
        </EditorProvider>
      )
      const { result } = renderHook(() => useContext(EditorContext), {
        wrapper
      })

      expect(result.current.state).toEqual({
        steps: [block],
        selectedStep: block,
        selectedBlock: block,
        selectedStepId: 'step0.id',
        selectedBlockId: 'step0.id',
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.JourneyAppearance,
        activeSlide: ActiveSlide.JourneyFlow,
        activeContent: ActiveContent.Social
      })
    })
  })
})
