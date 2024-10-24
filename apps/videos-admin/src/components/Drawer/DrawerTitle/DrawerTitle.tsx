import { Box, Toolbar } from '@mui/material'
import { AppBar } from '@mui/material'
import { ReactElement } from 'react'
import { alpha } from '@mui/material/styles'
import { Typography } from '@mui/material'
import { IconButton } from '@mui/material'

import X2Icon from '@core/shared/ui/icons/X2'
import { DRAWER_PADDING_X } from '../constants'

interface DrawerTitleProps {
  title?: string
  onClose?: () => void
}

export function DrawerTitle({
  title,
  onClose
}: DrawerTitleProps): ReactElement {
  return (
    <>
      <AppBar position="static" color="default" elevation={0}>
        {/* <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'center',
            pt: 2,
            backgroundColor: (theme) =>
              alpha(theme.palette.background.default, 0.5)
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 6,
              bgcolor: '#AAACBB',
              borderRadius: '12px'
            }}
          />
        </Box> */}
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 64, md: 48 },
            maxHeight: { xs: 64, md: 48 },
            backgroundColor: 'background.default',
            p: 2,
            px: DRAWER_PADDING_X,
            pt: 6
            // pl: { md: 4 },
            // pr: { xs: 4.5, md: 5 },
            // backgroundColor: (theme) =>
            //   alpha(theme.palette.background.default, 0.5)
          }}
        >
          <Typography variant="h4" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {onClose != null && (
            <IconButton
              aria-label="close-drawer-button"
              onClick={onClose}
              size="small"
              edge="end"
              sx={{ display: 'inline-flex' }}
            >
              <X2Icon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
    </>
  )
}
