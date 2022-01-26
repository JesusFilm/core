import { TreeBlock } from '../transformer'
import { reducer } from './EditorContext'
import { ActiveTab } from '.'

describe('EditorContext', () => {
  describe('reducer', () => {
    describe('SetSelectedStepAction', () => {
      it('should set selected step', () => {
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: null,
          children: []
        }
        const state = {
          steps: [step],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
        }
        expect(
          reducer(state, {
            type: 'SetSelectedStepAction',
            step
          })
        ).toEqual({
          ...state,
          selectedStep: step,
          selectedBlock: step
        })
      })
    })

    describe('SetSelectedBlockAction', () => {
      it('should set selected block', () => {
        const block: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: null,
          children: []
        }
        const state = {
          steps: [block],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockAction',
            block
          })
        ).toEqual({
          ...state,
          selectedBlock: block
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
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: []
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: null,
          children: [block]
        }
        const state = {
          steps: [step],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockByIdAction',
            id: 'card0.id'
          })
        ).toEqual({
          ...state,
          selectedBlock: block
        })
      })

      it('should set selected block to undefined when id not found', () => {
        const block: TreeBlock = {
          id: 'card0.id',
          __typename: 'CardBlock',
          parentBlockId: null,
          backgroundColor: null,
          coverBlockId: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: []
        }
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: null,
          children: [block]
        }
        const state = {
          steps: [step],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockByIdAction',
            id: 'card1.id'
          })
        ).toEqual({
          ...state,
          selectedBlock: undefined
        })
      })

      it('should set selected block to undefined when id is undefined', () => {
        const state = {
          steps: [],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
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
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
        }
        expect(
          reducer(state, {
            type: 'SetSelectedAttributeIdAction',
            id: 'testId'
          })
        ).toEqual({
          ...state,
          selectedAttributeId: 'testId'
        })
      })
    })

    describe('SetDrawerPropsAction', () => {
      it('should set drawer props action', () => {
        const state = {
          steps: [],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
        }
        expect(
          reducer(state, {
            type: 'SetDrawerPropsAction',
            title: 'abc',
            children: <></>,
            mobileOpen: true
          })
        ).toEqual({
          ...state,
          drawerTitle: 'abc',
          drawerChildren: <></>,
          drawerMobileOpen: true
        })
      })

      it('should set drawer props action with defaults', () => {
        const state = {
          steps: [],
          drawerTitle: 'abc',
          drawerChildren: <></>,
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
        }
        expect(
          reducer(state, {
            type: 'SetDrawerPropsAction'
          })
        ).toEqual({
          ...state,
          drawerTitle: undefined,
          drawerChildren: undefined,
          drawerMobileOpen: false
        })
      })
    })

    describe('SetDrawerMobileOpenAction', () => {
      it('should set drawerMobileOpen', () => {
        const state = {
          steps: [],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
        }
        expect(
          reducer(state, {
            type: 'SetDrawerMobileOpenAction',
            mobileOpen: true
          })
        ).toEqual({
          ...state,
          drawerMobileOpen: true
        })
      })
    })

    describe('SetActiveTabAction', () => {
      it('should set active tab', () => {
        const state = {
          steps: [],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
        }
        expect(
          reducer(state, {
            type: 'SetActiveTabAction',
            activeTab: ActiveTab.Properties
          })
        ).toEqual({
          ...state,
          activeTab: ActiveTab.Properties
        })
      })
    })

    describe('SetStepsAction', () => {
      it('should set steps', () => {
        const step: TreeBlock = {
          id: 'step0.id',
          __typename: 'StepBlock',
          parentBlockId: null,
          locked: false,
          nextBlockId: null,
          children: []
        }
        const state = {
          steps: [],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards
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
          drawerMobileOpen: false,
          activeTab: ActiveTab.Cards,
          selectedBlock: block,
          selectedStep: step
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
  })
})
