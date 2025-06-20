import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainPanelBodyProps {
  children: ReactNode
  mainBodyPadding?: boolean
  bottomPanelChildren?: ReactNode
}

export function MainPanelBody({
  children,
  mainBodyPadding = true,
  bottomPanelChildren
}: MainPanelBodyProps): ReactElement {
  const { navbar, bottomPanel } = usePageWrapperStyles()

  const padding = mainBodyPadding
    ? {
        px: { xs: 0, sm: 8 },
        py: { xs: 0, sm: 9 }
      }
    : {}

  return (
    <Stack
      flexGrow={1}
      border="hidden"
      sx={{
        overflow: 'hidden',
        overflowY: 'auto',
        width: 'inherit'
      }}
      data-testid="MainPanelBody"
    >
      {/* MainBody */}
      <Stack
        data-testid="main-body"
        flexGrow={1}
        sx={{
          ...padding,
          mb: {
            xs: 0,
            md: bottomPanelChildren != null ? bottomPanel.height : 0
          }
        }}
      >
        {children}
      </Stack>

      {/* BottomPanel */}
      {bottomPanelChildren != null && (
        <Stack
          data-testid="bottom-panel"
          flexShrink={0}
          sx={{
            width: 'inherit',
            height: bottomPanel.height,
            position: 'fixed',
            bottom: 0,
            left: { xs: 0, md: navbar.width },
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            zIndex: 1
          }}
        >
          {bottomPanelChildren}
        </Stack>
      )}
    </Stack>
  )
}
