import { fireEvent, render, screen } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveFab, EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../../libs/TestEditorState'
import { getCardMetadata } from '../libs/getCardMetadata'

import { StepBlockNodeCard } from '.'

jest.mock('../libs/getCardMetadata', () => ({
  getCardMetadata: jest.fn()
}))

const mockGetCardMetadata = getCardMetadata as jest.MockedFunction<
  typeof getCardMetadata
>

describe('StepBlockNodeCard', () => {
  it('should render card content', () => {
    const priorityBlock = {
      __typename: 'ButtonBlock',
      label: 'button'
    } as unknown as TreeBlock<ButtonBlock>
    mockGetCardMetadata.mockReturnValue({
      title: 'card title',
      subtitle: 'card subtitle',
      description: 'card description',
      priorityBlock,
      bgImage: 'bgImage'
    })
    const step = {
      __typename: 'StepBlock',
      id: 'step.id',
      children: []
    } as unknown as TreeBlock<StepBlock>

    render(<StepBlockNodeCard step={step} selected={false} />)

    expect(screen.getByText('card title')).toBeInTheDocument()
    expect(screen.getByText('card subtitle')).toBeInTheDocument()
    expect(screen.getByText('card description')).toBeInTheDocument()
    expect(screen.getByTestId('card-icon-background')).toHaveStyle(`
      background-image: url('bgImage');
    `)
    expect(screen.getByTestId('GitBranchIcon')).toBeInTheDocument()
  })

  it('should render default card content', () => {
    const priorityBlock = {
      __typename: 'ImageBlock'
    } as unknown as TreeBlock<ImageBlock>
    mockGetCardMetadata.mockReturnValue({
      title: undefined,
      subtitle: '',
      description: '',
      priorityBlock,
      bgImage: undefined
    })
    const step = {
      __typename: 'StepBlock',
      id: 'step.id',
      children: []
    } as unknown as TreeBlock<StepBlock>

    render(<StepBlockNodeCard step={step} selected={false} />)

    expect(screen.getAllByRole('paragraph', { name: '' })).toHaveLength(2)
    expect(
      screen.getByTestId('StepBlockNodeCardTitleSkeleton')
    ).toBeInTheDocument()
    expect(screen.getByTestId('FlexAlignBottom1Icon')).toBeInTheDocument()
  })

  it('should handle selected step click', () => {
    mockGetCardMetadata.mockReturnValue({
      title: undefined,
      subtitle: undefined,
      description: undefined,
      priorityBlock: undefined,
      bgImage: undefined
    })
    const step = {
      __typename: 'StepBlock',
      id: 'step.id',
      children: []
    } as unknown as TreeBlock<StepBlock>
    const selectedStep = {
      ...step,
      id: 'selectedStep.id'
    }

    render(
      <EditorProvider initialState={{ selectedStep }}>
        <StepBlockNodeCard step={step} selected={false} />
        <TestEditorState />
      </EditorProvider>
    )

    expect(
      screen.getByText('selectedBlock: selectedStep.id')
    ).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('StepBlock'))
    expect(screen.getByText('selectedBlock: step.id')).toBeInTheDocument()
  })

  it('should handle select block click', () => {
    mockGetCardMetadata.mockReturnValue({
      title: undefined,
      subtitle: undefined,
      description: undefined,
      priorityBlock: undefined,
      bgImage: undefined
    })
    const step = {
      __typename: 'StepBlock',
      id: 'step.id',
      children: []
    } as unknown as TreeBlock<StepBlock>

    const initialState = {
      selectedStep: step,
      activeFab: ActiveFab.Edit,
      selectedAttributeId: 'selectedAttributeId'
    }

    render(
      <EditorProvider initialState={initialState}>
        <StepBlockNodeCard step={step} selected={false} />
        <TestEditorState />
      </EditorProvider>
    )

    fireEvent.click(screen.getByTestId('StepBlock'))

    expect(screen.getByText('selectedBlock: step.id')).toBeInTheDocument()
    expect(screen.getByText('activeFab: Add')).toBeInTheDocument()
    expect(
      screen.getByText('selectedAttributeId: step.id-next-block')
    ).toBeInTheDocument()
  })
})
