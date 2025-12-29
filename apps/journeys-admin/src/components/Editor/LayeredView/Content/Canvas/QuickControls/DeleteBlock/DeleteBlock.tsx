import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { MenuItem } from '../../../../../../MenuItem'
import { useBlockDeleteCommand } from '../../../../../utils/useBlockDeleteCommand'

interface DeleteBlockProps {
  variant: 'button' | 'list-item'
  closeMenu?: () => void
  disabled?: boolean
  block?: TreeBlock
}

export function DeleteBlock({
  variant = 'button',
  closeMenu,
  disabled = false,
  block
}: DeleteBlockProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const {
    state: { selectedBlock }
  } = useEditor()
  const currentBlock = block ?? selectedBlock
  const { addBlockDelete } = useBlockDeleteCommand()

  const blockType = currentBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'

  const disableAction = currentBlock == null || disabled

  function handleDeleteBlock(): void {
    if (currentBlock != null) addBlockDelete(currentBlock)
    closeMenu?.()
  }

  return (
    <>
      {variant === 'button' ? (
        <IconButton
          id="delete-block-actions"
          aria-label="Delete Block Actions"
          aria-controls="delete-block-actions"
          aria-haspopup="true"
          aria-expanded="true"
          disabled={disableAction}
          onMouseUp={handleDeleteBlock}
          sx={{
            p: 1
          }}
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
          onClick={handleDeleteBlock}
        />
      )}
    </>
  )
}
