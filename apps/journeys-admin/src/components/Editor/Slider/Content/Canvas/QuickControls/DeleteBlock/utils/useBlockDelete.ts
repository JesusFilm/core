import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { blockDeleteUpdate } from '../../../../../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../../../../../libs/useBlockDeleteMutation'
import getSelected from './getSelected'

interface useBlockDeleteProps {
  block?: TreeBlock
}

export default function useBlockDelete({ block }: useBlockDeleteProps): {
  loading: boolean
  onDeleteBlock: () => Promise<void>
} {
  const { t } = useTranslation('apps-journeys-admin')
  const [blockDelete, { loading }] = useBlockDeleteMutation()
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()
  const {
    state: { selectedBlock, selectedStep, steps },
    dispatch
  } = useEditor()

  const handleDeleteBlock = async (): Promise<void> => {
    if (selectedBlock == null || journey == null || steps == null) return

    const currentBlock = block ?? selectedBlock

    const deletedBlockParentOrder = currentBlock.parentOrder
    const deletedBlockType = currentBlock.__typename
    const stepsBeforeDelete = steps
    const stepBeforeDelete = selectedStep

    await blockDelete(selectedBlock, {
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
        blockDeleteUpdate(currentBlock, data?.blockDelete, cache, journey.id)
      }
    }).then(() => {
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
    })

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

  return { loading, onDeleteBlock: handleDeleteBlock }
}
