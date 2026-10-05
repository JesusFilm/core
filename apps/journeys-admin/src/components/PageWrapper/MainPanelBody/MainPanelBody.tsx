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
      data-testid="MainPanelBody"
      sx={{
        flexGrow: 1,
        border: 'hidden',
        overflow: 'hidden',
        overflowY: 'auto',
        width: 'inherit',

        // Hide scrollbar for webkit browsers (Chrome, Safari, Edge)
        '&::-webkit-scrollbar': {
          display: 'none'
        },

        // Hide scrollbar for Firefox
        scrollbarWidth: 'none',

        // Hide scrollbar for IE and Edge
        '-ms-overflow-style': 'none'
      }}
    >
      {/* MainBody */}
      <Stack
        data-testid="main-body"
        sx={{
          flexGrow: 1,
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
          sx={{
            flexShrink: 0,
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
