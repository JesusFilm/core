import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  CardCtaCreate,
  CardCtaCreateVariables
} from '../../../../../../../../../__generated__/CardCtaCreate'
import {
  CardCtaDelete,
  CardCtaDeleteVariables
} from '../../../../../../../../../__generated__/CardCtaDelete'
import {
  CardCtaRestore,
  CardCtaRestoreVariables
} from '../../../../../../../../../__generated__/CardCtaRestore'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../__generated__/JourneyFields'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import { CARD_CTA_CREATE, CARD_CTA_DELETE, CARD_CTA_RESTORE } from './CardCta'

import { CardCta } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('CardCta', () => {
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

  const updatedCard = {
    ...card,
    backgroundColor: '#0E1412'
  }

  const cardCtaCreateMock: MockedResponse<
    CardCtaCreate,
    CardCtaCreateVariables
  > = {
    request: {
      query: CARD_CTA_CREATE,
      variables: {
        journeyId: 'journeyId',
        imageInput: {
          id: 'imageId',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          alt: 'photo-1474314881477-04c4aac40a0e',
          blurhash: 'L~NTUYkWM{t7~qs:WBofEMjYt7WB',
          height: 4000,
          src: 'https://images.unsplash.com/photo-1474314881477-04c4aac40a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHw3OHx8dGFsa2luZ3xlbnwwfHx8fDE2OTUxNzExNTl8MA&ixlib=rb-4.0.3&q=80&w=1080',
          width: 6000,
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
          content: "Let's Connect",
          variant: TypographyVariant.h6
        },
        titleInput: {
          id: 'titleId',
          align: null,
          color: null,
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          content: "From 'hello' to heartfelt conversations",
          variant: TypographyVariant.h3
        },
        button1Id: 'button1Id',
        button1Input: {
          id: 'button1Id',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          label: 'Chat with us',
          variant: ButtonVariant.contained,
          size: ButtonSize.large,
          submitEnabled: null
        },
        startIcon1Input: {
          id: 'startIcon1Id',
          journeyId: 'journeyId',
          parentBlockId: 'button1Id',
          name: IconName.ChatBubbleOutlineRounded
        },
        endIcon1Input: {
          id: 'endIcon1Id',
          journeyId: 'journeyId',
          parentBlockId: 'button1Id'
        },
        button1UpdateInput: {
          startIconId: 'startIcon1Id',
          endIconId: 'endIcon1Id'
        },
        button2Id: 'button2Id',
        button2Input: {
          id: 'button2Id',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          label: 'Email us',
          variant: ButtonVariant.contained,
          size: ButtonSize.large,
          submitEnabled: null
        },
        startIcon2Input: {
          id: 'startIcon2Id',
          journeyId: 'journeyId',
          parentBlockId: 'button2Id',
          name: IconName.SendRounded
        },
        endIcon2Input: {
          id: 'endIcon2Id',
          journeyId: 'journeyId',
          parentBlockId: 'button2Id'
        },
        button2UpdateInput: {
          startIconId: 'startIcon2Id',
          endIconId: 'endIcon2Id'
        },
        button3Id: 'button3Id',
        button3Input: {
          id: 'button3Id',
          journeyId: 'journeyId',
          parentBlockId: 'cardId',
          label: 'More about us',
          variant: ButtonVariant.text,
          color: ButtonColor.secondary,
          size: ButtonSize.large,
          submitEnabled: null
        },
        startIcon3Input: {
          id: 'startIcon3Id',
          journeyId: 'journeyId',
          parentBlockId: 'button3Id',
          name: IconName.ArrowForwardRounded
        },
        endIcon3Input: {
          id: 'endIcon3Id',
          journeyId: 'journeyId',
          parentBlockId: 'button3Id'
        },
        button3UpdateInput: {
          startIconId: 'startIcon3Id',
          endIconId: 'endIcon3Id'
        },
        cardId: 'cardId',
        cardInput: {
          backgroundColor: '#0E1412'
        }
      }
    },
    result: {
      data: {
        image: {
          id: 'imageId',
          parentBlockId: 'cardId',
          parentOrder: null,
          src: 'https://images.unsplash.com/photo-1474314881477-04c4aac40a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHw3OHx8dGFsa2luZ3xlbnwwfHx8fDE2OTUxNzExNTl8MA&ixlib=rb-4.0.3&q=80&w=1080',
          alt: 'photo-1474314881477-04c4aac40a0e',
          width: 6000,
          height: 4000,
          blurhash: 'L~NTUYkWM{t7~qs:WBofEMjYt7WB',
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
          content: "Let's Connect",
          variant: TypographyVariant.h6,
          __typename: 'TypographyBlock'
        },
        title: {
          id: 'titleId',
          parentBlockId: 'cardId',
          parentOrder: 1,
          align: null,
          color: null,
          content: "From 'hello' to heartfelt conversations",
          variant: TypographyVariant.h3,
          __typename: 'TypographyBlock'
        },
        button1: {
          id: 'button1Id',
          parentBlockId: 'cardId',
          parentOrder: 2,
          label: 'Chat with us',
          buttonVariant: ButtonVariant.contained,
          buttonColor: null,
          size: ButtonSize.large,
          startIconId: null,
          endIconId: null,
          submitEnabled: null,
          action: null,
          __typename: 'ButtonBlock'
        },
        startIcon1: {
          id: 'startIcon1Id',
          parentBlockId: 'button1Id',
          parentOrder: null,
          iconName: IconName.ChatBubbleOutlineRounded,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        endIcon1: {
          id: 'endIcon1Id',
          parentBlockId: 'button1Id',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        button1Update: {
          id: 'button1Id',
          parentBlockId: 'cardId',
          parentOrder: 2,
          label: 'Chat with us',
          buttonVariant: ButtonVariant.contained,
          buttonColor: null,
          size: ButtonSize.large,
          startIconId: 'startIcon1Id',
          endIconId: 'endIcon1Id',
          submitEnabled: null,
          action: null,
          __typename: 'ButtonBlock'
        },
        button2: {
          id: 'button2Id',
          parentBlockId: 'cardId',
          parentOrder: 3,
          label: 'Email us',
          buttonVariant: ButtonVariant.contained,
          buttonColor: null,
          size: ButtonSize.large,
          startIconId: null,
          endIconId: null,
          submitEnabled: null,
          action: null,
          __typename: 'ButtonBlock'
        },
        startIcon2: {
          id: 'startIcon2Id',
          parentBlockId: 'button2Id',
          parentOrder: null,
          iconName: IconName.SendRounded,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        endIcon2: {
          id: 'endIcon2Id',
          parentBlockId: 'button2Id',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        button2Update: {
          id: 'button2Id',
          parentBlockId: 'cardId',
          parentOrder: 3,
          label: 'Email us',
          buttonVariant: ButtonVariant.contained,
          buttonColor: null,
          size: ButtonSize.large,
          startIconId: 'startIcon2Id',
          endIconId: 'endIcon2Id',
          submitEnabled: null,
          action: null,
          __typename: 'ButtonBlock'
        },
        button3: {
          id: 'button3Id',
          parentBlockId: 'cardId',
          parentOrder: 4,
          label: 'More about us',
          buttonVariant: ButtonVariant.text,
          buttonColor: ButtonColor.secondary,
          size: ButtonSize.large,
          startIconId: null,
          endIconId: null,
          submitEnabled: null,
          action: null,
          __typename: 'ButtonBlock'
        },
        startIcon3: {
          id: 'startIcon3Id',
          parentBlockId: 'button3Id',
          parentOrder: null,
          iconName: IconName.ArrowForwardRounded,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        endIcon3: {
          id: 'endIcon3Id',
          parentBlockId: 'button3Id',
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        button3Update: {
          id: 'button3Id',
          parentBlockId: 'cardId',
          parentOrder: 4,
          label: 'More about us',
          buttonVariant: ButtonVariant.text,
          buttonColor: ButtonColor.secondary,
          size: ButtonSize.large,
          startIconId: 'startIcon3Id',
          endIconId: 'endIcon3Id',
          submitEnabled: null,
          action: null,
          __typename: 'ButtonBlock'
        },
        cardBlockUpdate: {
          id: 'cardId',
          parentBlockId: 'stepId',
          parentOrder: 0,
          backgroundColor: '#0E1412',
          coverBlockId: 'imageId',
          themeMode: null,
          themeName: null,
          fullscreen: false,
          backdropBlur: null,
          __typename: 'CardBlock'
        }
      }
    }
  }

  const cardCtaDeleteMock: MockedResponse<
    CardCtaDelete,
    CardCtaDeleteVariables
  > = {
    request: {
      query: CARD_CTA_DELETE,
      variables: {
        imageId: 'imageId',
        subtitleId: 'subtitleId',
        titleId: 'titleId',
        button1Id: 'button1Id',
        startIcon1Id: 'startIcon1Id',
        endIcon1Id: 'endIcon1Id',
        button2Id: 'button2Id',
        startIcon2Id: 'startIcon2Id',
        endIcon2Id: 'endIcon2Id',
        button3Id: 'button3Id',
        startIcon3Id: 'startIcon3Id',
        endIcon3Id: 'endIcon3Id',
        cardId: 'cardId',
        cardInput: { backgroundColor: null }
      }
    },
    result: {
      data: {
        imageDelete: [],
        endIcon3Delete: [],
        startIcon3Delete: [],
        button3Delete: [],
        endIcon2Delete: [],
        startIcon2Delete: [],
        button2Delete: [],
        endIcon1Delete: [],
        startIcon1Delete: [],
        button1Delete: [],
        titleDelete: [],
        subtitleDelete: [],
        cardBlockUpdate: { ...updatedCard, backgroundColor: null }
      }
    }
  }

  const cardCtaRestoreMock: MockedResponse<
    CardCtaRestore,
    CardCtaRestoreVariables
  > = {
    request: {
      query: CARD_CTA_RESTORE,
      variables: {
        imageId: 'imageId',
        subtitleId: 'subtitleId',
        titleId: 'titleId',
        button1Id: 'button1Id',
        startIcon1Id: 'startIcon1Id',
        endIcon1Id: 'endIcon1Id',
        button2Id: 'button2Id',
        startIcon2Id: 'startIcon2Id',
        endIcon2Id: 'endIcon2Id',
        button3Id: 'button3Id',
        startIcon3Id: 'startIcon3Id',
        endIcon3Id: 'endIcon3Id',
        cardId: 'cardId',
        cardInput: { backgroundColor: '#0E1412' }
      }
    },
    result: {
      data: {
        imageRestore: [],
        endIcon3Restore: [],
        startIcon3Restore: [],
        button3Restore: [],
        endIcon2Restore: [],
        startIcon2Restore: [],
        button2Restore: [],
        endIcon1Restore: [],
        startIcon1Restore: [],
        button1Restore: [],
        titleRestore: [],
        subtitleRestore: [],
        cardBlockUpdate: updatedCard
      }
    }
  }

  it('updates card content and updates local cache', async () => {
    mockUuidv4.mockReturnValueOnce('imageId')
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('button1Id')
    mockUuidv4.mockReturnValueOnce('startIcon1Id')
    mockUuidv4.mockReturnValueOnce('endIcon1Id')
    mockUuidv4.mockReturnValueOnce('button2Id')
    mockUuidv4.mockReturnValueOnce('startIcon2Id')
    mockUuidv4.mockReturnValueOnce('endIcon2Id')
    mockUuidv4.mockReturnValueOnce('button3Id')
    mockUuidv4.mockReturnValueOnce('startIcon3Id')
    mockUuidv4.mockReturnValueOnce('endIcon3Id')
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'StepBlock:stepId' }, { __ref: 'CardBlock:cardId' }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const { getByRole } = render(
      <MockedProvider cache={cache} mocks={[cardCtaCreateMock]}>
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardCta />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card CTA Template' }))
    await waitFor(() => {
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'StepBlock:stepId' },
        { __ref: 'CardBlock:cardId' },
        { __ref: 'ImageBlock:imageId' },
        { __ref: 'TypographyBlock:subtitleId' },
        { __ref: 'TypographyBlock:titleId' },
        { __ref: 'ButtonBlock:button1Id' },
        { __ref: 'IconBlock:startIcon1Id' },
        { __ref: 'IconBlock:endIcon1Id' },
        { __ref: 'ButtonBlock:button2Id' },
        { __ref: 'IconBlock:startIcon2Id' },
        { __ref: 'IconBlock:endIcon2Id' },
        { __ref: 'ButtonBlock:button3Id' },
        { __ref: 'IconBlock:startIcon3Id' },
        { __ref: 'IconBlock:endIcon3Id' }
      ])
    })
  })

  it('undoes the creation of the card cta template', async () => {
    mockUuidv4.mockReturnValueOnce('imageId')
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('button1Id')
    mockUuidv4.mockReturnValueOnce('startIcon1Id')
    mockUuidv4.mockReturnValueOnce('endIcon1Id')
    mockUuidv4.mockReturnValueOnce('button2Id')
    mockUuidv4.mockReturnValueOnce('startIcon2Id')
    mockUuidv4.mockReturnValueOnce('endIcon2Id')
    mockUuidv4.mockReturnValueOnce('button3Id')
    mockUuidv4.mockReturnValueOnce('startIcon3Id')
    mockUuidv4.mockReturnValueOnce('endIcon3Id')

    const result = jest.fn().mockResolvedValue(cardCtaCreateMock.result)
    const result2 = jest.fn().mockResolvedValue(cardCtaDeleteMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardCtaCreateMock, result },
          { ...cardCtaDeleteMock, result: result2 }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardCta />
            <CommandUndoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card CTA Template' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('redoes the creation of the card cta template', async () => {
    mockUuidv4.mockReturnValueOnce('imageId')
    mockUuidv4.mockReturnValueOnce('subtitleId')
    mockUuidv4.mockReturnValueOnce('titleId')
    mockUuidv4.mockReturnValueOnce('button1Id')
    mockUuidv4.mockReturnValueOnce('startIcon1Id')
    mockUuidv4.mockReturnValueOnce('endIcon1Id')
    mockUuidv4.mockReturnValueOnce('button2Id')
    mockUuidv4.mockReturnValueOnce('startIcon2Id')
    mockUuidv4.mockReturnValueOnce('endIcon2Id')
    mockUuidv4.mockReturnValueOnce('button3Id')
    mockUuidv4.mockReturnValueOnce('startIcon3Id')
    mockUuidv4.mockReturnValueOnce('endIcon3Id')

    const result = jest.fn().mockResolvedValue(cardCtaCreateMock.result)
    const result2 = jest.fn().mockResolvedValue(cardCtaDeleteMock.result)
    const result3 = jest.fn().mockResolvedValue(cardCtaRestoreMock.result)

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          { ...cardCtaCreateMock, result },
          { ...cardCtaDeleteMock, result: result2 },
          { ...cardCtaRestoreMock, result: result3 }
        ]}
      >
        <JourneyProvider
          value={{ journey: { id: 'journeyId' } as unknown as Journey }}
        >
          <EditorProvider initialState={{ steps: [step] }}>
            <CardCta />
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Card CTA Template' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(result2).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(result3).toHaveBeenCalled())
  })
})
