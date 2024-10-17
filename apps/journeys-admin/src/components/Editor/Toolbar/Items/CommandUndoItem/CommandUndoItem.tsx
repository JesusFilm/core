import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import FlipLeftIcon from '@core/shared/ui/icons/FlipLeft'

import { Item } from '../Item/Item'

interface CommandUndoItemProps {
  variant: ComponentProps<typeof Item>['variant']
}

export function CommandUndoItem({
  variant
}: CommandUndoItemProps): ReactElement {
  const { undo, state } = useCommand()
  const { t } = useTranslation('apps-journeys-admin')

  async function handleClick(): Promise<void> {
    await undo()
  }

  return (
    <Item
      variant={variant}
      label={t('Undo')}
      icon={<FlipLeftIcon />}
      onClick={handleClick}
      ButtonProps={{ disabled: state.undo == null }}
    />
  )
}
