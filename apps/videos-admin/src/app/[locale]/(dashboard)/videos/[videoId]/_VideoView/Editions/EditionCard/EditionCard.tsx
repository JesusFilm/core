import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement, useState } from 'react'

import More from '@core/shared/ui/icons/More'

import { GetAdminVideo_AdminVideo_VideoEditions } from '../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { ArrayElement } from '../../../../../../../../types/array-types'

interface MenuActions {
  view?: () => void
  edit?: () => void
  delete?: () => void
}

function MenuButton({ actions }: { actions: MenuActions }): ReactElement {
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
    <div onClick={(e) => e.stopPropagation()}>
      <IconButton size="small" onClick={handleClick} aria-label="More options">
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

interface EditionCardProps {
  edition: ArrayElement<GetAdminVideo_AdminVideo_VideoEditions>
  onClick: () => void
  actions: MenuActions
}

export function EditionCard({
  edition,
  onClick,
  actions
}: EditionCardProps): ReactElement {
  const t = useTranslations()

  const menuActions = {
    ...actions,
    delete: edition.videoSubtitles.length === 0 ? actions.delete : undefined
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        minWidth: 200,
        bgcolor: 'background.paper',
        '&:hover': {
          borderColor: 'action.hover',
          cursor: 'pointer'
        }
      }}
      onClick={onClick}
      data-testid="EditionCard"
    >
      <Stack
        sx={{
          p: 1,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h4" sx={{ ml: 1 }}>
          {edition.name}
        </Typography>
        <MenuButton actions={menuActions} />
      </Stack>
      <Box sx={{ p: 2 }}>
        <Typography sx={{ color: 'text.secondary' }}>
          {edition.videoSubtitles.length} {t('subtitles')}
        </Typography>
      </Box>
    </Box>
  )
}
