import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

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
})
