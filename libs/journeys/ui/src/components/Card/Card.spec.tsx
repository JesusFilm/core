import { MockedProvider } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import { SnackbarProvider } from 'notistack'
import { v4 as uuidv4 } from 'uuid'

import {
  TextResponseType,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import {
  type TreeBlock,
  blockHistoryVar,
  treeBlocksVar
} from '../../libs/block'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../libs/block/__generated__/BlockFields'
import { blurImage } from '../../libs/blurImage'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify } from '../../libs/plausibleHelpers/plausibleHelpers'

import {
  action,
  block,
  buttonBlock,
  card1,
  card2,
  card3,
  createMockButtonClickEvent,
  getStepViewEventMock,
  imageBlock,
  journey,
  leftSide,
  mockStepNextEventCreate,
  mockStepPreviousEventCreate,
  mockTextResponse1SubmissionEventCreate,
  mockTextResponse2SubmissionEventCreate,
  mockTextResponseEmailSubmissionEventCreate,
  mockTextResponseSubmissionEventCreate,
  rightSide,
  step1,
  step2,
  step3,
  textResponseBlock,
  videoBlock
} from './Card.mock'

import { Card } from '.'

jest.mock('../../libs/blurImage', () => ({
  __esModule: true,
  blurImage: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

jest.mock('next/legacy/image', () => ({
  __esModule: true,
  default: jest.fn(
    ({ priority, blurDataURL, objectFit, objectPosition, ...props }) => {
      return <img {...props} />
    }
  )
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
    jest.clearAllMocks()
    treeBlocksVar([])
    blockHistoryVar([])
    mockUuidv4.mockReturnValue('uuid')
    const blurImageMock = blurImage as jest.Mock
    blurImageMock.mockReturnValue(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAABA0lEQVQokV2RMY4cQQwDi5S69x7hwP9/ngMfPDstOpiFAwcVECAqIPXz60fUxq9F7UWtRlUgmBzuuXnfF3+ui+/r4tcVcgumQIUFiHyA/7OTB0IRXgwk/2h7kEwBxVNWHpMIEMIQDskNOSjFdwQR3Q0YymCLspCFFAJYIAVxkN/IN9JCMr8R7W1k4/WhC7uQgIhocAq30Qh6gMNkCEPr1ciFeuG18VrUR6A55AhrEAdyCHBKdERJNHuBC9ZGe6NeqJoSaAZuM3pGJcNI1ARjpKKzFlTBWrAX6o26EcJzwEKEZPAcDDiDgNh0usFFqqEb1kJVjyB+XjgL1xvXwjMoNxKMzF9Ukn10nay9yQAAAABJRU5ErkJggg=='
    )
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', originalLocation)
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

  it('should render contained cover with image cover', async () => {
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

    await waitFor(() =>
      expect(queryAllByText('How did we get here?')[0]).toBeInTheDocument()
    )
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
        mocks={[
          getStepViewEventMock(step2.id),
          getStepViewEventMock(step1.id),
          mockStepPreviousEventCreate
        ]}
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
      <MockedProvider
        mocks={[
          getStepViewEventMock(step2.id),
          getStepViewEventMock(step1.id),
          mockStepPreviousEventCreate
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <Card {...card2} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('JourneysCard-card2.id'), rightSide)

    expect(blockHistoryVar()).toHaveLength(1)
    expect(blockHistoryVar()[0].id).toBe('step1.id')
  })

  it('should have formik context for submissions', async () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step2])

    const stepViewEventMock = getStepViewEventMock(step2.id)

    const { getByTestId } = render(
      <MockedProvider mocks={[stepViewEventMock]}>
        <JourneyProvider value={{ variant: 'default' }}>
          <Card {...card2} />
        </JourneyProvider>
      </MockedProvider>
    )

    const cardFormElement = getByTestId(`card-form-${card2.id}`)
    expect(cardFormElement).toBeInTheDocument()
    expect(cardFormElement.tagName).toBe('FORM')
  })

  it('should handle formik submission', async () => {
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const textResponseCard: TreeBlock<CardBlock> = {
      ...card1,
      children: [{ ...textResponseBlock, parentBlockId: card1.id }]
    }

    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const { getByTestId, getByLabelText } = render(
      <MockedProvider
        mocks={[
          mockStepNextEventCreate,
          mockTextResponseSubmissionEventCreate,
          getStepViewEventMock(step1.id, 'Step {{number}}'),
          getStepViewEventMock(step2.id, 'Step {{number}}'),
          getStepViewEventMock(step3.id, 'Step {{number}}')
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <Card {...textResponseCard} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      const textInput = getByLabelText('Text Response')
      fireEvent.change(textInput, { target: { value: 'Test response' } })
    })

    const form = getByTestId(`card-form-${card1.id}`)
    fireEvent.submit(form)

    await waitFor(() =>
      expect(mockTextResponseSubmissionEventCreate.result).toHaveBeenCalled()
    )
  })

  it('should handle empty formik submission', async () => {
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const textResponseStep: TreeBlock<StepBlock> = {
      ...step1,
      children: [],
      locked: false
    }
    const textResponseCard: TreeBlock<CardBlock> = {
      ...card1,
      children: [
        textResponseStep,
        { ...textResponseBlock, parentBlockId: card1.id }
      ]
    }

    treeBlocksVar([textResponseCard, step2, step3])
    blockHistoryVar([textResponseStep])

    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          mockStepNextEventCreate,
          mockTextResponseSubmissionEventCreate,
          getStepViewEventMock(step1.id, 'Untitled')
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <Card {...textResponseCard} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const form = getByTestId(`card-form-${card1.id}`)
    fireEvent.submit(form)

    await waitFor(() =>
      expect(
        mockTextResponseSubmissionEventCreate.result
      ).not.toHaveBeenCalled()
    )
  })

  it('should validate required fields in forms', async () => {
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const textResponseCard: TreeBlock<CardBlock> = {
      ...card1,
      children: [
        step1,
        {
          ...textResponseBlock,
          id: 'textResponse1',
          label: 'Text Response 1',
          parentBlockId: card1.id,
          required: true
        },
        {
          ...textResponseBlock,
          id: 'textResponse2',
          label: 'Text Response 2',
          parentBlockId: card1.id,
          required: true
        },
        { ...buttonBlock, parentBlockId: card1.id, submitEnabled: true }
      ]
    }

    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const mockButtonClickEvent = createMockButtonClickEvent(
      'button',
      'step1.id',
      buttonBlock.label,
      action.__typename,
      action.url
    )

    render(
      <MockedProvider
        mocks={[
          mockStepNextEventCreate,
          mockButtonClickEvent,
          mockTextResponse1SubmissionEventCreate,
          mockTextResponse2SubmissionEventCreate,
          getStepViewEventMock(step1.id, 'Step {{number}}')
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <Card {...textResponseCard} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'This is a button' })
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: 'Text Response 1*' })
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: 'Text Response 2*' })
      ).toBeInTheDocument()
    })

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Text Response 2*' }),
      {
        target: { value: 'Test response for field 2' }
      }
    )

    fireEvent.click(screen.getByRole('button', { name: 'This is a button' }))

    await waitFor(() => {
      expect(
        mockTextResponse1SubmissionEventCreate.result
      ).not.toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(
        mockTextResponse2SubmissionEventCreate.result
      ).not.toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockButtonClickEvent.result).not.toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Text Response 1*' }),
      {
        target: { value: 'Test response for field 1' }
      }
    )

    fireEvent.click(screen.getByRole('button', { name: 'This is a button' }))

    await waitFor(() => {
      expect(
        screen.queryByText('This field is required')
      ).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(mockTextResponse1SubmissionEventCreate.result).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockTextResponse2SubmissionEventCreate.result).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(mockButtonClickEvent.result).toHaveBeenCalled()
    })
  })

  it('should validate required email field in forms', async () => {
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    const requiredTextResponseBlock = {
      ...textResponseBlock,
      required: true
    }

    const textResponseCard: TreeBlock<CardBlock> = {
      ...card1,
      children: [
        step1,
        {
          ...(requiredTextResponseBlock as unknown as TreeBlock<TextResponseBlock>),
          id: 'textResponse1',
          label: 'Text Response 1',
          parentBlockId: card1.id,
          type: TextResponseType.email
        },

        { ...buttonBlock, parentBlockId: card1.id, submitEnabled: true }
      ]
    }

    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])

    const mockButtonClickEvent = createMockButtonClickEvent(
      'button',
      'step1.id',
      buttonBlock.label,
      action.__typename,
      action.url
    )

    render(
      <MockedProvider
        mocks={[
          mockStepNextEventCreate,
          mockButtonClickEvent,
          mockTextResponseEmailSubmissionEventCreate,
          getStepViewEventMock(step1.id, 'Step {{number}}')
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider value={{ journey }}>
            <Card {...textResponseCard} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'This is a button' })
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: 'Text Response 1*' })
      ).toBeInTheDocument()
    })

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Text Response 1*' }),
      {
        target: { value: 'Test response for field 2' }
      }
    )

    fireEvent.click(screen.getByRole('button', { name: 'This is a button' }))

    await waitFor(() => {
      expect(
        mockTextResponseEmailSubmissionEventCreate.result
      ).not.toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockButtonClickEvent.result).not.toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(
        screen.getByText('Please enter a valid email address')
      ).toBeInTheDocument()
    })

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Text Response 1*' }),
      {
        target: { value: 'test@example.com' }
      }
    )

    fireEvent.click(screen.getByRole('button', { name: 'This is a button' }))

    await waitFor(() => {
      expect(
        screen.queryByText('Please enter a valid email address')
      ).not.toBeInTheDocument()
    })

    await waitFor(() => {
      expect(
        mockTextResponseEmailSubmissionEventCreate.result
      ).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockButtonClickEvent.result).toHaveBeenCalled()
    })
  })
})
