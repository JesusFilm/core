import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  EventLabelButtonEventLabelUpdate,
  EventLabelButtonEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelButtonEventLabelUpdate'
import {
  EventLabelCardEventLabelUpdate,
  EventLabelCardEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelCardEventLabelUpdate'
import {
  EventLabelRadioOptionEventLabelUpdate,
  EventLabelRadioOptionEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelRadioOptionEventLabelUpdate'
import {
  EventLabelVideoEndEventLabelUpdate,
  EventLabelVideoEndEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelVideoEndEventLabelUpdate'
import {
  EventLabelVideoStartEventLabelUpdate,
  EventLabelVideoStartEventLabelUpdateVariables
} from '../../../../../../../../../__generated__/EventLabelVideoStartEventLabelUpdate'
import { BlockEventLabel } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields } from '../../../../../../../../../__generated__/JourneyFields'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import {
  EVENT_LABEL_BUTTON_EVENT_LABEL_UPDATE,
  EVENT_LABEL_CARD_EVENT_LABEL_UPDATE,
  EVENT_LABEL_RADIO_OPTION_EVENT_LABEL_UPDATE,
  EVENT_LABEL_VIDEO_END_EVENT_LABEL_UPDATE,
  EVENT_LABEL_VIDEO_START_EVENT_LABEL_UPDATE,
  EventLabel
} from './EventLabel'

// Helper function to create CardBlock mock
function createCardBlockMock(
  overrides: Partial<TreeBlock<CardBlock>> = {}
): TreeBlock<CardBlock> {
  return {
    id: 'card1.id',
    __typename: 'CardBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    coverBlockId: null,
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null,
    eventLabel: null,
    children: [],
    ...overrides
  } as TreeBlock<CardBlock>
}

// Helper function to create ButtonBlock mock
function createButtonBlockMock(
  overrides: Partial<TreeBlock<ButtonBlock>> = {}
): TreeBlock<ButtonBlock> {
  return {
    id: 'button1.id',
    __typename: 'ButtonBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    label: 'Button',
    variant: null,
    color: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null,
    eventLabel: null,
    submitEnabled: false,
    children: [],
    ...overrides
  } as TreeBlock<ButtonBlock>
}

// Helper function to create RadioOptionBlock mock
function createRadioOptionBlockMock(
  overrides: Partial<TreeBlock<RadioOptionBlock>> = {}
): TreeBlock<RadioOptionBlock> {
  return {
    id: 'radioOption1.id',
    __typename: 'RadioOptionBlock',
    parentBlockId: 'radioQuestion1.id',
    parentOrder: 0,
    label: 'Option',
    eventLabel: null,
    children: [],
    ...overrides
  } as TreeBlock<RadioOptionBlock>
}

// Helper function to create VideoBlock mock
function createVideoBlockMock(
  overrides: Partial<TreeBlock<VideoBlock>> = {}
): TreeBlock<VideoBlock> {
  return {
    id: 'video1.id',
    __typename: 'VideoBlock',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    videoId: null,
    videoVariantLanguageId: null,
    source: null,
    title: null,
    description: null,
    duration: null,
    image: null,
    objectFit: null,
    posterBlockId: null,
    fullWidth: false,
    isCover: false,
    eventLabel: null,
    endEventLabel: null,
    autoplay: false,
    muted: false,
    looping: false,
    startAt: null,
    endAt: null,
    children: [],
    ...overrides
  } as TreeBlock<VideoBlock>
}

// Helper function to create StepBlock mock
function createStepBlockMock(
  overrides: Partial<TreeBlock<StepBlock>> = {}
): TreeBlock<StepBlock> {
  return {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [],
    ...overrides
  } as TreeBlock<StepBlock>
}

// Helper function to create CardEventLabelUpdate mock
function createCardEventLabelUpdateMock(
  id: string,
  eventLabel: BlockEventLabel | null
): MockedResponse<
  EventLabelCardEventLabelUpdate,
  EventLabelCardEventLabelUpdateVariables
> {
  return {
    request: {
      query: EVENT_LABEL_CARD_EVENT_LABEL_UPDATE,
      variables: { id, eventLabel }
    },
    result: {
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id,
          eventLabel
        }
      }
    }
  }
}

// Helper function to create ButtonEventLabelUpdate mock
function createButtonEventLabelUpdateMock(
  id: string,
  eventLabel: BlockEventLabel | null
): MockedResponse<
  EventLabelButtonEventLabelUpdate,
  EventLabelButtonEventLabelUpdateVariables
> {
  return {
    request: {
      query: EVENT_LABEL_BUTTON_EVENT_LABEL_UPDATE,
      variables: { id, eventLabel }
    },
    result: {
      data: {
        buttonBlockUpdate: {
          __typename: 'ButtonBlock',
          id,
          eventLabel
        }
      }
    }
  }
}

// Helper function to create RadioOptionEventLabelUpdate mock
function createRadioOptionEventLabelUpdateMock(
  id: string,
  eventLabel: BlockEventLabel | null
): MockedResponse<
  EventLabelRadioOptionEventLabelUpdate,
  EventLabelRadioOptionEventLabelUpdateVariables
> {
  return {
    request: {
      query: EVENT_LABEL_RADIO_OPTION_EVENT_LABEL_UPDATE,
      variables: { id, eventLabel }
    },
    result: {
      data: {
        radioOptionBlockUpdate: {
          __typename: 'RadioOptionBlock',
          id,
          eventLabel
        }
      }
    }
  }
}

// Helper function to create VideoStartEventLabelUpdate mock
function createVideoStartEventLabelUpdateMock(
  id: string,
  eventLabel: BlockEventLabel | null,
  endEventLabel: BlockEventLabel | null = null
): MockedResponse<
  EventLabelVideoStartEventLabelUpdate,
  EventLabelVideoStartEventLabelUpdateVariables
> {
  return {
    request: {
      query: EVENT_LABEL_VIDEO_START_EVENT_LABEL_UPDATE,
      variables: { id, eventLabel }
    },
    result: {
      data: {
        videoBlockUpdate: {
          __typename: 'VideoBlock',
          id,
          eventLabel,
          endEventLabel
        }
      }
    }
  }
}

// Helper function to create VideoEndEventLabelUpdate mock
function createVideoEndEventLabelUpdateMock(
  id: string,
  endEventLabel: BlockEventLabel | null,
  eventLabel: BlockEventLabel | null = null
): MockedResponse<
  EventLabelVideoEndEventLabelUpdate,
  EventLabelVideoEndEventLabelUpdateVariables
> {
  return {
    request: {
      query: EVENT_LABEL_VIDEO_END_EVENT_LABEL_UPDATE,
      variables: { id, endEventLabel }
    },
    result: {
      data: {
        videoBlockUpdate: {
          __typename: 'VideoBlock',
          id,
          eventLabel,
          endEventLabel
        }
      }
    }
  }
}

const defaultJourney = {
  id: 'journey1.id',
  __typename: 'Journey' as const,
  title: 'Journey Title',
  description: null,
  slug: 'journey-slug',
  language: {
    __typename: 'Language' as const,
    id: 'language1.id',
    name: [
      {
        __typename: 'Translation' as const,
        value: 'English',
        primary: true
      }
    ]
  },
  template: true
} as unknown as JourneyFields

describe('EventLabel', () => {
  describe('Basic Rendering', () => {
    it('should display label for current block', () => {
      const cardBlock = createCardBlockMock({
        eventLabel: BlockEventLabel.decisionForChrist
      })

      render(
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: cardBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      expect(screen.getByText('Event to track:')).toBeInTheDocument()
    })

    it('should display label for current video', () => {
      const videoBlock = createVideoBlockMock({
        eventLabel: BlockEventLabel.specialVideoStart
      })

      render(
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: videoBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel videoActionType="start" />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      expect(screen.getByText('Event to track:')).toBeInTheDocument()
    })

    it('should display current selected option', () => {
      const buttonBlock = createButtonBlockMock({
        eventLabel: BlockEventLabel.prayerRequest
      })

      render(
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: buttonBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      expect(select).toHaveTextContent('Prayer Request')
    })

    it('should display current selected option for card block', () => {
      const cardBlock = createCardBlockMock({
        eventLabel: BlockEventLabel.gospelPresentationStart
      })

      render(
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: cardBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      expect(select).toHaveTextContent('Gospel Presentation Started')
    })

    it('should show helper text', () => {
      const cardBlock = createCardBlockMock()

      render(
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: cardBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel showHelperText={true} />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      expect(
        screen.getByText(
          'Pick the event label you want to appear in analytics. Tracking covers user actions in every project created from your template.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('Card Block', () => {
    it('should update event label', async () => {
      const cardBlock = createCardBlockMock({
        eventLabel: null
      })

      const executeMock = createCardEventLabelUpdateMock(
        'card1.id',
        BlockEventLabel.decisionForChrist
      )
      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)

      render(
        <MockedProvider mocks={[{ ...executeMock, result: mockExecuteResult }]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: cardBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('Decision for Christ')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Decision for Christ'))

      await waitFor(() => {
        expect(mockExecuteResult).toHaveBeenCalled()
      })
    })

    it('should undo event label', async () => {
      const cardBlock = createCardBlockMock({
        eventLabel: BlockEventLabel.decisionForChrist
      })

      const executeMock = createCardEventLabelUpdateMock('card1.id', null)
      const undoMock = createCardEventLabelUpdateMock(
        'card1.id',
        BlockEventLabel.decisionForChrist
      )

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: cardBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('None')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('None'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())
    })

    it('should redo event label', async () => {
      const cardBlock = createCardBlockMock({
        eventLabel: BlockEventLabel.decisionForChrist
      })

      const executeMock = createCardEventLabelUpdateMock('card1.id', null)
      const undoMock = createCardEventLabelUpdateMock(
        'card1.id',
        BlockEventLabel.decisionForChrist
      )
      const redoMock = createCardEventLabelUpdateMock('card1.id', null)

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)
      const mockRedoResult = jest.fn().mockReturnValue(redoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult },
            { ...redoMock, result: mockRedoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: cardBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <CommandRedoItem variant="icon-button" />
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('None')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('None'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())

      const redo = screen.getByRole('button', { name: 'Redo' })
      await waitFor(() => expect(redo).not.toBeDisabled())
      fireEvent.click(redo)
      await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    })
  })

  describe('Button Block', () => {
    it('should update event label', async () => {
      const buttonBlock = createButtonBlockMock({
        eventLabel: null
      })

      const executeMock = createButtonEventLabelUpdateMock(
        'button1.id',
        BlockEventLabel.prayerRequest
      )
      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)

      render(
        <MockedProvider mocks={[{ ...executeMock, result: mockExecuteResult }]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: buttonBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('Prayer Request')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Prayer Request'))

      await waitFor(() => {
        expect(mockExecuteResult).toHaveBeenCalled()
      })
    })

    it('should undo event label', async () => {
      const buttonBlock = createButtonBlockMock({
        eventLabel: BlockEventLabel.prayerRequest
      })

      const executeMock = createButtonEventLabelUpdateMock(
        'button1.id',
        BlockEventLabel.decisionForChrist
      )
      const undoMock = createButtonEventLabelUpdateMock(
        'button1.id',
        BlockEventLabel.prayerRequest
      )

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: buttonBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('Decision for Christ')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Decision for Christ'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())
    })

    it('should redo event label', async () => {
      const buttonBlock = createButtonBlockMock({
        eventLabel: BlockEventLabel.prayerRequest
      })

      const executeMock = createButtonEventLabelUpdateMock(
        'button1.id',
        BlockEventLabel.decisionForChrist
      )
      const undoMock = createButtonEventLabelUpdateMock(
        'button1.id',
        BlockEventLabel.prayerRequest
      )
      const redoMock = createButtonEventLabelUpdateMock(
        'button1.id',
        BlockEventLabel.decisionForChrist
      )

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)
      const mockRedoResult = jest.fn().mockReturnValue(redoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult },
            { ...redoMock, result: mockRedoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: buttonBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <CommandRedoItem variant="icon-button" />
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('Decision for Christ')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Decision for Christ'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())

      const redo = screen.getByRole('button', { name: 'Redo' })
      await waitFor(() => expect(redo).not.toBeDisabled())
      fireEvent.click(redo)
      await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    })
  })

  describe('Radio Option Block', () => {
    it('should update event label', async () => {
      const radioOptionBlock = createRadioOptionBlockMock({
        eventLabel: null
      })

      const executeMock = createRadioOptionEventLabelUpdateMock(
        'radioOption1.id',
        BlockEventLabel.custom1
      )
      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)

      render(
        <MockedProvider mocks={[{ ...executeMock, result: mockExecuteResult }]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: radioOptionBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('Custom Tracking 1')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Custom Tracking 1'))

      await waitFor(() => {
        expect(mockExecuteResult).toHaveBeenCalled()
      })
    })

    it('should undo event label', async () => {
      const radioOptionBlock = createRadioOptionBlockMock({
        eventLabel: BlockEventLabel.custom1
      })

      const executeMock = createRadioOptionEventLabelUpdateMock(
        'radioOption1.id',
        BlockEventLabel.custom2
      )
      const undoMock = createRadioOptionEventLabelUpdateMock(
        'radioOption1.id',
        BlockEventLabel.custom1
      )

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: radioOptionBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('Custom Tracking 2')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Custom Tracking 2'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())
    })

    it('should redo event label', async () => {
      const radioOptionBlock = createRadioOptionBlockMock({
        eventLabel: BlockEventLabel.custom1
      })

      const executeMock = createRadioOptionEventLabelUpdateMock(
        'radioOption1.id',
        BlockEventLabel.custom2
      )
      const undoMock = createRadioOptionEventLabelUpdateMock(
        'radioOption1.id',
        BlockEventLabel.custom1
      )
      const redoMock = createRadioOptionEventLabelUpdateMock(
        'radioOption1.id',
        BlockEventLabel.custom2
      )

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)
      const mockRedoResult = jest.fn().mockReturnValue(redoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult },
            { ...redoMock, result: mockRedoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: radioOptionBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <CommandRedoItem variant="icon-button" />
                <EventLabel />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('Custom Tracking 2')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Custom Tracking 2'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())

      const redo = screen.getByRole('button', { name: 'Redo' })
      await waitFor(() => expect(redo).not.toBeDisabled())
      fireEvent.click(redo)
      await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    })
  })

  describe('Video Block', () => {
    it('should update start event label', async () => {
      const videoBlock = createVideoBlockMock({
        eventLabel: null
      })

      const executeMock = createVideoStartEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.specialVideoStart
      )
      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)

      render(
        <MockedProvider mocks={[{ ...executeMock, result: mockExecuteResult }]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: videoBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel videoActionType="start" />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('Video Started')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Video Started'))

      await waitFor(() => {
        expect(mockExecuteResult).toHaveBeenCalled()
      })
    })

    it('should undo start event label', async () => {
      const videoBlock = createVideoBlockMock({
        eventLabel: BlockEventLabel.specialVideoStart,
        endEventLabel: null
      })

      const executeMock = createVideoStartEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.gospelPresentationStart,
        null
      )
      const undoMock = createVideoStartEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.specialVideoStart,
        null
      )

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: videoBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <EventLabel videoActionType="start" />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(
          screen.getByText('Gospel Presentation Started')
        ).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Gospel Presentation Started'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())
    })

    it('should redo start event label', async () => {
      const videoBlock = createVideoBlockMock({
        eventLabel: BlockEventLabel.specialVideoStart,
        endEventLabel: null
      })

      const executeMock = createVideoStartEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.gospelPresentationStart,
        null
      )
      const undoMock = createVideoStartEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.specialVideoStart,
        null
      )
      const redoMock = createVideoStartEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.gospelPresentationStart,
        null
      )

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)
      const mockRedoResult = jest.fn().mockReturnValue(redoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult },
            { ...redoMock, result: mockRedoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: videoBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <CommandRedoItem variant="icon-button" />
                <EventLabel videoActionType="start" />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(
          screen.getByText('Gospel Presentation Started')
        ).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Gospel Presentation Started'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())

      const redo = screen.getByRole('button', { name: 'Redo' })
      await waitFor(() => expect(redo).not.toBeDisabled())
      fireEvent.click(redo)
      await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    })

    it('should update end event label', async () => {
      const videoBlock = createVideoBlockMock({
        eventLabel: null,
        endEventLabel: null
      })

      const executeMock = createVideoEndEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.specialVideoComplete
      )
      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)

      render(
        <MockedProvider mocks={[{ ...executeMock, result: mockExecuteResult }]}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: videoBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <EventLabel videoActionType="complete" />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(screen.getByText('Video Completed')).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Video Completed'))

      await waitFor(() => {
        expect(mockExecuteResult).toHaveBeenCalled()
      })
    })

    it('should undo end event label', async () => {
      const videoBlock = createVideoBlockMock({
        eventLabel: null,
        endEventLabel: BlockEventLabel.specialVideoComplete
      })

      const executeMock = createVideoEndEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.gospelPresentationComplete,
        null
      )
      const undoMock = createVideoEndEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.specialVideoComplete,
        null
      )

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: videoBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <EventLabel videoActionType="complete" />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(
          screen.getByText('Gospel Presentation Completed')
        ).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Gospel Presentation Completed'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())
    })

    it('should redo end event label', async () => {
      const videoBlock = createVideoBlockMock({
        eventLabel: null,
        endEventLabel: BlockEventLabel.specialVideoComplete
      })

      const executeMock = createVideoEndEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.gospelPresentationComplete,
        null
      )
      const undoMock = createVideoEndEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.specialVideoComplete,
        null
      )
      const redoMock = createVideoEndEventLabelUpdateMock(
        'video1.id',
        BlockEventLabel.gospelPresentationComplete,
        null
      )

      const mockExecuteResult = jest.fn().mockReturnValue(executeMock.result)
      const mockUndoResult = jest.fn().mockReturnValue(undoMock.result)
      const mockRedoResult = jest.fn().mockReturnValue(redoMock.result)

      render(
        <MockedProvider
          mocks={[
            { ...executeMock, result: mockExecuteResult },
            { ...undoMock, result: mockUndoResult },
            { ...redoMock, result: mockRedoResult }
          ]}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider
              initialState={{
                selectedBlock: videoBlock,
                selectedStep: createStepBlockMock()
              }}
            >
              <CommandProvider>
                <CommandUndoItem variant="icon-button" />
                <CommandRedoItem variant="icon-button" />
                <EventLabel videoActionType="complete" />
              </CommandProvider>
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const select = screen.getByRole('combobox')
      fireEvent.mouseDown(select)
      await waitFor(() => {
        expect(
          screen.getByText('Gospel Presentation Completed')
        ).toBeInTheDocument()
      })
      fireEvent.click(screen.getByText('Gospel Presentation Completed'))

      await waitFor(() => expect(mockExecuteResult).toHaveBeenCalled())

      const undo = screen.getByRole('button', { name: 'Undo' })
      await waitFor(() => expect(undo).not.toBeDisabled())
      fireEvent.click(undo)
      await waitFor(() => expect(mockUndoResult).toHaveBeenCalled())

      const redo = screen.getByRole('button', { name: 'Redo' })
      await waitFor(() => expect(redo).not.toBeDisabled())
      fireEvent.click(redo)
      await waitFor(() => expect(mockRedoResult).toHaveBeenCalled())
    })
  })
})
