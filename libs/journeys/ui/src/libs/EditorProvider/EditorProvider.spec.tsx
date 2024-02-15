import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import type { TreeBlock } from '../block'

import {
  ActiveContent,
  ActiveSlide,
  EditorProvider,
  reducer,
  useEditor
} from './EditorProvider'

import { ActiveFab } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('EditorContext', () => {
  describe('reducer', () => {
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
        const state = {
          steps: [step],
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
          selectedComponent: undefined
        })
      })
    })

    describe('SetSelectedComponentAction', () => {
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

        const state = {
          steps: [block],
          activeFab: ActiveFab.Edit,
          activeSlide: ActiveSlide.JourneyFlow,
          activeContent: ActiveContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedComponentAction',
            selectedComponent: 'Footer'
          })
        ).toEqual({
          ...state,
          selectedComponent: 'Footer',
          selectedBlock: undefined
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
        const state = {
          steps: [block],
          activeFab: ActiveFab.Edit,
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
          selectedComponent: undefined
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
        const state = {
          steps: [step],
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
          selectedComponent: undefined
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
        const state = {
          steps: [step],
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
        const state = {
          steps: [],
          activeFab: ActiveFab.Add,
          activeSlide: ActiveSlide.JourneyFlow,

          activeContent: ActiveContent.Canvas
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

    describe('SetSelectedAttributeIdAction', () => {
      it('should set selected attribute id', () => {
        const state = {
          steps: [],
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

    describe('SetActiveFabAction', () => {
      it('should set active fab', () => {
        const state = {
          steps: [],
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
        const state = {
          steps: [],
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
        const state = {
          steps: [step],
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

    describe('SetJourneyEditContentComponentAction', () => {
      it('should set journey edit content component', () => {
        const state = {
          steps: [],
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
  })
})
