import { fireEvent, getByText, render } from '@testing-library/react'
import { ActionButton } from './ActionButton'
import { MockedProvider } from '@apollo/client/testing'
import {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import { TreeBlock } from '@core/journeys/ui/block'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../__generated__/globalTypes'
import { ReactFlowProvider } from 'reactflow'

const block: TreeBlock<BlockFields> = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  parentOrder: 0,
  label: 'This is a button',
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.small,
  startIconId: null,
  endIconId: null,
  action: null,
  children: []
}

describe('ActionButton', () => {
  it('should display the title that is given from the block', () => {
    const { getByTestId } = render(
      <ReactFlowProvider>
        <MockedProvider>
          <ActionButton block={block} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(getByTestId('ActionButton')).toBeInTheDocument()
    expect(getByTestId('ActionButtonText')).toHaveTextContent(
      'This is a button'
    )
  })

  it('should have full opacity when selected', () => {
    const { getByTestId } = render(
      <ReactFlowProvider>
        <MockedProvider>
          <ActionButton block={block} selected={true} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(getByTestId('ActionButton')).toHaveStyle('opacity: 1')
  })

  it('should have partial opacity when not selected', () => {
    const { getByTestId } = render(
      <ReactFlowProvider>
        <MockedProvider>
          <ActionButton block={block} selected={false} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(getByTestId('ActionButton')).toHaveStyle('opacity: 0.7')
  })

  it('should display the correct icon and title when there is a link action', () => {
    const linkBlock: TreeBlock<BlockFields> = {
      ...block,
      action: {
        __typename: 'LinkAction',
        parentBlockId: '',
        gtmEventName: '',
        url: ''
      }
    }
    const { getByTestId } = render(
      <ReactFlowProvider>
        <MockedProvider>
          <ActionButton block={linkBlock} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(getByTestId('LinkIcon')).toBeInTheDocument()
  })

  it('should display the correct icon when there is a Email action', () => {
    const linkBlock: TreeBlock<BlockFields> = {
      ...block,
      action: {
        __typename: 'EmailAction',
        parentBlockId: '',
        gtmEventName: '',
        email: ''
      }
    }
    const { getByTestId } = render(
      <ReactFlowProvider>
        <MockedProvider>
          <ActionButton block={linkBlock} />
        </MockedProvider>
      </ReactFlowProvider>
    )

    expect(getByTestId('EmailIcon')).toBeInTheDocument()
  })

  // tests still to be done correct titles when action type is --->>>  | "NavigateAction" | "NavigateToBlockAction" | "NavigateToJourneyAction"  | undefined
})
