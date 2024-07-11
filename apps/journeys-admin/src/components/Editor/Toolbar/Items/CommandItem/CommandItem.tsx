import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import ArrowLeftIcon from '@core/shared/ui/icons/ArrowLeft'
import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { Item } from '../Item/Item'

interface CommandItemProps {
  direction: 'undo' | 'redo'
  variant: ComponentProps<typeof Item>['variant']
}

export function CommandItem({
  variant,
  direction
}: CommandItemProps): ReactElement {
  const { undo, redo, state } = useCommand()
  const { t } = useTranslation('apps-journeys-admin')

  async function handleClick(): Promise<void> {
    direction === 'undo' ? await undo() : await redo()
  }

  return (
    <Box data-testid="CommandItem">
      <Item
        variant={variant}
        label={direction === 'undo' ? t('Undo') : t('Redo')}
        icon={direction === 'undo' ? <ArrowLeftIcon /> : <ArrowRightIcon />}
        onClick={handleClick}
        ButtonProps={{
          disabled:
            direction === 'undo' ? state.undo == null : state.redo == null
        }}
      />
    </Box>
  )
}
