import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import { v4 as uuidv4 } from 'uuid'

import {
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../__generated__/globalTypes'
import {
  type TreeBlock,
  blockHistoryVar,
  treeBlocksVar
} from '../../libs/block'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../libs/block/__generated__/BlockFields'
import { blurImage } from '../../libs/blurImage'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify } from '../../libs/plausibleHelpers/plausibleHelpers'
import { ImageFields } from '../Image/__generated__/ImageFields'
import { StepViewEventCreate } from '../Step/__generated__/StepViewEventCreate'
import { STEP_VIEW_EVENT_CREATE } from '../Step/Step'
import { VideoFields } from '../Video/__generated__/VideoFields'

import { StepNextEventCreate } from './__generated__/StepNextEventCreate'
import { StepPreviousEventCreate } from './__generated__/StepPreviousEventCreate'
import { STEP_NEXT_EVENT_CREATE, STEP_PREVIOUS_EVENT_CREATE } from './Card'

import { Card } from '.'

jest.mock('../../libs/blurImage', () => ({
  __esModule: true,
  blurImage: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

describe('CardBlock', () => {
  const leftSide = { clientX: 0 }
  const rightSide = { clientX: 1000 }

  const originalLocation = window.location
  const mockOrigin = 'https://example.com'

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        origin: mockOrigin
      }
    })
  })

  beforeEach(() => {
    mockUuidv4.mockReturnValue('uuid')
    const blurImageMock = blurImage as jest.Mock
    blurImageMock.mockReturnValue(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAABA0lEQVQokV2RMY4cQQwDi5S69x7hwP9/ngMfPDstOpiFAwcVECAqIPXz60fUxq9F7UWtRlUgmBzuuXnfF3+ui+/r4tcVcgumQIUFiHyA/7OTB0IRXgwk/2h7kEwBxVNWHpMIEMIQDskNOSjFdwQR3Q0YymCLspCFFAJYIAVxkN/IN9JCMr8R7W1k4/WhC7uQgIhocAq30Qh6gMNkCEPr1ciFeuG18VrUR6A55AhrEAdyCHBKdERJNHuBC9ZGe6NeqJoSaAZuM3pGJcNI1ARjpKKzFlTBWrAX6o26EcJzwEKEZPAcDDiDgNh0usFFqqEb1kJVjyB+XjgL1xvXwjMoNxKMzF9Ukn10nay9yQAAAABJRU5ErkJggg=='
    )
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', originalLocation)
  })

  const step1: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step2.id',
    slug: null,
    children: []
  }
  const step2: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: 'card2.id',
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step3.id',
    slug: null,
    children: []
  }
  const step3: TreeBlock<StepBlock> = {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: 'card3.id',
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: []
  }
  const card1: TreeBlock<CardBlock> = {
    id: 'card1.id',
    __typename: 'CardBlock',
    parentOrder: 0,
    parentBlockId: null,
    backgroundColor: null,
    coverBlockId: null,
    themeName: null,
    themeMode: null,
    fullscreen: false,
    children: [step1]
  }

  const card2: TreeBlock<CardBlock> = {
    id: 'card2.id',
    __typename: 'CardBlock',
    parentOrder: 1,
    parentBlockId: null,
    backgroundColor: null,
    coverBlockId: null,
    themeName: null,
    themeMode: null,
    fullscreen: false,
    children: [step2]
  }
  const card3: TreeBlock<CardBlock> = {
    id: 'card3.id',
    __typename: 'CardBlock',
    parentOrder: 2,
    parentBlockId: null,
    backgroundColor: null,
    coverBlockId: null,
    themeName: null,
    themeMode: null,
    fullscreen: false,
    children: [step3]
  }

  const block: TreeBlock = {
    __typename: 'CardBlock',
    id: 'card',
    parentBlockId: null,
    backgroundColor: null,
    coverBlockId: null,
    parentOrder: 0,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    children: [
      {
        id: 'typographyBlockId',
        __typename: 'TypographyBlock',
        parentBlockId: null,
        parentOrder: 0,
        align: null,
        color: null,
        content: 'How did we get here?',
        variant: null,
        children: []
      }
    ]
  }

  const imageBlock: TreeBlock<ImageFields> = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'card',
    parentOrder: 0,
    scale: null,
    children: []
  }

  const videoBlock: TreeBlock<VideoFields> = {
    __typename: 'VideoBlock',
    id: 'videoBlockId',
    parentBlockId: 'card',
    parentOrder: 0,
    muted: true,
    autoplay: true,
    startAt: null,
    endAt: null,
    posterBlockId: 'posterBlockId',
    fullsize: null,
    action: null,
    videoId: '2_0-FallingPlates',
    videoVariantLanguageId: '529',
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    duration: null,
    image: null,
    objectFit: null,
    video: {
      __typename: 'Video',
      id: '2_0-FallingPlates',
      title: [
        {
          __typename: 'VideoTitle',
          value: 'FallingPlates'
        }
      ],
      image:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
      variant: {
        __typename: 'VideoVariant',
        id: '2_0-FallingPlates-529',
        hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
      },
      variantLanguages: []
    },
    children: [
      {
        ...imageBlock,
        id: 'posterBlockId',
        alt: 'random image from unsplash - video',
        parentBlockId: 'videoBlockId'
      }
    ]
  }

  const journey = {
    id: 'journey.id',
    language: {
      bcp: 'en'
    }
  } as unknown as Journey

  const mockStepPreviousEventCreate: MockedResponse<StepPreviousEventCreate> = {
    request: {
      query: STEP_PREVIOUS_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step2.id',
          previousStepId: 'step1.id',
          label: 'Step {{number}}',
          value: 'Step {{number}}'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        stepPreviousEventCreate: {
          id: 'uuid',
          __typename: 'StepPreviousEvent'
        }
      }
    }))
  }

  const mockStepNextEventCreate: MockedResponse<StepNextEventCreate> = {
    request: {
      query: STEP_NEXT_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId: 'step1.id',
          nextStepId: 'step2.id',
          label: 'Step {{number}}',
          value: 'Step {{number}}'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        stepNextEventCreate: {
          id: 'uuid',
          __typename: 'StepNextEvent'
        }
      }
    }))
  }

  const getStepViewEventMock = (
    blockId: string,
    value?: string
  ): MockedResponse<StepViewEventCreate> => ({
    request: {
      query: STEP_VIEW_EVENT_CREATE,
      variables: {
        input: {
          id: 'uuid',
          blockId,
          value: value ?? 'Step {{number}}'
        }
      }
    },
    result: {
      data: {
        stepViewEventCreate: {
          id: 'uuid',
          __typename: 'StepViewEvent'
        }
      }
    }
  })

  it('should render card with theme background color', async () => {
    const { getByTestId, getByText } = render(
      <MockedProvider>
        <Card {...block} />
      </MockedProvider>
    )

    expect(blurImage).not.toHaveBeenCalled()
    expect(getByTestId('JourneysCard-card')).toHaveStyle(
      'background-color: #FFF'
    )
    await waitFor(() =>
      expect(getByText('How did we get here?')).toBeInTheDocument()
    )
  })

  it('should render card with override background color', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <Card
          {...block}
          themeMode={ThemeMode.dark}
          themeName={ThemeName.base}
          backgroundColor="#F1A025"
        />
      </MockedProvider>
    )

    expect(blurImage).not.toHaveBeenCalled()
    expect(getByTestId('JourneysCard-card')).toHaveStyle(
      'background-color: #F1A025'
    )
  })

  it('should render expanded cover if no coverBlockId', () => {
    const { queryByText, getByTestId } = render(
      <MockedProvider>
        <Card {...block} coverBlockId={null} />
      </MockedProvider>
    )

    expect(blurImage).not.toHaveBeenCalled()
    expect(getByTestId('CardExpandedCover')).toBeInTheDocument()
    expect(queryByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render expanded cover if invalid coverBlockId', () => {
    const { queryByText, getByTestId } = render(
      <MockedProvider>
        <Card {...block} coverBlockId="fakeId" />
      </MockedProvider>
    )

    expect(blurImage).not.toHaveBeenCalled()
    expect(getByTestId('CardExpandedCover')).toBeInTheDocument()
    expect(queryByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render expanded cover with blur image background', async () => {
    const { queryByText, getByTestId } = render(
      <MockedProvider>
        <Card
          {...{ ...block, children: [...block.children, imageBlock] }}
          fullscreen
          coverBlockId="imageBlockId"
        />
      </MockedProvider>
    )

    expect(blurImage).toHaveBeenCalledWith(imageBlock.blurhash, '#fff')
    expect(getByTestId('CardExpandedCover')).toBeInTheDocument()
    await waitFor(() =>
      expect(getByTestId('CardExpandedImageCover')).toBeInTheDocument()
    )
    expect(queryByText('How did we get here?')).toBeInTheDocument()
  })

  it('should render contained cover with image cover', () => {
    const { queryByTestId, queryAllByText } = render(
      <MockedProvider>
        <Card
          {...{ ...block, children: [...block.children, imageBlock] }}
          coverBlockId="imageBlockId"
        />
      </MockedProvider>
    )
    const standaloneImageBlock = queryByTestId(`JourneysImage-${imageBlock.id}`)

    expect(blurImage).toHaveBeenCalledWith(imageBlock.blurhash, '#fff')
    expect(queryByTestId('CardContainedCover')).toBeInTheDocument()
    expect(queryByTestId('background-image')).toHaveAccessibleName(
      'random image from unsplash'
    )
    expect(standaloneImageBlock).not.toBeInTheDocument()
    expect(queryAllByText('How did we get here?')[0]).toBeInTheDocument()
  })

  it('should render contained cover with video cover regardless of fullscreen true', () => {
    const { queryByTestId, queryAllByText } = render(
      <MockedProvider>
        <Card
          {...{ ...block, children: [...block.children, videoBlock] }}
          coverBlockId="videoBlockId"
          fullscreen
        />
      </MockedProvider>
    )
    const standaloneVideoBlock = queryByTestId(`JourneysVideo-${videoBlock.id}`)

    expect(queryByTestId('CardContainedCover')).toBeInTheDocument()
    expect(queryByTestId('CardExpandedImageCover')).not.toBeInTheDocument()
    expect(queryByTestId('video-poster-image')).toHaveAccessibleName(
      'card video image'
    )
    expect(standaloneVideoBlock).not.toBeInTheDocument()
    expect(queryAllByText('How did we get here?')[0]).toBeInTheDocument()
  })

  it('should navigate to next card', async () => {
    mockUuidv4.mockReturnValue('uuid')
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepNextEventCreate]}>
        <JourneyProvider value={{ journey }}>
          <Card {...card1} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('JourneysCard-card1.id'), rightSide)

    expect(blockHistoryVar()).toHaveLength(2)
    expect(blockHistoryVar()[1].id).toBe('step2.id')

    await waitFor(() =>
      expect(mockStepNextEventCreate.result).toHaveBeenCalled()
    )
    expect(mockPlausible).toHaveBeenCalledWith('navigateNextStep', {
      u: `${mockOrigin}/journey.id/step1.id`,
      props: {
        id: 'uuid',
        blockId: 'step1.id',
        label: 'Step {{number}}',
        value: 'Step {{number}}',
        nextStepId: 'step2.id',
        key: keyify({
          stepId: 'step1.id',
          event: 'navigateNextStep',
          blockId: 'step1.id',
          target: 'step2.id'
        }),
        simpleKey: keyify({
          stepId: 'step1.id',
          event: 'navigateNextStep',
          blockId: 'step1.id'
        })
      }
    })
    expect(mockedSendGTMEvent).toHaveBeenCalledWith({
      event: 'step_next',
      eventId: 'uuid',
      blockId: 'step1.id',
      stepName: 'Step {{number}}',
      targetStepId: 'step2.id',
      targetStepName: 'Step {{number}}'
    })
  })

  it('should navigate to previous card', async () => {
    mockUuidv4.mockReturnValue('uuid')
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const { getByTestId } = render(
      <MockedProvider
        mocks={[getStepViewEventMock(step2.id), mockStepPreviousEventCreate]}
      >
        <JourneyProvider value={{ journey }}>
          <Card {...card2} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('JourneysCard-card2.id'), leftSide)

    expect(blockHistoryVar()).toHaveLength(1)
    expect(blockHistoryVar()[0].id).toBe('step1.id')

    await waitFor(() =>
      expect(mockStepPreviousEventCreate.result).toHaveBeenCalled()
    )
    expect(mockPlausible).toHaveBeenCalledWith('navigatePreviousStep', {
      u: `${mockOrigin}/journey.id/step2.id`,
      props: {
        id: 'uuid',
        blockId: 'step2.id',
        label: 'Step {{number}}',
        value: 'Step {{number}}',
        previousStepId: 'step1.id',
        key: keyify({
          stepId: 'step2.id',
          event: 'navigatePreviousStep',
          blockId: 'step2.id',
          target: 'step1.id'
        }),
        simpleKey: keyify({
          stepId: 'step2.id',
          event: 'navigatePreviousStep',
          blockId: 'step2.id'
        })
      }
    })
    expect(mockedSendGTMEvent).toHaveBeenCalledWith({
      event: 'step_prev',
      eventId: 'uuid',
      blockId: 'step2.id',
      stepName: 'Step {{number}}',
      targetStepId: 'step1.id',
      targetStepName: 'Step {{number}}'
    })
  })

  it('should block navigate next for locked cards', () => {
    const stepBlock: TreeBlock<StepBlock> = {
      ...step1,
      locked: true
    }
    const lockedCard: TreeBlock<CardBlock> = {
      ...card1,
      children: [stepBlock]
    }
    treeBlocksVar([lockedCard, step2, step3])
    blockHistoryVar([stepBlock])

    const { getByTestId } = render(
      <MockedProvider mocks={[getStepViewEventMock(step1.id, 'Untitled')]}>
        <Card {...lockedCard} />
      </MockedProvider>
    )

    fireEvent.click(getByTestId('JourneysCard-card1.id'), rightSide)

    expect(blockHistoryVar()).toHaveLength(1)
  })

  it('should block navigate previous on the first card', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider mocks={[getStepViewEventMock(step1.id)]}>
        <Card {...card1} />
      </MockedProvider>
    )

    fireEvent.click(getByTestId('JourneysCard-card1.id'), leftSide)

    expect(blockHistoryVar()).toHaveLength(1)
  })

  it('should block navigate next on the last card', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2, step3])

    const { getByTestId } = render(
      <MockedProvider mocks={[getStepViewEventMock(step3.id)]}>
        <Card {...card3} />
      </MockedProvider>
    )

    fireEvent.click(getByTestId('JourneysCard-card3.id'), rightSide)

    expect(blockHistoryVar()).toHaveLength(3)
  })

  it('should navigate next on rtl', () => {
    mockUsePlausible.mockReturnValue(jest.fn())
    const journey = {
      language: {
        bcp47: 'ar'
      }
    } as unknown as Journey

    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId } = render(
      <MockedProvider
        mocks={[getStepViewEventMock(step1.id), mockStepNextEventCreate]}
      >
        <JourneyProvider value={{ journey }}>
          <Card {...card1} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('JourneysCard-card1.id'), leftSide)

    expect(blockHistoryVar()).toHaveLength(2)
    expect(blockHistoryVar()[1].id).toBe('step2.id')
  })

  it('should navigate previous on rtl', () => {
    mockUsePlausible.mockReturnValue(jest.fn())
    const journey = {
      language: {
        bcp47: 'ar'
      }
    } as unknown as Journey

    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1, step2])

    const { getByTestId } = render(
      <MockedProvider mocks={[mockStepPreviousEventCreate]}>
        <JourneyProvider value={{ journey }}>
          <Card {...card2} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('JourneysCard-card2.id'), rightSide)

    expect(blockHistoryVar()).toHaveLength(1)
    expect(blockHistoryVar()[0].id).toBe('step1.id')
  })
})
