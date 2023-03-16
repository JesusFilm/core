import { ReactElement, ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainPanelBodyProps {
  children: ReactNode
  bottomPanelChildren?: ReactNode
}

export function MainPanelBody({
  children,
  bottomPanelChildren
}: MainPanelBodyProps): ReactElement {
  const { bottomPanel } = usePageWrapperStyles()

  return (
    <Stack
      flexGrow={1}
      border="hidden"
      sx={{
        overflow: 'none',
        overflowY: { sm: 'auto' }
      }}
    >
      {/* MainBody */}
      <Stack
        data-testid="main-body"
        flexGrow={1}
        sx={{
          // Make optional or remove during cooldown
          // backgroundColor: 'background.paper',
          px: { xs: 6, sm: 8 },
          py: { xs: 6, sm: 9 }
        }}
      >
        {children}
      </Stack>

      {/* BottomPanel */}
      {bottomPanelChildren != null && (
        <Stack
          data-testid="bottom-panel"
          sx={{
            height: bottomPanel.height,
            position: { xs: 'fixed', sm: 'unset' },
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          {bottomPanelChildren}
        </Stack>
      )}
    </Stack>
  )
}
