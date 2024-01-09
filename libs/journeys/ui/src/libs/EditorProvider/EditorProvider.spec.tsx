import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import type { TreeBlock } from '../block'

import {
  ActiveJourneyEditContent,
  EditorProvider,
  reducer,
  useEditor
} from './EditorProvider'

import { ActiveFab, ActiveTab } from '.'

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
          drawerMobileOpen: false,
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedStepAction',
            step
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
          drawerMobileOpen: false,
          activeFab: ActiveFab.Edit,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedComponentAction',
            component: 'Footer'
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
          drawerMobileOpen: false,
          activeFab: ActiveFab.Edit,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockAction',
            block
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
          drawerMobileOpen: false,
          activeFab: ActiveFab.Edit,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetSelectedBlockByIdAction',
            id: 'card0.id'
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
          drawerMobileOpen: false,
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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

    describe('SetActiveFabAction', () => {
      it('should set active fab', () => {
        const state = {
          steps: [],
          drawerMobileOpen: false,
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          drawerMobileOpen: false,
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          drawerMobileOpen: false,
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          selectedBlock: block,
          selectedStep: step,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
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
          drawerMobileOpen: false,
          activeFab: ActiveFab.Add,
          activeTab: ActiveTab.Journey,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
        }
        expect(
          reducer(state, {
            type: 'SetJourneyEditContentAction',
            component: ActiveJourneyEditContent.Canvas
          })
        ).toEqual({
          ...state,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
        })
      })
    })
  })

  describe('EditorProvider', () => {
    function TestState(): ReactElement {
      const { state } = useEditor()
      return <div>drawerTitle: {state.drawerTitle}</div>
    }

    it('should render children when component', () => {
      const { getByText } = render(
        <EditorProvider initialState={{ drawerTitle: 'test' }}>
          <TestState />
        </EditorProvider>
      )
      expect(getByText('drawerTitle: test')).toBeInTheDocument()
    })

    it('should render children when function', () => {
      const { getByText } = render(
        <EditorProvider initialState={{ drawerTitle: 'test' }}>
          {(state) => <div>drawerTitle: {state.drawerTitle}</div>}
        </EditorProvider>
      )
      expect(getByText('drawerTitle: test')).toBeInTheDocument()
    })
  })
})
