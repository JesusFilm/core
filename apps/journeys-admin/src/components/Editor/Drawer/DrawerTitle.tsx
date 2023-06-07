import { useEditor } from '@core/journeys/ui/EditorProvider'
import Close from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

export const DrawerTitle = (): ReactElement => {
  const {
    state: { drawerTitle: title }
  } = useEditor()
  return (
    <>
      {title}
      <IconButton
        sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
        edge="end"
      >
        <Close />
      </IconButton>
    </>
  )
}
