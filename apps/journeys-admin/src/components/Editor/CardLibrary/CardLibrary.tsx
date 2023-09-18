import Close from '@mui/icons-material/Close'
import AppBar from '@mui/material/AppBar'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import { BlockFields } from '../../../../__generated__/BlockFields'

import { BlankCard } from './Templates/BlankCard'

export const DRAWER_WIDTH = 328
interface CardLibraryProps {
  open: boolean
  onClose?: () => void
  onSelect?: (blocks: BlockFields[]) => void
}

export function CardLibrary({
  open,
  onClose,
  onSelect
}: CardLibraryProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const handleClick = (blocks: BlockFields[]): void => {
    onSelect?.(blocks)
    onClose?.()
  }

  return (
    <>
      <Drawer
        anchor={smUp ? 'right' : 'bottom'}
        variant="temporary"
        open={open}
        elevation={smUp ? 1 : 0}
        hideBackdrop
        sx={{
          left: {
            xs: 0,
            sm: 'unset'
          },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: smUp ? DRAWER_WIDTH : '100%',
            height: '100%',
            display: 'flex'
          }
        }}
      >
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Card Library
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{ display: 'inline-flex' }}
              edge="end"
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Stack spacing={2} direction="column">
          <BlankCard onClick={handleClick} />
          <Divider />
        </Stack>
      </Drawer>
    </>
  )
}
