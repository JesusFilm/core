import { render, screen } from '@testing-library/react'
import { NodeProps, ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { ContactActionType } from '../../../../../../../__generated__/globalTypes'
import { mockReactFlow } from '../../../../../../../test/mockReactFlow'

import { PhoneNode } from '.'

describe('PhoneNode', () => {
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
              label: 'Phone Button',
              buttonVariant: null,
              buttonColor: null,
              size: null,
              startIconId: null,
              endIconId: null,
              submitEnabled: null,
              children: [],
              action: {
                __typename: 'PhoneAction',
                parentBlockId: 'button1.id',
                gtmEventName: '',
                phone: '+1234567890',
                countryCode: '+1',
                contactAction: ContactActionType.call,
                customizable: false,
                parentStepId: 'step1.id'
              },
              settings: null
            }
          ]
        }
      ]
    }
  ]

  it('should render PhoneAction', () => {
    const props = {
      id: 'PhoneNode-button1.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps }}>
          <PhoneNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )

    expect(screen.getByText('Call')).toBeInTheDocument()
    expect(screen.getByText('+1234567890')).toBeInTheDocument()
  })

  it('should render phone node analytics', () => {
    const props = {
      id: 'PhoneNode-button1.id'
    } as unknown as NodeProps

    render(
      <ReactFlowProvider>
        <EditorProvider initialState={{ steps, showAnalytics: true }}>
          <PhoneNode {...props} />
        </EditorProvider>
      </ReactFlowProvider>
    )
    expect(screen.getByTestId('LinkNodeAnalytics')).toBeInTheDocument()
  })
})
