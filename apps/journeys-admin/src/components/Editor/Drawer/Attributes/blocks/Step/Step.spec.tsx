import { render } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  EditorProvider,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../__generated__/GetJourney'

import { Step } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('Step', () => {
  const dispatch = jest.fn()

  const state: EditorState = {
    steps: [],
    drawerMobileOpen: false,
    activeTab: ActiveTab.Journey,
    activeFab: ActiveFab.Add,
    journeyEditContentComponent: ActiveJourneyEditContent.Canvas
  }

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

  it('shows default messages', () => {
    const step: TreeBlock<StepBlock> = {
      id: 'step1.id',
      __typename: 'StepBlock',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: []
    }
    const { getByText } = render(<Step {...step} />)
    expect(getByText('None')).toBeInTheDocument()
    expect(getByText('Unlocked Card')).toBeInTheDocument()
  })

  describe('nextCard', () => {
    it('shows locked', () => {
      const step: TreeBlock<StepBlock> = {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: 'step1.id',
        parentOrder: 0,
        locked: true,
        nextBlockId: null,
        children: []
      }
      const { getByText } = render(<Step {...step} />)
      expect(getByText('Locked With Interaction')).toBeInTheDocument()
    })

    it('shows next step title', () => {
      const step1: TreeBlock<StepBlock> = {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: []
      }
      const step2: TreeBlock<StepBlock> = {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null,
        children: []
      }
      mockUseEditor.mockReturnValue({
        state: {
          steps: [step1, step2],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Journey,
          activeFab: ActiveFab.Add,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
        },
        dispatch
      })
      const { getByText } = render(
        <EditorProvider
          initialState={{
            steps: [step1, step2]
          }}
        >
          <Step {...step1} />
        </EditorProvider>
      )
      expect(getByText('Step {{number}}')).toBeInTheDocument()
    })

    it('shows custom next step title', () => {
      const step1: TreeBlock<StepBlock> = {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step5.id',
        children: []
      }
      const step2: TreeBlock<StepBlock> = {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null,
        children: []
      }
      const step5: TreeBlock<StepBlock> = {
        id: 'step5.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 4,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: 'card1.id',
            parentBlockId: 'step2.id',
            coverBlockId: null,
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                __typename: 'TypographyBlock',
                id: 'typography',
                content: 'my Title',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                align: null,
                color: null,
                variant: null,
                children: []
              }
            ]
          }
        ]
      }
      mockUseEditor.mockReturnValue({
        state: {
          steps: [step1, step2, step5],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Journey,
          activeFab: ActiveFab.Add,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
        },
        dispatch
      })
      const { getByText } = render(
        <EditorProvider
          initialState={{
            steps: [step1, step2, step5]
          }}
        >
          <Step {...step1} />
        </EditorProvider>
      )
      expect(getByText('my Title')).toBeInTheDocument()
    })

    it('shows first typography text', () => {
      const step1: TreeBlock<StepBlock> = {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: []
      }
      const step2: TreeBlock<StepBlock> = {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null,
        children: [
          {
            __typename: 'CardBlock',
            id: 'card1.id',
            parentBlockId: 'step2.id',
            coverBlockId: null,
            parentOrder: 0,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [
              {
                __typename: 'TypographyBlock',
                id: 'typography',
                content: 'my Title',
                parentBlockId: 'card1.id',
                parentOrder: 0,
                align: null,
                color: null,
                variant: null,
                children: []
              }
            ]
          }
        ]
      }
      mockUseEditor.mockReturnValue({
        state: {
          steps: [step1, step2],
          drawerMobileOpen: false,
          activeTab: ActiveTab.Journey,
          activeFab: ActiveFab.Add,
          journeyEditContentComponent: ActiveJourneyEditContent.Canvas
        },
        dispatch
      })
      const { getByText } = render(
        <EditorProvider
          initialState={{
            steps: [step1, step2]
          }}
        >
          <Step {...step1} />
        </EditorProvider>
      )
      expect(getByText('my Title')).toBeInTheDocument()
    })

    it('should show none', () => {
      const step1: TreeBlock<StepBlock> = {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        children: []
      }
      const step2: TreeBlock<StepBlock> = {
        id: 'step2.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: null,
        children: []
      }
      const { getByText } = render(
        <EditorProvider
          initialState={{
            steps: [step1, step2]
          }}
        >
          <Step {...step2} />
        </EditorProvider>
      )
      expect(getByText('None')).toBeInTheDocument()
    })
  })
})
