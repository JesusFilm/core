import { ReactElement, ReactNode } from 'react'
import Link from 'next/link'
import AppBar from '@mui/material/AppBar'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { useRouter } from 'next/router'
import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainBodyContainerProps {
  title: string | ReactNode
  backHref?: string
  menu?: ReactNode
  backHrefHistory?: boolean
}

export function MainPanelHeader({
  title,
  backHref,
  menu,
  backHrefHistory
}: MainBodyContainerProps): ReactElement {
  const { toolbar } = usePageWrapperStyles()
  const router = useRouter()

  return (
    <>
      <AppBar
        color="default"
        sx={{
          position: { xs: 'fixed', sm: 'sticky' },
          top: { xs: toolbar.height, sm: 0 }
        }}
      >
        <Toolbar variant={toolbar.variant}>
          <Stack direction="row" flexGrow={1} alignItems="center">
            {/* {backHref != null && } */}
            {backHrefHistory === true ? (
              <Box onClick={() => router.back()}>
                <IconButton
                  data-testid="backHref-history-button"
                  edge="start"
                  size="small"
                  color="inherit"
                  sx={{ mr: 2 }}
                >
                  <ChevronLeftRounded />
                </IconButton>
              </Box>
            ) : (
              backHref != null && (
                <Link href={backHref} passHref>
                  <IconButton
                    edge="start"
                    size="small"
                    color="inherit"
                    sx={{ mr: 2 }}
                  >
                    <ChevronLeftRounded />
                  </IconButton>
                </Link>
              )
            )}
            <Typography
              variant="subtitle1"
              component="div"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {title}
            </Typography>
            {menu}
          </Stack>
        </Toolbar>
      </AppBar>
      {/* Reserves space beneath MainHeader on mobile - allows us to export MainPanel */}
      <Toolbar variant={toolbar.variant} sx={{ display: { sm: 'none' } }} />
    </>
  )
}
