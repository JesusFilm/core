import { ReactElement, ReactNode } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import Button from '@mui/material/Button'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import Image from 'next/image'
import taskbarIcon from '../../../public/taskbar-icon.svg'

export interface PageWrapperProps {
  backHref?: string
  showDrawer?: boolean
  title: string
  Menu?: ReactNode
  children?: ReactNode
}

export function PageWrapper({
  backHref,
  title,
  children
}: PageWrapperProps): ReactElement {

  return (
    <>
      <AppBar
        color="primary"
        position="static"
      >
        <Toolbar>
          <Link href={"/"} passHref>
            <IconButton
              edge="start"
              size="small"
              color="inherit"
              sx={{ mr: 2 }}
            >
              <Image
                src={`/${taskbarIcon}`}
                width={32}
                height={32}
                layout="fixed"
                alt="Next Steps Watch"
              />
            </IconButton>
          </Link>
          {backHref != null && (
            <Link href={backHref} passHref>
              <IconButton
                data-testid="backicon"
                edge="start"
                size="small"
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
          <Button color="inherit" href="/videos">Videos</Button>
          <Button color="inherit" href="/countries">Countries</Button>
        </Toolbar>
      </AppBar>
      <Box>{children}</Box>
    </>
  )
}
