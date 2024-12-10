import { render, screen } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_IconBlock as IconBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import { TestEditorState } from '../../../../../../../libs/TestEditorState'
import { getCardMetadata } from '../libs/getCardMetadata'

import { StepBlockNodeCard } from '.'

jest.mock('../libs/getCardMetadata', () => ({
  getCardMetadata: jest.fn()
}))

jest.mock('@core/shared/ui/deviceUtils', () => {
  return {
    isIOSTouchScreen: jest.fn()
  }
})

const mockGetCardMetadata = getCardMetadata as jest.MockedFunction<
  typeof getCardMetadata
>

describe('StepBlockNodeCard', () => {
  beforeEach(() => jest.clearAllMocks())

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
    expect(screen.getByTestId('CardIconBackground')).toHaveStyle(`
      background-image: url('bgImage');
    `)
    expect(screen.getByTestId('Cursor6Icon')).toBeInTheDocument()

    const cardTitleText = screen
      .getByTestId('StepBlockNodeCard')
      .getAttribute('title')
    expect(cardTitleText).toBe('Click to edit or drag')
  })

  it('should render default card content', () => {
    const priorityBlock = {
      __typename: 'IconBlock'
    } as unknown as TreeBlock<IconBlock>
    mockGetCardMetadata.mockReturnValue({
      title: undefined,
      subtitle: undefined,
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

    expect(
      screen.getByTestId('StepBlockNodeCardTitleSkeleton')
    ).toBeInTheDocument()
    expect(screen.getByTestId('FlexAlignBottom1Icon')).toBeInTheDocument()
  })

  it('should have no title if in analytics mode', () => {
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
      selectedAttributeId: 'selectedAttributeId',
      showAnalytics: true
    }

    render(
      <EditorProvider initialState={initialState}>
        <StepBlockNodeCard step={step} selected={false} />
        <TestEditorState />
      </EditorProvider>
    )

    const cardTitleText = screen
      .getByTestId('StepBlockNodeCard')
      .getAttribute('title')
    expect(cardTitleText).toBe('')
  })
})
