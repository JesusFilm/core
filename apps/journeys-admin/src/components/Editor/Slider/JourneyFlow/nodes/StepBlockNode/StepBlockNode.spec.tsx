import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { NodeProps, ReactFlowProvider } from 'reactflow'

import { ActiveContent, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_FormBlock as FormBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/BlockFields'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { StepBlockNode } from '.'

describe('StepBlockNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  it('should render step with default action', () => {
    const props = {
      id: 'step.id',
      xPos: 0,
      yPos: 0,
      dragging: false
    } as unknown as NodeProps

    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: []
    }

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <EditorProvider
            initialState={{
              steps: [step],
              selectedStep: step,
              activeContent: ActiveContent.Canvas
            }}
          >
            <StepBlockNode {...props} />
          </EditorProvider>
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('StepBlockNodeCard')).toBeInTheDocument()
    expect(screen.getByText('Default Next Step →')).toBeInTheDocument()
  })

  it('should render step actions', () => {
    const action = {
      __typename: 'NavigateToBlockAction',
      parentBlockId: 'block.id',
      gtmEventName: null,
      blockId: 'nextStep.id'
    }
    const button = {
      __typename: 'ButtonBlock',
      id: 'button.id',
      label: 'button action',
      action,
      children: []
    } as unknown as TreeBlock<ButtonBlock>
    const radioQuestion = {
      __typename: 'RadioQuestionBlock',
      id: 'radioQuestion.id',
      children: [
        {
          __typename: 'RadioOptionBlock',
          id: 'radioOption.id',
          parentBlockId: 'radioQuestion.id',
          parentOrder: 0,
          label: 'poll action',
          action,
          children: []
        }
      ]
    } as unknown as TreeBlock<RadioQuestionBlock>
    const form = {
      __typename: 'FormBlock',
      id: 'form.id',
      action,
      children: []
    } as unknown as TreeBlock<FormBlock>
    const signUp = {
      __typename: 'SignUpBlock',
      id: 'signUp.id',
      submitLabel: 'sign up action',
      action,
      children: []
    } as unknown as TreeBlock<SignUpBlock>
    const video = {
      __typename: 'VideoBlock',
      id: 'video.id',
      title: 'video action',
      startAt: null,
      action,
      children: []
    } as unknown as TreeBlock<VideoBlock>
    const textResponse = {
      __typename: 'TextResponseBlock',
      id: 'textResponse.id',
      action,
      children: []
    } as unknown as TreeBlock<TextResponseBlock>

    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: [
        {
          __typename: 'CardBlock',
          id: 'card.id',
          parentBlockId: 'step.id',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: null,
          themeName: null,
          themeMode: null,
          fullscreen: false,
          children: [button, radioQuestion, form, signUp, video, textResponse]
        }
      ]
    }
    const props = {
      id: 'step.id',
      xPos: 0,
      yPos: 0,
      dragging: false
    } as unknown as NodeProps

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <EditorProvider
            initialState={{
              steps: [step],
              selectedStep: step,
              activeContent: ActiveContent.Canvas
            }}
          >
            <StepBlockNode {...props} />
          </EditorProvider>
        </ReactFlowProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId(`ActionButton-${button.id}`)).toBeInTheDocument()
    expect(
      screen.getByTestId(`ActionButton-${radioQuestion.children[0].id}`)
    ).toBeInTheDocument()
    expect(screen.getByTestId(`ActionButton-${form.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`ActionButton-${signUp.id}`)).toBeInTheDocument()
    expect(screen.getByTestId(`ActionButton-${video.id}`)).toBeInTheDocument()
    expect(
      screen.getByTestId(`ActionButton-${textResponse.id}`)
    ).toBeInTheDocument()
  })

  it('should show edit step fab', () => {
    const step: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      children: []
    }

    const props = {
      id: 'step.id',
      xPos: 0,
      yPos: 0,
      dragging: false
    } as unknown as NodeProps

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <EditorProvider
            initialState={{
              steps: [step],
              selectedStep: step,
              activeContent: ActiveContent.Canvas
            }}
          >
            <StepBlockNode {...props} />
          </EditorProvider>
        </ReactFlowProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('EditStepFab')).toBeInTheDocument()
  })
})
