import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { ActionNode } from './ActionNode'

jest.mock('@core/journeys/ui/EditorProvider', () => ({
  __esModule: true,
  ...jest.requireActual('@core/journeys/ui/EditorProvider'),
  useEditor: jest.fn()
}))

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

describe('ActionNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const mockBlock = {
    __typename: 'RadioOptionBlock',
    id: 'RadioOptionBlock.id',
    children: [],
    parentBlockId: 'RadioQuestionBlock.id',
    parentOrder: 1,
    label: 'Option 1',
    action: null
  } satisfies TreeBlock<RadioOptionBlock>

  const mockStep = {
    __typename: 'StepBlock' as const,
    id: 'StepBlock.id',
    locked: false,
    nextBlockId: null,
    parentBlockId: null,
    parentOrder: 1,
    children: [
      {
        __typename: 'CardBlock' as const,
        id: 'CardBlock.id',
        parentBlockId: 'StepBlock.id',
        backgroundColor: null,
        coverBlockId: null,
        fullscreen: false,
        parentOrder: 0,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base,
        children: [
          {
            __typename: 'RadioQuestionBlock' as const,
            id: 'RadioQuestion.id',
            parentBlockId: 'CardBlock.id',
            parentOrder: 0,
            children: [mockBlock]
          }
        ]
      }
    ]
  } satisfies TreeBlock<StepBlock>

  const defaultProps = {
    title: mockBlock.label,
    block: mockBlock,
    step: mockStep
  }

  const mockUseEditorState = {
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
    activeContent: ActiveContent.Canvas,
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    selectedBlock: mockBlock,
    selectedStep: mockStep,
    steps: [mockStep]
  } satisfies EditorState

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render node with title', () => {
    render(
      <ReactFlowProvider>
        <MockedProvider>
          <ActionNode {...defaultProps} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText(mockBlock.label)).toBeInTheDocument()
  })

  it('should dispatch editor actions on click', () => {
    const mockDispatch = jest.fn()
    mockUseEditor.mockReturnValue({
      state: mockUseEditorState,
      dispatch: mockDispatch
    })

    render(
      <ReactFlowProvider>
        <MockedProvider>
          <ActionNode {...defaultProps} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    fireEvent.click(screen.getByText('Option 1'))

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SetSelectedStepAction',
      selectedStep: mockStep
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SetSelectedBlockAction',
      selectedBlock: mockBlock
    })
  })
})
