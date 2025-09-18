import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_IconBlock as IconBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../__generated__/BlockFields'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'
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

const titleTypography = {
  __typename: 'TypographyBlock',
  id: 'title-typography.id',
  content: '{{ title }}',
  variant: TypographyVariant.h1
} as unknown as TreeBlock<TypographyBlock>

const subtitleTypography = {
  __typename: 'TypographyBlock',
  id: 'subtitle-typography.id',
  content: '{{ subtitle }}',
  variant: TypographyVariant.h2
} as unknown as TreeBlock<TypographyBlock>

const card = {
  __typename: 'CardBlock',
  id: 'card.id',
  children: [titleTypography, subtitleTypography]
} as unknown as TreeBlock<CardBlock>

const step = {
  __typename: 'StepBlock',
  id: 'step.id',
  children: [card]
} as unknown as TreeBlock<StepBlock>

const journey = {
  id: 'journey.id',
  template: true,
  journeyCustomizationFields: [
    {
      __typename: 'JourneyCustomizationField',
      id: '1',
      journeyId: 'journey.id',
      key: 'title',
      value: 'Dank',
      defaultValue: 'Anonymous'
    },
    {
      __typename: 'JourneyCustomizationField',
      id: '2',
      journeyId: 'journey.id',
      key: 'subtitle',
      value: 'Memes',
      defaultValue: 'Unknown'
    }
  ]
} as unknown as Journey

describe('StepBlockNodeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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

  it('should render customized title and subtitle when journey is not a template', () => {
    mockGetCardMetadata.mockReturnValue({
      title: '{{ title }}',
      subtitle: '{{ subtitle }}',
      description: undefined,
      priorityBlock: undefined,
      bgImage: undefined
    })

    const nonTemplateJourney = {
      ...journey,
      template: false
    } as unknown as Journey

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey: nonTemplateJourney, variant: 'default' }}>
          <StepBlockNodeCard step={step} selected={false} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.queryByText('Dank')).toBeInTheDocument()
    expect(screen.queryByText('Memes')).toBeInTheDocument()
    expect(screen.queryByText('{{ title }}')).not.toBeInTheDocument()
    expect(screen.queryByText('{{ subtitle }}')).not.toBeInTheDocument()
  })

  it('should render markdown format title and subtitle when journey is a template', () => {
    mockGetCardMetadata.mockReturnValue({
      title: '{{ title }}',
      subtitle: '{{ subtitle }}',
      description: undefined,
      priorityBlock: undefined,
      bgImage: undefined
    })

    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <StepBlockNodeCard step={step} selected={false} />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(screen.queryByText('{{ title }}')).toBeInTheDocument()
    expect(screen.queryByText('{{ subtitle }}')).toBeInTheDocument()
    expect(screen.queryByText('Dank')).not.toBeInTheDocument()
    expect(screen.queryByText('Memes')).not.toBeInTheDocument()
  })
})
