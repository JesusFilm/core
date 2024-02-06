import AppBar from '@mui/material/AppBar'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface DrawerTitleProps {
  title?: string
}

function DrawerTitle({ title }: DrawerTitleProps): ReactElement {
  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
    </>
  )
}

interface DrawerProps {
  title?: string
  children?: ReactNode
}

export function Drawer({ title, children }: DrawerProps): ReactElement {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: 'divider',
        borderRadius: 0,
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        minWidth: 0
      }}
    >
      <DrawerTitle title={title} />
      {children}
    </Paper>
  )
}
