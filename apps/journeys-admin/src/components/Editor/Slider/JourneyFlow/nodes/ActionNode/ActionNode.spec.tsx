import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorProvider,
  EditorState
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
import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { ActionNode } from './ActionNode'

describe('ActionNode', () => {
  const mockBlock: TreeBlock<RadioOptionBlock> = {
    __typename: 'RadioOptionBlock',
    id: 'RadioOptionBlock.id',
    children: [],
    parentBlockId: 'RadioQuestionBlock.id',
    parentOrder: 1,
    label: 'Option 1',
    action: null
  }

  const mockStep: TreeBlock<StepBlock> = {
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
  }

  const defaultProps = {
    title: mockBlock.label,
    block: mockBlock,
    step: mockStep
  }

  beforeEach(() => {
    mockReactFlow()
  })

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
    const state: EditorState = {
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
      activeContent: ActiveContent.Canvas,
      activeFab: ActiveFab.Add,
      activeSlide: ActiveSlide.JourneyFlow,
      selectedBlock: undefined,
      selectedStep: undefined,
      steps: [mockStep]
    }

    render(
      <ReactFlowProvider>
        <MockedProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <ActionNode {...defaultProps} />
          </EditorProvider>
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('selectedBlock: StepBlock.id')).toBeInTheDocument()
    expect(screen.getByText('selectedStep: StepBlock.id')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Option 1'))

    expect(
      screen.getByText('selectedBlock: RadioOptionBlock.id')
    ).toBeInTheDocument()
    expect(screen.getByText('selectedStep: StepBlock.id')).toBeInTheDocument()
  })
})
