import { fireEvent, render, screen } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { isIOSTouchScreen } from '@core/shared/ui/deviceUtils'

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

const mockIsIosTouchScreen = isIOSTouchScreen as jest.MockedFunction<
  typeof isIOSTouchScreen
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
      selectedAttributeId: 'selectedAttributeId'
    }

    render(
      <EditorProvider initialState={initialState}>
        <StepBlockNodeCard step={step} selected={false} />
        <TestEditorState />
      </EditorProvider>
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('StepBlock'))

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('selectedBlock: step.id')).toBeInTheDocument()
    expect(
      screen.getByText('selectedAttributeId: step.id-next-block')
    ).toBeInTheDocument()
  })

  it('should handle select block tap on iOS', () => {
    mockIsIosTouchScreen.mockReturnValue(true)
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
      selectedAttributeId: 'selectedAttributeId'
    }

    render(
      <EditorProvider initialState={initialState}>
        <StepBlockNodeCard step={step} selected={false} />
        <TestEditorState />
      </EditorProvider>
    )

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByTestId('StepBlock'))

    expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
    expect(screen.getByText('selectedBlock: step.id')).toBeInTheDocument()
    expect(
      screen.getByText('selectedAttributeId: step.id-next-block')
    ).toBeInTheDocument()
    expect(mockIsIosTouchScreen).toHaveBeenCalled()
  })

  it('should show second tap layer on iOS to handle the event of the second tap', async () => {
    mockIsIosTouchScreen.mockReturnValue(true)
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
      selectedAttributeId: 'selectedAttributeId'
    }

    render(
      <EditorProvider initialState={initialState}>
        <StepBlockNodeCard step={step} selected={false} />
        <TestEditorState />
      </EditorProvider>
    )
    expect(screen.getByTestId('IPhoneSecondTapLayer')).toBeInTheDocument()
  })

  it('should block select if in analytics mode', () => {
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

    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('StepBlock'))
    expect(screen.getByText('activeSlide: 0')).toBeInTheDocument()
  })
})
