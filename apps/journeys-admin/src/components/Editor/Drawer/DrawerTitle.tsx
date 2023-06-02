import { useEditor } from '@core/journeys/ui/EditorProvider'
import Close from '@mui/icons-material/Close'
import AppBar from '@mui/material/AppBar'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export const DrawerTitle = (): ReactElement => {
  const {
    state: { drawerTitle: title }
  } = useEditor()
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography
          variant="subtitle1"
          noWrap
          component="div"
          sx={{ flexGrow: 1 }}
          data-testid="drawer-title"
        >
          {title}
        </Typography>
        <IconButton
          sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
          edge="end"
        >
          <Close />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
