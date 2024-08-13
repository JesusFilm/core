import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import FlipRightIcon from '@core/shared/ui/icons/FlipRight'

import { Item } from '../Item/Item'

interface CommandRedoItemProps {
  variant: ComponentProps<typeof Item>['variant']
}

export function CommandRedoItem({
  variant
}: CommandRedoItemProps): ReactElement {
  const { redo, state } = useCommand()
  const { t } = useTranslation('apps-journeys-admin')

  async function handleClick(): Promise<void> {
    await redo()
  }

  return (
    <Box data-testid="CommandRedoItem">
      <Item
        variant={variant}
        label={t('Redo')}
        icon={<FlipRightIcon />}
        onClick={handleClick}
        ButtonProps={{ disabled: state.redo == null }}
      />
    </Box>
  )
}
