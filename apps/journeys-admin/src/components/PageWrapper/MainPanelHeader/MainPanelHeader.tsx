import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { ReactElement, ReactNode } from 'react'

import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'

import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainPanelHeaderProps {
  title?: string
  backHref?: string
  children?: ReactNode
  backHrefHistory?: boolean
  showAppHeader?: boolean
}

export function MainPanelHeader({
  title,
  backHref,
  children,
  backHrefHistory = false,
  showAppHeader = true
}: MainPanelHeaderProps): ReactElement {
  const { toolbar, navbar } = usePageWrapperStyles()
  const router = useRouter()

  return (
    <>
      <AppBar
        color="default"
        sx={{
          position: { xs: 'fixed', md: 'sticky' },
          top: { xs: showAppHeader ? toolbar.height : 0, md: 0 },
          width: '100%',
          left: 0,
          right: 0,
          marginLeft: 0,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
        data-testid="MainPanelHeader"
      >
        <Toolbar
          variant={toolbar.variant}
          sx={{
            p: 0,
            minHeight: 'auto',
            height: '48px'
          }}
        >
          {backHrefHistory ? (
            <Box
              onClick={() => router.back()}
              sx={{
                ml: { xs: 6, sm: 8, md: 10 },
                pl: 0,
                display: 'flex'
              }}
            >
              <IconButton
                data-testid="backHref-history-button"
                size="small"
                color="inherit"
                sx={{
                  mr: 2,
                  ml: 0,
                  px: 0,
                  minWidth: 'auto',
                  py: 1
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            </Box>
          ) : (
            backHref != null && (
              <IconButton
                component={NextLink}
                href={backHref}
                size="small"
                color="inherit"
                sx={{
                  mr: 2,
                  ml: { xs: 6, sm: 8, md: 10 },
                  px: 0,
                  minWidth: 'auto',
                  py: 1
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
            )
          )}
          {title != null && (
            <Typography variant="subtitle1" component="div" noWrap>
              {title}
            </Typography>
          )}
          {children}
        </Toolbar>
      </AppBar>
      {/* Reserves space beneath MainHeader on mobile - allows us to export MainPanel */}
      <Toolbar
        variant={toolbar.variant}
        sx={{ display: { md: 'none' }, height: '48px' }}
      />
    </>
  )
}
