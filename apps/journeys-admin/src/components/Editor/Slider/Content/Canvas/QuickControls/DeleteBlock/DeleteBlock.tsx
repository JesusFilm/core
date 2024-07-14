import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { Dialog } from '@core/shared/ui/Dialog'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { blockDeleteUpdate } from '../../../../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../../../../libs/useBlockDeleteMutation'
import { MenuItem } from '../../../../../../MenuItem'

import { ApolloCache, Reference, gql, useMutation } from '@apollo/client'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  BlockRestore,
  BlockRestoreVariables
} from '../../../../../../../../__generated__/BlockRestore'
import getSelected from './utils/getSelected'

interface DeleteBlockProps {
  variant: 'button' | 'list-item'
  closeMenu?: () => void
  disabled?: boolean
  block?: TreeBlock
}

export const BLOCK_RESTORE = gql`
${BLOCK_FIELDS}
mutation BlockRestore($blockRestoreId: ID!) {
  blockRestore(id: $blockRestoreId) {
    id
    ...BlockFields
    ... on StepBlock {
      id
      x
      y
    }
  }
}`

export function DeleteBlock({
  variant = 'button',
  closeMenu,
  disabled = false,
  block
}: DeleteBlockProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [blockDelete, result] = useBlockDeleteMutation()
  const [blockRestore] = useMutation<BlockRestore, BlockRestoreVariables>(
    BLOCK_RESTORE
  )
  const { add } = useCommand()

  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()
  const {
    state: { selectedBlock, selectedStep, steps },
    dispatch
  } = useEditor()
  const currentBlock = block ?? selectedBlock

  const blockType = currentBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'
  const [openDialog, setOpenDialog] = useState(false)
  const handleOpenDialog = (): void => setOpenDialog(true)
  const handleCloseDialog = (): void => {
    setOpenDialog(false)
    closeMenu?.()
  }

  const disableAction = currentBlock == null || disabled || result.loading

  function setEditorState(
    currentBlock: TreeBlock,
    selectedStep: TreeBlock<StepBlock>
  ): void {
    if (currentBlock.__typename === 'StepBlock') {
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.JourneyFlow
      })
      dispatch({
        type: 'SetSelectedStepAction',
        selectedStep: currentBlock
      })
    } else {
      dispatch({
        type: 'SetSelectedStepAction',
        selectedStep: selectedStep
      })
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: currentBlock
      })
    }
  }

  const handleDeleteBlock = async (): Promise<void> => {
    if (
      currentBlock == null ||
      journey == null ||
      steps == null ||
      selectedStep == null
    )
      return

    const deletedBlockParentOrder = currentBlock.parentOrder
    const deletedBlockType = currentBlock.__typename
    const stepsBeforeDelete = steps
    const stepBeforeDelete = selectedStep

    await add({
      parameters: {
        execute: {},
        undo: {}
      },
      async execute() {
        setEditorState(currentBlock, stepBeforeDelete)

        await blockDelete(currentBlock, {
          update(cache, { data }) {
            if (
              data?.blockDelete != null &&
              deletedBlockParentOrder != null &&
              (block == null || block?.id === selectedBlock?.id)
            ) {
              const selected = getSelected({
                parentOrder: deletedBlockParentOrder,
                siblings: data.blockDelete,
                type: deletedBlockType,
                steps: stepsBeforeDelete,
                selectedStep: stepBeforeDelete
              })
              selected != null && dispatch(selected)
            }
            blockDeleteUpdate(
              currentBlock,
              data?.blockDelete,
              cache,
              journey.id
            )
          }
        })
        dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
      },
      async undo() {
        const blockRestoreCacheUpdate = (
          cache: ApolloCache<any>,
          data: BlockRestore,
          id?
        ) => {
          const defaultCacheOptions = {
            fields: {
              blocks(existingBlockRefs: Reference[] = [], { readField }) {
                data.blockRestore.forEach((block) => {
                  const newBlockRef = cache.writeFragment({
                    data: block,
                    fragment: gql`
                        fragment RestoredBlock on Block {
                          id
                        }
                      `
                  })
                  if (
                    existingBlockRefs.some(
                      (ref) => readField('id', ref) === block?.id
                    )
                  ) {
                    return existingBlockRefs
                  }
                  return [...existingBlockRefs, newBlockRef]
                })
              }
            }
          }
          const cacheOptions =
            id != null ? { ...defaultCacheOptions, id } : defaultCacheOptions
          cache.modify(cacheOptions)
        }
        await blockRestore({
          variables: { blockRestoreId: currentBlock?.id },
          notifyOnNetworkStatusChange: true,
          update(cache, { data }) {
            if (data != null) {
              blockRestoreCacheUpdate(
                cache,
                data,
                cache.identify({
                  __typename: 'Journey',
                  id: journey.id
                })
              )
              if (currentBlock.__typename === 'StepBlock')
                blockRestoreCacheUpdate(cache, data)
            }
          }
        })
        setEditorState(currentBlock, stepBeforeDelete)
      }
    })

    handleCloseDialog()

    deletedBlockType !== 'StepBlock'
      ? enqueueSnackbar(t('Block Deleted'), {
          variant: 'success',
          preventDuplicate: true
        })
      : enqueueSnackbar(t('Card Deleted'), {
          variant: 'success',
          preventDuplicate: true
        })
  }

  return (
    <>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        dialogTitle={{ title: t('Delete Card?') }}
        dialogAction={{
          onSubmit: handleDeleteBlock,
          submitLabel: t('Delete'),
          closeLabel: t('Cancel')
        }}
        loading={result.loading}
      >
        <Typography>
          {t('Are you sure you would like to delete this card?')}
        </Typography>
      </Dialog>
      {variant === 'button' ? (
        <IconButton
          id="delete-block-actions"
          aria-label="Delete Block Actions"
          aria-controls="delete-block-actions"
          aria-haspopup="true"
          aria-expanded="true"
          disabled={disableAction}
          onMouseUp={
            blockType === 'Card' ? handleOpenDialog : handleDeleteBlock
          }
        >
          <Trash2Icon />
        </IconButton>
      ) : (
        <MenuItem
          label={t('Delete {{ label }}', {
            label: blockType === 'Card' ? t('Card') : t('Block')
          })}
          icon={<Trash2Icon />}
          disabled={disableAction}
          onMouseUp={
            blockType === 'Card' ? handleOpenDialog : handleDeleteBlock
          }
        />
      )}
    </>
  )
}
