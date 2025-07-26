import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/BlockFields'
import { mockReactFlow } from '../../../../../../../../test/mockReactFlow'

import { ActionButton } from '.'

describe('ActionButton', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  it('should render label for ButtonBlock', () => {
    const block = {
      __typename: 'ButtonBlock',
      label: 'button action'
    } as unknown as TreeBlock<ButtonBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('button action')).toBeInTheDocument()
    expect(
      screen.getByTestId('BaseNodeConnectionArrowIcon')
    ).toBeInTheDocument()
  })

  it('should render default label "Button" for ButtonBlock when submitEnabled is false', () => {
    const block = {
      __typename: 'ButtonBlock',
      submitEnabled: false
    } as unknown as TreeBlock<ButtonBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('should render default label "Submit" for ButtonBlock when submitEnabled is true', () => {
    const block = {
      __typename: 'ButtonBlock',
      submitEnabled: true
    } as unknown as TreeBlock<ButtonBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('should render label for RadioOptionBlock', () => {
    const block = {
      __typename: 'RadioOptionBlock',
      label: 'radio option action'
    } as unknown as TreeBlock<RadioOptionBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('radio option action')).toBeInTheDocument()
  })

  it('should render default label for RadioOptionBlock', () => {
    const block = {
      __typename: 'RadioOptionBlock'
    } as unknown as TreeBlock<RadioOptionBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Option')).toBeInTheDocument()
  })

  it('should render label for SignUpBlock', () => {
    const block = {
      __typename: 'SignUpBlock'
    } as unknown as TreeBlock<SignUpBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Subscribe')).toBeInTheDocument()
  })

  it('should render video label for VideoBlock', () => {
    const block = {
      __typename: 'VideoBlock',
      video: {
        title: [{ value: 'video title' }]
      }
    } as unknown as TreeBlock<VideoBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('video title')).toBeInTheDocument()
  })

  it('should render block label for VideoBlock', () => {
    const block = {
      __typename: 'VideoBlock',
      title: 'block title'
    } as unknown as TreeBlock<VideoBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('block title')).toBeInTheDocument()
  })

  it('should render default label for VideoBlock', () => {
    const block = {
      __typename: 'VideoBlock'
    } as unknown as TreeBlock<VideoBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('should render for StepBlock', () => {
    const block = {
      __typename: 'StepBlock'
    } as unknown as TreeBlock<StepBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Default Next Step →')).toBeInTheDocument()
  })

  it('should hide hover arrow if connected to next card', () => {
    const block = {
      __typename: 'ButtonBlock',
      action: {
        __typename: 'NavigateToBlockAction',
        blockId: 'nextStep.id'
      }
    } as unknown as TreeBlock<ButtonBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton stepId="step.id" block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('BaseNodeConnectionArrowIcon')).toHaveStyle(
      'opacity: 0'
    )
  })

  it('should disable source handle in analytics mode', () => {
    const block = {
      __typename: 'ButtonBlock'
    } as unknown as TreeBlock<ButtonBlock>

    const initialState = {
      showAnalytics: true
    } as unknown as EditorState

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <EditorProvider initialState={initialState}>
            <ActionButton stepId="step.id" block={block} />
          </EditorProvider>
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(
      screen.getByTestId('BaseNodeRightHandle-disabled')
    ).toBeInTheDocument()
  })

  it('should show bar in analytics mode', () => {
    const block = {
      __typename: 'ButtonBlock',
      id: 'button.id'
    } as unknown as TreeBlock<ButtonBlock>
    const stepMap = new Map([['step.id', { total: 10 }]])
    const blockMap = new Map([['button.id', 5]])

    const initialState = {
      showAnalytics: true,
      analytics: {
        stepMap,
        blockMap
      }
    } as unknown as EditorState

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <EditorProvider initialState={initialState}>
            <ActionButton stepId="step.id" block={block} />
          </EditorProvider>
        </ReactFlowProvider>
      </MockedProvider>
    )

    const bar = screen.getByTestId('AnalyticsOverlayBar')
    expect(bar).toBeInTheDocument()
    expect(bar).toHaveStyle('flex-grow: 0.5')
  })
})
