import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  CardFormCreate,
  CardFormCreateVariables
} from '../../../../../../../../../__generated__/CardFormCreate'
import {
  CardFormDelete,
  CardFormDeleteVariables
} from '../../../../../../../../../__generated__/CardFormDelete'
import {
  CardFormRestore,
  CardFormRestoreVariables
} from '../../../../../../../../../__generated__/CardFormRestore'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import {
  CARD_FORM_CREATE,
  CARD_FORM_DELETE,
  CARD_FORM_RESTORE
} from './CardForm'

import { CardForm } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('CardForm', () => {
  beforeEach(() => jest.clearAllMocks())

  const card: TreeBlock = {
    id: 'cardId',
    __typename: 'CardBlock',
    parentBlockId: 'stepId',
    coverBlockId: null,
    parentOrder: 0,
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null,
    children: []
  }
  const step: TreeBlock = {
    id: 'stepId',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: [card]
  }
  const cardFormCreateMock: MockedResponse<
    CardFormCreate,
    CardFormCreateVariables
  > = {
    request: {
      query: CARD_FORM_CREATE,
      variables: {
        imageInput: {
          id: 'imageId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          alt: 'photo-1488048924544-c818a467dacd',
          blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
          height: 3456,
          src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
          width: 5184,
          isCover: true,
          scale: null,
          focalLeft: 50,
          focalTop: 50
        },
        subtitleInput: {
          id: 'subtitleId',
          align: null,
          color: null,
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          content: 'Prayer Request',
          variant: TypographyVariant.h6
        },
        titleInput: {
          id: 'titleId',
          align: null,
          color: null,
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          content: 'How can we pray for you?',
          variant: TypographyVariant.h1
        },
        textResponseInput: {
          id: 'textResponseId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          label: 'My Prayer:'
        },
        buttonInput: {
          id: 'buttonId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          label: '',
          variant: ButtonVariant.contained,
          color: ButtonColor.primary,
          size: ButtonSize.medium,
          submitEnabled: true
        },
        buttonId: 'buttonId',
        buttonUpdateInput: {
          startIconId: 'startIconId',
          endIconId: 'endIconId'
        },
        startIconInput: {
          id: 'startIconId',
          journeyId: 'journeyId',
          parentBlockId: 'buttonId',
          name: null
        },
        endIconInput: {
          id: 'endIconId',
          journeyId: 'journeyId',
          parentBlockId: 'buttonId',
          name: null
        },
        bodyInput: {
          id: 'bodyId',
          align: null,
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          content:
            "Each day, we pray for those in our city. We'd be grateful to include your personal needs.",
          variant: TypographyVariant.caption,
          color: TypographyColor.secondary
        },
        journeyId: 'journeyId',
        cardId: 'cardId',
        cardInput: {
          fullscreen: true
        }
      }
    },
    result: {
      data: {
        image: {
          id: 'imageId',
          parentBlockId: 'cardId',
          parentOrder: null,
          src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
          alt: 'photo-1488048924544-c818a467dacd',
          width: 5184,
          height: 3456,
          blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
          __typename: 'ImageBlock',
          scale: null,
          focalLeft: 50,
          focalTop: 50
        },
        subtitle: {
          id: 'subtitleId',
          parentBlockId: 'cardId',
          parentOrder: 0,
          align: null,
          color: null,
          content: 'Prayer Request',
          variant: TypographyVariant.h6,
          __typename: 'TypographyBlock'
        },
        title: {
          id: 'titleId',
          parentBlockId: 'cardId',
          parentOrder: 1,
          align: null,
          color: null,
          content: 'How can we pray for you?',
          variant: TypographyVariant.h1,
          __typename: 'TypographyBlock'
        },
        textResponse: {
          id: 'textResponseId',
          parentBlockId: 'cardId',
          parentOrder: 2,
          label: 'My Prayer:',
          placeholder: null,
          hint: null,
          minRows: null,
          integrationId: null,
          type: null,
          routeId: null,
          required: null,
          __typename: 'TextResponseBlock'
        },
        button: {
          id: 'buttonId',
          parentBlockId: 'cardId',
          parentOrder: 3,
          label: '',
          buttonVariant: ButtonVariant.contained,
          buttonColor: ButtonColor.primary,
          size: ButtonSize.medium,
          startIconId: 'startIconId',
          endIconId: 'endIconId',
          action: null,
          submitEnabled: true,
          __typename: 'ButtonBlock'
        },
        startIcon: {
          id: 'startIconId',
          parentBlockId: 'buttonId',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        endIcon: {
          id: 'endIconId',
          parentBlockId: 'buttonId',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        buttonUpdate: {
          id: 'buttonId',
          parentBlockId: 'cardId',
          parentOrder: 3,
          label: '',
          buttonVariant: ButtonVariant.contained,
          buttonColor: ButtonColor.primary,
          size: ButtonSize.medium,
          startIconId: 'startIconId',
          endIconId: 'endIconId',
          action: null,
          submitEnabled: true,
          __typename: 'ButtonBlock'
        },
        body: {
          id: 'bodyId',
          parentBlockId: 'cardId',
          parentOrder: 4,
          align: null,
          color: TypographyColor.secondary,
          content:
            "Each day, we pray for those in our city. We'd be grateful to include your personal needs.",
          variant: TypographyVariant.caption,
          __typename: 'TypographyBlock'
        },
        cardBlockUpdate: {
          id: 'cardId',
          parentBlockId: 'stepId',
          parentOrder: 0,
          backgroundColor: null,
          coverBlockId: 'imageId',
          themeMode: null,
          themeName: null,
          fullscreen: true,
          backdropBlur: null,
          __typename: 'CardBlock'
        }
      }
    }
  }

  const cardFormDeleteMock: MockedResponse<
    CardFormDelete,
    CardFormDeleteVariables
  > = {
    request: {
      query: CARD_FORM_DELETE,
      variables: {
        imageId: 'imageId',
        bodyId: 'bodyId',
        textResponseId: 'textResponseId',
        titleId: 'titleId',
        subtitleId: 'subtitleId',
        buttonId: 'buttonId',
        startIconId: 'startIconId',
        endIconId: 'endIconId',
        journeyId: 'journeyId',
        cardId: 'cardId',
        cardInput: { fullscreen: false }
      }
    },
    result: {
      data: {
        image: [],
        body: [],
        textResponse: [],
        title: [],
        subtitle: [],
        button: [],
        startIcon: [],
        endIcon: [],
        cardBlockUpdate: card
      }
    }
  }

  const cardFormRestoreMock: MockedResponse<
    CardFormRestore,
    CardFormRestoreVariables
  > = {
    request: {
      query: CARD_FORM_RESTORE,
      variables: {
        imageId: 'imageId',
        bodyId: 'bodyId',
        textResponseId: 'textResponseId',
        titleId: 'titleId',
        subtitleId: 'subtitleId',
        buttonId: 'buttonId',
        startIconId: 'startIconId',
        endIconId: 'endIconId',
        journeyId: 'journeyId',
        cardId: 'cardId',
        cardInput: { fullscreen: true }
      }
    },
    result: {
      data: {
        image: [],
        body: [],
        textResponse: [],
        title: [],
        subtitle: [],
        button: [],
        startIcon: [],
        endIcon: [],
        cardBlockUpdate: card
      }
    }
  }

  it('updates card content and updates local cache', async () => {
    mockUuidv4.mockReturnValueOnce('imageId')
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('textResponseId')
    mockUuidv4.mockReturnValueOnce('buttonId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')
    mockUuidv4.mockReturnValueOnce('bodyId')

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardFormCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardForm />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Form Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'ImageBlock:imageId' },
        { __ref: 'TypographyBlock:subtitleId' },
        { __ref: 'TypographyBlock:titleId' },
        { __ref: 'TextResponseBlock:textResponseId' },
        { __ref: 'ButtonBlock:buttonId' },
        { __ref: 'IconBlock:startIconId' },
        { __ref: 'IconBlock:endIconId' },
        { __ref: 'TypographyBlock:bodyId' }
      ])
    })
  })

  it('should undo card form', async () => {
    mockUuidv4.mockReturnValueOnce('imageId')
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('textResponseId')
    mockUuidv4.mockReturnValueOnce('buttonId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')
    mockUuidv4.mockReturnValueOnce('bodyId')

    const result = jest.fn().mockResolvedValue(cardFormCreateMock.result)
    const result1 = jest.fn().mockResolvedValue(cardFormDeleteMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardFormCreateMock, result },
          { ...cardFormDeleteMock, result: result1 }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardForm />
            <CommandUndoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Form Template' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => {
      expect(result1).toHaveBeenCalled()
    })
  })

  it('should redo card form', async () => {
    mockUuidv4.mockReturnValueOnce('imageId')
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('textResponseId')
    mockUuidv4.mockReturnValueOnce('buttonId')
    mockUuidv4.mockReturnValueOnce('startIconId')
    mockUuidv4.mockReturnValueOnce('endIconId')
    mockUuidv4.mockReturnValueOnce('bodyId')

    const result = jest.fn().mockResolvedValue(cardFormCreateMock.result)
    const result1 = jest.fn().mockResolvedValue(cardFormDeleteMock.result)
    const result2 = jest.fn().mockResolvedValue(cardFormRestoreMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardFormCreateMock, result },
          { ...cardFormDeleteMock, result: result1 },
          { ...cardFormRestoreMock, result: result2 }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardForm />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card Form Template' }))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => {
      expect(result1).toHaveBeenCalled()
    })
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => {
      expect(result2).toHaveBeenCalled()
    })
  })
})
