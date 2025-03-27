import { MutationResult, useMutation } from '@apollo/client'

import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  addBlocksToCache,
  removeBlocksFromCache,
  restoreBlocksToCache
} from '../utils/cacheUtils'
import {
  TEXT_RESPONSE_WITH_BUTTON_CREATE,
  TEXT_RESPONSE_WITH_BUTTON_DELETE,
  TEXT_RESPONSE_WITH_BUTTON_RESTORE
} from '../utils/mutations'

export function useTextResponseWithButtonMutation(): [
  (
    blocks: {
      textResponseBlock: TextResponseBlock
      buttonBlock: ButtonBlock
    },
    journey: Journey
  ) => void,
  (
    blocks: {
      textResponseBlock: TextResponseBlock
      buttonBlock: ButtonBlock
    },
    journeyId: string
  ) => void,
  (
    blocks: {
      textResponseBlock: TextResponseBlock
      buttonBlock: ButtonBlock
    },
    journey: Journey
  ) => void,
  MutationResult
] {
  const [textResponseWithButtonCreate, createResult] = useMutation(
    TEXT_RESPONSE_WITH_BUTTON_CREATE
  )
  const [textResponseWithButtonDelete] = useMutation(
    TEXT_RESPONSE_WITH_BUTTON_DELETE
  )
  const [textResponseWithButtonRestore] = useMutation(
    TEXT_RESPONSE_WITH_BUTTON_RESTORE
  )

  /** Creates a new text response block with an associated submit button and updates the cache optimistically */
  function wrappedTextResponseWithButtonCreate(
    {
      textResponseBlock,
      buttonBlock
    }: {
      textResponseBlock: TextResponseBlock
      buttonBlock: ButtonBlock
    },
    journey: Journey
  ): void {
    void textResponseWithButtonCreate({
      variables: {
        textResponseInput: {
          id: textResponseBlock.id,
          journeyId: journey.id,
          parentBlockId: textResponseBlock.parentBlockId,
          label: textResponseBlock.label
        },
        buttonInput: {
          id: buttonBlock.id,
          journeyId: journey.id,
          parentBlockId: buttonBlock.parentBlockId,
          label: buttonBlock.label,
          variant: buttonBlock.buttonVariant,
          color: buttonBlock.buttonColor,
          size: buttonBlock.size,
          submitEnabled: true
        },
        iconInput1: {
          id: buttonBlock.startIconId,
          journeyId: journey.id,
          parentBlockId: buttonBlock.id,
          name: null
        },
        iconInput2: {
          id: buttonBlock.endIconId,
          journeyId: journey.id,
          parentBlockId: buttonBlock.id,
          name: null
        },
        buttonId: buttonBlock.id,
        journeyId: journey.id,
        buttonUpdateInput: {
          startIconId: buttonBlock.startIconId,
          endIconId: buttonBlock.endIconId
        }
      },
      optimisticResponse: {
        textResponse: textResponseBlock,
        button: buttonBlock,
        startIcon: {
          id: buttonBlock.startIconId,
          parentBlockId: buttonBlock.id,
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        endIcon: {
          id: buttonBlock.endIconId,
          parentBlockId: buttonBlock.id,
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        buttonUpdate: buttonBlock
      },
      update(cache, { data }) {
        if (data != null) {
          addBlocksToCache(cache, journey.id, data)
        }
      }
    })
  }

  /** Removes a text response block and its associated submit button from the card */
  function wrappedTextResponseWithButtonDelete(
    {
      textResponseBlock,
      buttonBlock
    }: {
      textResponseBlock: TextResponseBlock
      buttonBlock: ButtonBlock
    },
    journeyId: string
  ): void {
    const createdBlocks = [textResponseBlock, buttonBlock]
    void textResponseWithButtonDelete({
      variables: {
        textResponseId: textResponseBlock.id,
        buttonId: buttonBlock.id,
        startIconId: buttonBlock.startIconId,
        endIconId: buttonBlock.endIconId
      },
      optimisticResponse: {
        textResponse: [],
        button: [],
        startIcon: [],
        endIcon: []
      },
      update(cache, { data }) {
        if (data != null) {
          removeBlocksFromCache(cache, journeyId, createdBlocks)
        }
      }
    })
  }

  /** Restores a previously deleted text response block and its associated submit button to the card */
  function wrappedTextResponseWithButtonRestore(
    {
      textResponseBlock,
      buttonBlock
    }: {
      textResponseBlock: TextResponseBlock
      buttonBlock: ButtonBlock
    },
    journey: Journey
  ): void {
    void textResponseWithButtonRestore({
      variables: {
        textResponseId: textResponseBlock.id,
        buttonId: buttonBlock.id,
        startIconId: buttonBlock.startIconId,
        endIconId: buttonBlock.endIconId
      },
      optimisticResponse: {
        textResponse: [textResponseBlock],
        button: [buttonBlock],
        startIcon: [
          {
            id: buttonBlock.startIconId,
            parentBlockId: buttonBlock.id,
            parentOrder: null,
            iconName: null,
            iconSize: null,
            iconColor: null,
            __typename: 'IconBlock'
          }
        ],
        endIcon: [
          {
            id: buttonBlock.endIconId,
            parentBlockId: buttonBlock.id,
            parentOrder: null,
            iconName: null,
            iconSize: null,
            iconColor: null,
            __typename: 'IconBlock'
          }
        ]
      },
      update(cache, { data }) {
        if (data != null) {
          restoreBlocksToCache(cache, journey.id, data)
        }
      }
    })
  }

  return [
    wrappedTextResponseWithButtonCreate,
    wrappedTextResponseWithButtonDelete,
    wrappedTextResponseWithButtonRestore,
    createResult
  ]
}
