import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, screen } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'
import { ActiveContent, EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { useStepAndBlockSelection } from './useStepAndBlockSelection'

describe('useStepAndBlockSelection', () => {
  const step1 = {
    id: 'step1.id',
    __typename: 'StepBlock',
    name: 'Step 1',
    blocks: []
  } as unknown as TreeBlock<StepBlock>
  const step2 = {
    id: 'step2.id',
    __typename: 'StepBlock',
    name: 'Step 2',
    blocks: []
  } as unknown as TreeBlock<StepBlock>

  it('should select step if not already selected', () => {
    const { result } = renderHook(() => useStepAndBlockSelection(), {
      wrapper: ({ children }) => (
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step1, step2],
              selectedStep: step1
            }}
          >
            <TestEditorState />
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
    act(() => result.current(step2.id))
    expect(screen.getByText('selectedStep: step2.id')).toBeInTheDocument()
  })

  it('should call select block if function is called on the selected step', () => {
    const { result } = renderHook(() => useStepAndBlockSelection(), {
      wrapper: ({ children }) => (
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step1, step2],
              selectedStep: step1,
              selectedBlock: step2
            }}
          >
            <TestEditorState />
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
    expect(screen.getByText('selectedBlock: step2.id')).toBeInTheDocument()
    expect(screen.queryByText('selectedAttributeId: ')).not.toBeInTheDocument()

    act(() => result.current(step1.id))
    expect(screen.getByText('selectedBlock: step1.id')).toBeInTheDocument()
    expect(
      screen.getByText('selectedAttributeId: step1.id-next-block')
    ).toBeInTheDocument()
  })

  it('should not set selected attribute id if show analytics is set to true', () => {
    const { result } = renderHook(() => useStepAndBlockSelection(), {
      wrapper: ({ children }) => (
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step1, step2],
              selectedStep: step1,
              selectedBlock: step2,
              showAnalytics: true
            }}
          >
            <TestEditorState />
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
    expect(screen.getByText('selectedBlock: step2.id')).toBeInTheDocument()
    expect(screen.getByText('selectedAttributeId:')).toBeInTheDocument()

    act(() => result.current(step1.id))
    expect(
      screen.queryByText('selectedAttributeId: step1.id-next-block')
    ).not.toBeInTheDocument()
  })

  it('should switch activeContent to canvas when step is already selected and activecontent is social', () => {
    const { result } = renderHook(() => useStepAndBlockSelection(), {
      wrapper: ({ children }) => (
        <MockedProvider>
          <EditorProvider
            initialState={{
              steps: [step1, step2],
              selectedStep: step1,
              selectedBlock: step2,
              activeContent: ActiveContent.Social
            }}
          >
            <TestEditorState />
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })
    expect(screen.getByText('activeContent: social')).toBeInTheDocument()
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
    expect(screen.getByText('selectedBlock: step2.id')).toBeInTheDocument()
    expect(screen.getByText('selectedAttributeId:')).toBeInTheDocument()

    act(() => result.current(step1.id))
    // Should switch activeContent to canvas, preserving selectedStep, selectedBlock and selectedAttributeId
    expect(screen.getByText('activeContent: canvas')).toBeInTheDocument()
    expect(screen.getByText('selectedStep: step1.id')).toBeInTheDocument()
    expect(screen.getByText('selectedBlock: step2.id')).toBeInTheDocument()
    expect(screen.getByText('selectedAttributeId:')).toBeInTheDocument()
  })
})
