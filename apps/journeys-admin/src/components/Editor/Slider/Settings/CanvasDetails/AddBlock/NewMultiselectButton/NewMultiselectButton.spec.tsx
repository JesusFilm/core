import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'
import {
  MULTISELECT_BLOCK_CREATE,
  MULTISELECT_WITH_BUTTON_CREATE,
  MULTISELECT_WITH_BUTTON_DELETE,
  MULTISELECT_WITH_BUTTON_RESTORE
} from './NewMultiselectButton'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { stepWithSubmitButton, stepWithoutSubmitButton } from './data'

import { NewMultiselectButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

const multiselectBlockCreateMock: MockedResponse = {
  request: {
    query: MULTISELECT_BLOCK_CREATE,
    variables: {
      input: {
        id: 'multiselect.id',
        journeyId: 'journey.id',
        parentBlockId: 'card.id',
        label: 'Your label here'
      },
      multiselectOptionBlockCreateInput1: {
        id: 'option1.id',
        journeyId: 'journey.id',
        parentBlockId: 'multiselect.id',
        label: 'Option 1'
      },
      multiselectOptionBlockCreateInput2: {
        id: 'option2.id',
        journeyId: 'journey.id',
        parentBlockId: 'multiselect.id',
        label: 'Option 2'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      multiselectBlockCreate: {
        __typename: 'MultiselectBlock',
        id: 'multiselect.id',
        parentBlockId: 'card.id',
        parentOrder: 0,
        label: 'Your label here',
        min: null,
        max: null,
        action: null
      },
      multiselectOption1: {
        __typename: 'MultiselectOptionBlock',
        id: 'option1.id',
        parentBlockId: 'multiselect.id',
        parentOrder: 0,
        label: 'Option 1'
      },
      multiselectOption2: {
        __typename: 'MultiselectOptionBlock',
        id: 'option2.id',
        parentBlockId: 'multiselect.id',
        parentOrder: 1,
        label: 'Option 2'
      }
    }
  }))
}

const multiselectWithButtonCreateMock: MockedResponse = {
  request: {
    query: MULTISELECT_WITH_BUTTON_CREATE,
    variables: {
      multiselectInput: {
        id: 'multiselect.id',
        journeyId: 'journey.id',
        parentBlockId: 'card.id',
        label: 'Your label here'
      },
      optionInput1: {
        id: 'option1.id',
        journeyId: 'journey.id',
        parentBlockId: 'multiselect.id',
        label: 'Option 1'
      },
      optionInput2: {
        id: 'option2.id',
        journeyId: 'journey.id',
        parentBlockId: 'multiselect.id',
        label: 'Option 2'
      },
      buttonInput: {
        id: 'button.id',
        journeyId: 'journey.id',
        parentBlockId: 'card.id',
        label: '',
        variant: 'contained',
        color: 'primary',
        size: 'medium',
        submitEnabled: true,
        settings: { alignment: 'justify' }
      },
      iconInput1: {
        id: 'startIcon.id',
        journeyId: 'journey.id',
        parentBlockId: 'button.id',
        name: null
      },
      iconInput2: {
        id: 'endIcon.id',
        journeyId: 'journey.id',
        parentBlockId: 'button.id',
        name: null
      },
      buttonId: 'button.id',
      journeyId: 'journey.id',
      buttonUpdateInput: {
        startIconId: 'startIcon.id',
        endIconId: 'endIcon.id'
      }
    }
  },
  result: jest.fn(() => ({
    data: {
      multiselectBlockCreate: {
        __typename: 'MultiselectBlock',
        id: 'multiselect.id',
        parentBlockId: 'card.id',
        parentOrder: 0,
        label: 'Your label here',
        min: null,
        max: null,
        action: null
      },
      multiselectOption1: {
        __typename: 'MultiselectOptionBlock',
        id: 'option1.id',
        parentBlockId: 'multiselect.id',
        parentOrder: 0,
        label: 'Option 1'
      },
      multiselectOption2: {
        __typename: 'MultiselectOptionBlock',
        id: 'option2.id',
        parentBlockId: 'multiselect.id',
        parentOrder: 1,
        label: 'Option 2'
      },
      button: {
        __typename: 'ButtonBlock',
        id: 'button.id',
        parentBlockId: 'card.id',
        parentOrder: 3,
        label: '',
        buttonVariant: 'contained',
        buttonColor: 'primary',
        size: 'medium',
        startIconId: 'startIcon.id',
        endIconId: 'endIcon.id',
        action: null,
        submitEnabled: true,
        settings: { __typename: 'ButtonBlockSettings', alignment: 'justify' }
      },
      startIcon: {
        __typename: 'IconBlock',
        id: 'startIcon.id',
        parentBlockId: 'button.id',
        parentOrder: null,
        iconName: null,
        iconSize: null,
        iconColor: null
      },
      endIcon: {
        __typename: 'IconBlock',
        id: 'endIcon.id',
        parentBlockId: 'button.id',
        parentOrder: null,
        iconName: null,
        iconSize: null,
        iconColor: null
      },
      buttonUpdate: {
        __typename: 'ButtonBlock',
        id: 'button.id'
      }
    }
  }))
}

const multiselectWithButtonDeleteMock: MockedResponse = {
  request: {
    query: MULTISELECT_WITH_BUTTON_DELETE,
    variables: {
      multiselectId: 'multiselect.id',
      option1Id: 'option1.id',
      option2Id: 'option2.id',
      buttonId: 'button.id',
      startIconId: 'startIcon.id',
      endIconId: 'endIcon.id'
    }
  },
  result: jest.fn(() => ({
    data: {
      multiselect: [
        { id: 'multiselect.id', parentOrder: 0, __typename: 'MultiselectBlock' }
      ],
      option1: [
        {
          id: 'option1.id',
          parentOrder: 0,
          __typename: 'MultiselectOptionBlock'
        }
      ],
      option2: [
        {
          id: 'option2.id',
          parentOrder: 1,
          __typename: 'MultiselectOptionBlock'
        }
      ],
      button: [{ id: 'button.id', parentOrder: 3, __typename: 'ButtonBlock' }],
      startIcon: [
        { id: 'startIcon.id', parentOrder: null, __typename: 'IconBlock' }
      ],
      endIcon: [
        { id: 'endIcon.id', parentOrder: null, __typename: 'IconBlock' }
      ]
    }
  }))
}

const multiselectWithButtonRestoreMock: MockedResponse = {
  request: {
    query: MULTISELECT_WITH_BUTTON_RESTORE,
    variables: {
      multiselectId: 'multiselect.id',
      option1Id: 'option1.id',
      option2Id: 'option2.id',
      buttonId: 'button.id',
      startIconId: 'startIcon.id',
      endIconId: 'endIcon.id'
    }
  },
  result: jest.fn(() => ({
    data: {
      multiselect: [
        {
          id: 'multiselect.id',
          parentOrder: 0,
          parentBlockId: 'card.id',
          __typename: 'MultiselectBlock'
        }
      ],
      option1: [
        {
          id: 'option1.id',
          parentOrder: 0,
          parentBlockId: 'multiselect.id',
          __typename: 'MultiselectOptionBlock'
        }
      ],
      option2: [
        {
          id: 'option2.id',
          parentOrder: 1,
          parentBlockId: 'multiselect.id',
          __typename: 'MultiselectOptionBlock'
        }
      ],
      button: [
        {
          id: 'button.id',
          parentOrder: 3,
          parentBlockId: 'card.id',
          __typename: 'ButtonBlock'
        }
      ],
      startIcon: [
        {
          id: 'startIcon.id',
          parentOrder: null,
          parentBlockId: 'button.id',
          __typename: 'IconBlock'
        }
      ],
      endIcon: [
        {
          id: 'endIcon.id',
          parentOrder: null,
          parentBlockId: 'button.id',
          __typename: 'IconBlock'
        }
      ]
    }
  }))
}

describe('NewMultiselectButton', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('Multiselect only', () => {
    it('should create a new Multiselect with two options', async () => {
      mockUuidv4
        .mockReturnValueOnce('multiselect.id')
        .mockReturnValueOnce('option1.id')
        .mockReturnValueOnce('option2.id')

      const { getByRole } = render(
        <MockedProvider mocks={[multiselectBlockCreateMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithSubmitButton }}
            >
              <NewMultiselectButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Multiselect' }))
      await waitFor(() =>
        expect(multiselectBlockCreateMock.result).toHaveBeenCalled()
      )
    })
  })

  describe('Multiselect with submit button', () => {
    it('should create multiselect with button and update cache', async () => {
      mockUuidv4
        .mockReturnValueOnce('multiselect.id')
        .mockReturnValueOnce('option1.id')
        .mockReturnValueOnce('option2.id')
        .mockReturnValueOnce('button.id')
        .mockReturnValueOnce('startIcon.id')
        .mockReturnValueOnce('endIcon.id')

      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journey.id': {
          blocks: [
            { __ref: 'StepBlock:step.id' },
            { __ref: 'CardBlock:card.id' }
          ],
          id: 'journey.id',
          __typename: 'Journey'
        }
      })

      const { getByRole } = render(
        <MockedProvider cache={cache} mocks={[multiselectWithButtonCreateMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithoutSubmitButton }}
            >
              <NewMultiselectButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Multiselect' }))

      await waitFor(() => {
        expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
          { __ref: 'StepBlock:step.id' },
          { __ref: 'CardBlock:card.id' },
          { __ref: 'MultiselectBlock:multiselect.id' },
          { __ref: 'MultiselectOptionBlock:option1.id' },
          { __ref: 'MultiselectOptionBlock:option2.id' },
          { __ref: 'ButtonBlock:button.id' },
          { __ref: 'IconBlock:startIcon.id' },
          { __ref: 'IconBlock:endIcon.id' }
        ])
      })
    })

    it('should undo multiselect with button creation', async () => {
      mockUuidv4
        .mockReturnValueOnce('multiselect.id')
        .mockReturnValueOnce('option1.id')
        .mockReturnValueOnce('option2.id')
        .mockReturnValueOnce('button.id')
        .mockReturnValueOnce('startIcon.id')
        .mockReturnValueOnce('endIcon.id')

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            multiselectWithButtonCreateMock,
            multiselectWithButtonDeleteMock
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithoutSubmitButton }}
            >
              <CommandUndoItem variant="button" />
              <NewMultiselectButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Multiselect' }))
      await waitFor(() =>
        expect(multiselectWithButtonCreateMock.result).toHaveBeenCalled()
      )

      fireEvent.click(getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(multiselectWithButtonDeleteMock.result).toHaveBeenCalled()
      )
    })

    it('should redo multiselect with button creation', async () => {
      mockUuidv4
        .mockReturnValueOnce('multiselect.id')
        .mockReturnValueOnce('option1.id')
        .mockReturnValueOnce('option2.id')
        .mockReturnValueOnce('button.id')
        .mockReturnValueOnce('startIcon.id')
        .mockReturnValueOnce('endIcon.id')

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            multiselectWithButtonCreateMock,
            multiselectWithButtonDeleteMock,
            multiselectWithButtonRestoreMock
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithoutSubmitButton }}
            >
              <CommandRedoItem variant="button" />
              <CommandUndoItem variant="button" />
              <NewMultiselectButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Multiselect' }))
      await waitFor(() =>
        expect(multiselectWithButtonCreateMock.result).toHaveBeenCalled()
      )

      fireEvent.click(getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(multiselectWithButtonDeleteMock.result).toHaveBeenCalled()
      )

      fireEvent.click(getByRole('button', { name: 'Redo' }))
      await waitFor(() =>
        expect(multiselectWithButtonRestoreMock.result).toHaveBeenCalled()
      )
    })
  })

  describe('loading state', () => {
    it('multiselect only: should disable when loading', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithSubmitButton }}
            >
              <NewMultiselectButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Multiselect' }))
      expect(getByRole('button', { name: 'Multiselect' })).toBeDisabled()
    })

    it('multiselect with button: should disable when loading', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithoutSubmitButton }}
            >
              <NewMultiselectButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Multiselect' }))
      expect(getByRole('button', { name: 'Multiselect' })).toBeDisabled()
    })
  })
})
