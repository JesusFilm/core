import { render, screen } from '@testing-library/react'
import { NodeProps, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { ChatNode } from '.'

describe('ChatNode', () => {
  beforeEach(() => {
    mockReactFlow()
  })

  const steps: Array<TreeBlock<StepBlock>> = [
    {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: [
        {
          __typename: 'CardBlock',
          id: 'card.id',
          parentBlockId: 'step.id',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          backdropBlur: null,
          children: [
            {
              __typename: 'ButtonBlock',
              id: 'button1.id',
              parentBlockId: 'card.id',
              parentOrder: 0,
              label: 'Chat Button',
              buttonVariant: null,
              buttonColor: null,
              size: null,
              startIconId: null,
              endIconId: null,
              submitEnabled: null,
              action: {
                __typename: 'ChatAction' as any,
                parentBlockId: 'button1.id',
                gtmEventName: null,
                chatUrl: 'https://m.me/example',
                target: '_blank',
                customizable: false,
                parentStepId: null
              } as any,
              children: [],
              settings: null
            },
            {
              __typename: 'ButtonBlock',
              id: 'button2.id',
              parentBlockId: 'card.id',
              parentOrder: 1,
              label: 'WhatsApp Button',
              buttonVariant: null,
              buttonColor: null,
              size: null,
              startIconId: null,
              endIconId: null,
              submitEnabled: null,
              action: {
                __typename: 'ChatAction' as any,
                parentBlockId: 'button2.id',
                gtmEventName: null,
                chatUrl: 'https://wa.me/1234567890',
                target: '_blank',
                customizable: false,
                parentStepId: null
              } as any,
              children: [],
              settings: null
            }
          ]
        }
      ]
    }
  ]

  it('should render ChatAction with Messenger URL', () => {
    const props = {
      id: 'ChatNode-button1.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps }}>
          <ChatNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('MessageChat1Icon')).toBeInTheDocument()
    expect(screen.getByText('Start a Chat')).toBeInTheDocument()
    expect(screen.getByText('https://m.me/example')).toBeInTheDocument()
  })

  it('should render ChatAction with WhatsApp URL', () => {
    const props = {
      id: 'ChatNode-button2.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps }}>
          <ChatNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('MessageChat1Icon')).toBeInTheDocument()
    expect(screen.getByText('Start a Chat')).toBeInTheDocument()
    expect(screen.getByText('https://wa.me/1234567890')).toBeInTheDocument()
  })

  it('should render chat node analytics', () => {
    const props = {
      id: 'ChatNode-button1.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps, showAnalytics: true }}>
          <ChatNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )
    expect(screen.getByTestId('LinkNodeAnalytics')).toBeInTheDocument()
  })

  it('should handle missing action block gracefully', () => {
    const props = {
      id: 'ChatNode-nonexistent.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps }}>
          <ChatNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('MessageChat1Icon')).toBeInTheDocument()
    expect(screen.getByText('Start a Chat')).toBeInTheDocument()
    // The actionDetail should be empty when no matching action block is found
    const actionDetailElement = screen
      .getByText('Start a Chat')
      .parentElement?.querySelector('p:last-child')
    expect(actionDetailElement).toHaveTextContent('')
  })

  it('should handle empty steps gracefully', () => {
    const props = {
      id: 'ChatNode-button1.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps: [] }}>
          <ChatNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('MessageChat1Icon')).toBeInTheDocument()
    expect(screen.getByText('Start a Chat')).toBeInTheDocument()
    // The actionDetail should be empty when no steps are provided
    const actionDetailElement = screen
      .getByText('Start a Chat')
      .parentElement?.querySelector('p:last-child')
    expect(actionDetailElement).toHaveTextContent('')
  })
})
