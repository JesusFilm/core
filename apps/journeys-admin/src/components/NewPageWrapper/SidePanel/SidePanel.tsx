import { ReactElement, ReactNode } from 'react'
import AppBar from '@mui/material/AppBar'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

interface SidePanelProps {
  children: ReactNode
  title?: string
}

export function SidePanel({ children, title }: SidePanelProps): ReactElement {
  return (
    <Stack
      component="section"
      sx={{
        height: '100%',
        minWidth: { xs: '100%', sm: '327px' },
        backgroundColor: 'background.paper',
        borderLeft: { sm: '1px solid' },
        borderColor: { sm: 'divider' }
      }}
    >
      {/* SidePanelHeader */}
      <AppBar
        data-testid="side-header"
        position="sticky"
        color="default"
        sx={{
          display: { xs: 'none', sm: 'flex' }
        }}
      >
        <Toolbar variant="dense">
          <Typography variant="subtitle1" component="div" noWrap>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SidePanelBody - children must be wrapped in SidePanelContainer */}
      <Stack
        data-testid="side-body"
        border="hidden"
        sx={{ overflow: 'none', overflowY: { sm: 'auto' } }}
      >
        {children}
      </Stack>
    </Stack>
  )
}
