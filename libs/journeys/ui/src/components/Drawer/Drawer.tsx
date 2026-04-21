import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import MuiDrawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode, createContext, useContext } from 'react'

interface DrawerContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DrawerContext = createContext<DrawerContextValue | null>(null)

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

interface DrawerContentProps {
  children: ReactNode
  title?: string
}

export function Drawer({
  open,
  onOpenChange,
  children
}: DrawerProps): ReactElement {
  return (
    <DrawerContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DrawerContext.Provider>
  )
}

export function DrawerContent({
  children,
  title
}: DrawerContentProps): ReactElement {
  const ctx = useContext(DrawerContext)
  if (ctx == null) {
    throw new Error('DrawerContent must be rendered inside <Drawer>')
  }
  const { open, onOpenChange } = ctx

  return (
    <MuiDrawer
      anchor="bottom"
      open={open}
      onClose={() => onOpenChange(false)}
      PaperProps={{
        sx: {
          maxHeight: '85vh',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
      aria-label={title}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          pt: 1.5,
          pb: 1,
          position: 'relative'
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 4,
            borderRadius: 9999,
            bgcolor: 'grey.300'
          }}
        />
        <IconButton
          onClick={() => onOpenChange(false)}
          aria-label="Close chat"
          size="small"
          sx={{ position: 'absolute', top: 4, right: 8 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
      {title != null && (
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, px: 2, pb: 1 }}
        >
          {title}
        </Typography>
      )}
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
    </MuiDrawer>
  )
}
