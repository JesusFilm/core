import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import More from '@core/shared/ui/icons/More'

interface ActionButtonProps {
  actions: {
    view?: () => void
    edit?: () => void
    delete?: () => void
  }
}

export function ActionButton({ actions }: ActionButtonProps): ReactElement {
  const t = useTranslations()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div onClick={(e) => e.stopPropagation()} data-testid="ActionButton">
      <IconButton size="small" onClick={handleClick} aria-label="more options">
        <More fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {actions.view != null && (
          <MenuItem onClick={actions.view}>{t('View')}</MenuItem>
        )}
        {actions.edit != null && (
          <MenuItem onClick={actions.edit}>{t('Edit')}</MenuItem>
        )}
        {actions.delete != null && (
          <MenuItem onClick={actions.delete}>{t('Delete')}</MenuItem>
        )}
      </Menu>
    </div>
  )
}
