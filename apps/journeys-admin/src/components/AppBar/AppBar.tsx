import { ReactElement, ReactNode } from 'react'
import MuiAppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'

export interface AppBarProps {
  backHref?: string
  showDrawer?: boolean
  title: string
  Menu?: ReactNode
}

export function AppBar({
  backHref,
  showDrawer,
  title,
  Menu
}: AppBarProps): ReactElement {
  return (
    <>
      <MuiAppBar
        position="fixed"
        color="default"
        sx={{
          mr: { sm: showDrawer === true ? '328px' : 0 },
          width: { sm: showDrawer === true ? 'calc(100% - 328px)' : '100%' }
        }}
      >
        <Toolbar>
          {backHref != null && (
            <Link href={backHref} passHref>
              <IconButton
                edge="start"
                size="large"
                color="inherit"
                sx={{ mr: 2 }}
              >
                <ChevronLeftRounded />
              </IconButton>
            </Link>
          )}
          <Typography
            variant="subtitle1"
            component="div"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {title}
          </Typography>
          {Menu != null && Menu}
        </Toolbar>
      </MuiAppBar>
      <Toolbar
        sx={{
          mr: { sm: showDrawer === true ? '328px' : 0 }
        }}
      />
    </>
  )
}
