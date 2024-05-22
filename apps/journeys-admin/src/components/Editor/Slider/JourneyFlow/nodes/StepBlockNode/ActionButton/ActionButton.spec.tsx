import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactFlowProvider } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_FormBlock as FormBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock,
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
          <ActionButton block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('button action')).toBeInTheDocument()
    expect(screen.getByTestId('BaseNodeConnectionArrowIcon')).toBeVisible()
  })

  it('should render default label for ButtonBlock', () => {
    const block = {
      __typename: 'ButtonBlock'
    } as unknown as TreeBlock<ButtonBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('should render for FormBlock', () => {
    const block = {
      __typename: 'FormBlock'
    } as unknown as TreeBlock<FormBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Form')).toBeInTheDocument()
  })

  it('should render label for RadioOptionBlock', () => {
    const block = {
      __typename: 'RadioOptionBlock',
      label: 'radio option action'
    } as unknown as TreeBlock<RadioOptionBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton block={block} />
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
          <ActionButton block={block} />
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
          <ActionButton block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Subscribe')).toBeInTheDocument()
  })

  it('should render label for TextResponseBlock', () => {
    const block = {
      __typename: 'TextResponseBlock'
    } as unknown as TreeBlock<TextResponseBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Feedback')).toBeInTheDocument()
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
          <ActionButton block={block} />
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
          <ActionButton block={block} />
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
          <ActionButton block={block} />
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
          <ActionButton block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Default Next Step →')).toBeInTheDocument()
  })

  it('should render icon and tooltip for link action', async () => {
    const block = {
      __typename: 'ButtonBlock',
      action: {
        __typename: 'LinkAction',
        url: 'https://example.com'
      }
    } as unknown as TreeBlock<ButtonBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('LinkIcon')).toBeInTheDocument()
    fireEvent.mouseOver(screen.getByTestId('LinkIcon'))
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'https://example.com'
      )
    })
  })

  it('should render icon and tooltip for email action', async () => {
    const block = {
      __typename: 'ButtonBlock',
      action: {
        __typename: 'EmailAction',
        email: 'example@email.com'
      }
    } as unknown as TreeBlock<ButtonBlock>

    render(
      <MockedProvider>
        <ReactFlowProvider>
          <ActionButton block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('EmailIcon')).toBeInTheDocument()
    fireEvent.mouseOver(screen.getByTestId('EmailIcon'))
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('example@email.com')
    })
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
          <ActionButton block={block} />
        </ReactFlowProvider>
      </MockedProvider>
    )

    expect(screen.getByTestId('BaseNodeConnectionArrowIcon')).not.toBeVisible()
  })
})
