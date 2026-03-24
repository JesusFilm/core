import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { Item } from '../Item/Item'

interface AIEditorItemProps {
  variant: ComponentProps<typeof Item>['variant']
  closeMenu?: () => void
}

export function AIEditorItem({
  variant,
  closeMenu
}: AIEditorItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const journeyId = router.query.journeyId as string | undefined

  function handleClick(): void {
    if (journeyId == null) return
    void router.push(`/journeys/${journeyId}/ai-chat`)
    closeMenu?.()
  }

  return (
    <Box data-testid="AIEditorItem">
      <Item
        variant={variant}
        label={t('AI Editor')}
        icon={<AutoAwesomeIcon />}
        onClick={handleClick}
        ButtonProps={{ disabled: journeyId == null }}
        MenuItemProps={{ disabled: journeyId == null }}
      />
    </Box>
  )
}
