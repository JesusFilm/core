import { render, screen } from '@testing-library/react'
import { NodeProps, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { LinkNode } from '.'

describe('LinkNode', () => {
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
              label: 'Link Button',
              buttonVariant: null,
              buttonColor: null,
              size: null,
              startIconId: null,
              endIconId: null,
              submitEnabled: null,
              action: {
                __typename: 'LinkAction',
                parentBlockId: 'button1.id',
                gtmEventName: null,
                url: 'https://www.google.com',
                customizable: false,
                parentStepId: null
              },
              children: [],
              settings: null
            },
            {
              __typename: 'ButtonBlock',
              id: 'button2.id',
              parentBlockId: 'card.id',
              parentOrder: 1,
              label: 'Email Button',
              buttonVariant: null,
              buttonColor: null,
              size: null,
              startIconId: null,
              endIconId: null,
              submitEnabled: null,
              action: {
                __typename: 'EmailAction',
                parentBlockId: 'button2.id',
                gtmEventName: null,
                email: 'email@example.com',
                customizable: false,
                parentStepId: null
              },
              children: [],
              settings: null
            }
          ]
        }
      ]
    }
  ]

  it('should render LinkAction', () => {
    const props = {
      id: 'LinkNode-button1.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps }}>
          <LinkNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('LinkAngledIcon')).toBeInTheDocument()
    expect(screen.getByText('Visit a Website')).toBeInTheDocument()
    expect(screen.getByText('https://www.google.com')).toBeInTheDocument()
  })

  it('should render EmailAction', () => {
    const props = {
      id: 'LinkNode-button2.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps }}>
          <LinkNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByTestId('EmailIcon')).toBeInTheDocument()
    expect(screen.getByText('Send an Email')).toBeInTheDocument()
    expect(screen.getByText('email@example.com')).toBeInTheDocument()
  })

  it('should render link node analytics', () => {
    const props = {
      id: 'LinkNode-button1.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps, showAnalytics: true }}>
          <LinkNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )
    expect(screen.getByTestId('LinkNodeAnalytics')).toBeInTheDocument()
  })
})
